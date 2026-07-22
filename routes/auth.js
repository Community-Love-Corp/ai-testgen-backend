/*
Author: Jay Sarna
Last Modified Date: 17 July 2026
Description: Contains authentication routes Login and Register. 
Successful Login results in JWT token creation, which is valid for 15 minutes.
After registeration, user has to click the email in the inbox, for access to app.
*/

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../db.js";
import { sendVerificationEmail } from "../utilities/mailer.js";
import { sendMfaEmail } from "../utilities/mailer.js";
import { sendPasswordResetEmail } from "../utilities/mailer.js";
import verifyRecaptcha from "../utilities/DDOS_Protection.js";


const router = express.Router();

// 1. REGISTER (Protected with Transaction and Email Failure Rollback) 
router.post("/register", async (req, res) => { 
  const { email, password, recaptchaToken } = req.body;
  // Bot Check
  const isHuman = await verifyRecaptcha(recaptchaToken)
  if (!isHuman){
    return res.status(400).json({ error: "Bot activity detected or reCAPTCHA verification failed." });
  }
 
 if (!email || !password) { 
   return res.status(400).json({ error: "Email and password required." }); 
 } 
 
 try { 
   const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email); 
   if (existing) { 
     return res.status(409).json({ error: "Email already registered" }); 
   } 
   // SERVER SIDE PASSWORD SECURITY: Regex Pattern validation to catch any bypass attempts
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!\s*$).{8,}$/; 
   const hasSpaces = /\s/.test(password); 
    
   if (!passwordRegex.test(password) || hasSpaces) { 
    return res.status(400).json({  
      error: "Password does not meet complexity rules: 8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character, and no spaces."  
    }); 
   }
   //const salt = await bcrypt.genSalt(10); 
   //const hash = await bcrypt.hash(password, salt); 
   const hash = await bcrypt.hash(password, 10);
   const token = crypto.randomBytes(32).toString("hex"); 
   const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); 
 
   // Open a reliable SQLite manual transaction block 
   const runTransaction = db.transaction(() => { 
     const stmt = db.prepare(` 
       INSERT INTO users (email, password, createdAt, isVerified, verificationToken, verificationTokenExpires)   
       VALUES (?, ?, ?, 0, ?, ?) 
     `); 
     return stmt.run(email, hash, new Date().toISOString(), token, expires); 
   }); 
 
   // Execute the database write 
   const result = runTransaction(); 
 
   try { 
     // Trigger SMTP mail run safely 
     await sendVerificationEmail(email, token); 
      
     res.status(201).json({ message: "Registration successful. Please check your email to verify your account." }); 
   } catch (emailError) { 
     console.error("SMTP Delivery Failed, rolling back database user entry:", emailError); 
      
     // Explicitly delete the unverified user row so they can try registering again 
     db.prepare("DELETE FROM users WHERE email = ?").run(email); 
      
     res.status(502).json({ error: "Failed to send verification email. Please try registering again." }); 
   } 
 
 } catch (error) { 
   console.error("Registration route error:", error); 
   res.status(500).json({ error: "Internal server registry breakdown." }); 
 } 
}); 
 

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  // DEBUG 1: Log incoming request details
  console.log("\n--- [DEBUG] VERIFY-EMAIL ENDPOINT HIT ---");
  console.log(`Received Token from URL: [${token}]`);
  console.log(`Token Length: ${token ? token.length : 0} characters`);
  
  if (!token) {
    console.log("Result: Aborted. Token query parameter is missing.");
    return res.status(400).json({ error: "Verification token missing." });
  }

  try {
    // DEBUG 2: Inspect what the backend database *actually* contains right now
    console.log("Fetching all pending unverified users currently visible to this server instance...");
    const currentUnverified = db.prepare("SELECT id, email, verificationToken FROM users WHERE isVerified = 0").all();
    console.log("Database Contents (Unverified Users):", JSON.stringify(currentUnverified, null, 2));

    // Execute the target verification check
    console.log(`Executing: SELECT * FROM users WHERE verificationToken = '${token}'`);
    const user = db.prepare("SELECT * FROM users WHERE verificationToken = ?").get(token);
    
    // DEBUG 3: Log what the query found
    if (!user) {
      console.log(`Result: FAILED. No matching user found for token: [${token}]`);
      console.log("-----------------------------------------\n");
      return res.status(400).json({ error: "Invalid verification token." });
    }

    console.log(`Result: SUCCESS! Found matching user: ${user.email} (ID: ${user.id})`);
    console.log(`Token Expiry Timestamp in DB: ${user.verificationTokenExpires}`);
    console.log(`Current Server Timestamp:     ${new Date().toISOString()}`);

    if (new Date() > new Date(user.verificationTokenExpires)) {
      console.log("Result: FAILED. The token has expired.");
      console.log("-----------------------------------------\n");
      return res.status(400).json({ error: "Verification link expired. Please request a new one." });
    }

    // Clear verification tokens and set active flag
    db.prepare(`
      UPDATE users 
      SET isVerified = 1, verificationToken = NULL, verificationTokenExpires = NULL 
      WHERE id = ?
    `).run(user.id);

    console.log(`Account ${user.email} successfully marked as verified.`);
    console.log("-----------------------------------------\n");
    res.json({ message: "Email successfully verified! You can now log in." });

  } catch (error) {
    console.error("CRITICAL ERROR inside /verify-email route:", error);
    console.log("-----------------------------------------\n");
    res.status(500).json({ error: "Verification process failed." });
  }
});


// 3. RESEND LINK ENDPOINT (New: For unverified accounts manually seeking links)
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(404).json({ error: "Account not found." });
    if (user.isVerified === 1) return res.status(400).json({ error: "Account already verified." });

    const newToken = crypto.randomBytes(32).toString("hex");
    const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      UPDATE users SET verificationToken = ?, verificationTokenExpires = ? WHERE id = ?
    `).run(newToken, newExpires, user.id);

    await sendVerificationEmail(email, newToken);
    res.json({ message: "A new verification email has been sent." });
  } catch (error) {
    res.status(500).json({ error: "Failed to resend confirmation email." });
  }
});

// 4. LOGIN (Updated to enforce verification validation checks)
router.post("/login", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  // Bot Check
  const isHuman = await verifyRecaptcha(recaptchaToken)
  if (!isHuman){
    return res.status(400).json({ error: "Bot activity detected or reCAPTCHA verification failed." });
  }
 
  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(411).json({ error: "Invalid Credentials" }); // Avoid revealing account existence distinctions

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid Credentials" });

    // ENFORCE BLOCKER: Check if flag is verified
    if (user.isVerified !== 1) {
      return res.status(403).json({ 
        error: "Your email address is unverified.", 
        requiresVerification: true 
      });
    }

      // Generate a secure 6-digit MFA Code 
      const mfaCode = Math.floor(100000 + Math.random() * 900000).toString(); 
      const mfaExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5-minute expiry windows 

      // Save MFA data to the live volume database 
      db.prepare("UPDATE users SET mfaCode = ?, mfaExpires = ? WHERE id = ?").run(mfaCode, mfaExpires, user.id); 

      // Dispatch MFA Email 
      try { 
        await sendMfaEmail(user.email, mfaCode); 
      } catch (mailErr) { 
        console.error("MFA Dispatch failed:", mailErr); 
        return res.status(502).json({ error: "MFA Gateway down. Please retry." }); 
      } 

      // Tell frontend password is good, but MFA verification is now required 
      res.status(200).json({ requiresMfa: true, email: user.email }); 
    
      /* Code without MFA
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ token });
    */

    } catch (error) {
    res.status(500).json({ error: "Login interface issue." });
  }
});

 
// 2. PHASE 2: VERIFY MFA CODE & GENERATE TOKEN 
router.post("/verify-mfa", async (req, res) => { 
 const { email, code } = req.body; 
 
 try { 
   const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email); 
   if (!user) return res.status(401).json({ error: "Authentication failed." }); 
 
   const now = new Date().toISOString(); 
 
   // Enforce matching token values and active non-expired windows 
   if (!user.mfaCode || user.mfaCode !== code || now > user.mfaExpires) { 
     return res.status(401).json({ error: "Invalid or expired verification security code." }); 
   } 
 
   // Clean out used MFA data fields instantly 
   db.prepare("UPDATE users SET mfaCode = NULL, mfaExpires = NULL WHERE id = ?").run(user.id); 
 
   // Issue the operational production app access JWT 
   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' }); 
   res.json({ token }); 
 
 } catch (error) { 
   res.status(500).json({ error: "Verification system error." }); 
 } 
}); 

// --- STEP 1: REQUEST PASSWORD RESET ---  
router.post("/forgot-password", async (req, res) => {  
 const { email, recaptchaToken } = req.body;  
 
 // Protect endpoint with reCAPTCHA v3  
 const isHuman = await verifyRecaptcha(recaptchaToken);  
 if (!isHuman) {  
   return res.status(400).json({ error: "Bot activity detected or recaptcha verification failed." });  
 }  
 
 const normalizedEmail = email.toLowerCase();  
 
 try { 
   // 1. Look up the user in SQLite using better-sqlite3 syntax 
   const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);  
 
   // Security best practice: Don't reveal if an email doesn't exist to prevent enumeration  
   if (!user) {  
     return res.json({ message: "If that email exists, a reset link has been sent." });  
   }  
 
   // Generate secure token and expiration (1 hour stored as ISO string or timestamp)  
   const resetToken = crypto.randomBytes(32).toString("hex");  
    
   // Using an ISO string for consistent datetime comparisons across your database entries 
   const resetPasswordExpires = new Date(Date.now() + 3600000).toISOString();  
 
   // 2. Save the token to the SQLite database synchronously 
   db.prepare("UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?") 
     .run(resetToken, resetPasswordExpires, normalizedEmail); 
 
   // Create the reset link pointing to your React frontend route  
   const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;  
    
   // Send email logic goes here (e.g., using Nodemailer, SendGrid, or Resend)  
   console.log(`[EMAIL SIMULATION] Send to ${normalizedEmail}: Click here to reset ${resetUrl}`);  
   // Dispatch MFA Email 
   try { 
     await sendPasswordResetEmail(normalizedEmail, resetUrl); 
   } catch (mailErr) { 
     console.error("MFA Dispatch failed:", mailErr); 
     return res.status(502).json({ error: "MFA Gateway down. Please retry." }); 
   } 

   
   
   return res.json({ message: "If that email exists, a reset link has been sent." });  
 
 } catch (error) { 
   console.error("Forgot password route error:", error); 
   return res.status(500).json({ error: "Internal server error handling reset request." }); 
 } 
});  
 
// --- STEP 2: EXECUTE PASSWORD RESET ---  
router.post("/reset-password", async (req, res) => {  
 const { token, password } = req.body;  
 if (!token || !password) {  
   return res.status(400).json({ error: "Missing required parameters." });  
 }  
 
 const currentTime = new Date().toISOString();  
 
 try { 
   // 1. Find user with matching, unexpired token using better-sqlite3 syntax 
   const user = db.prepare("SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?") 
                  .get(token, currentTime);  
 
   if (!user) {  
     return res.status(400).json({ error: "Password reset token is invalid or has expired." });  
   }  
 
   // Hash new password  
   const hashedPassword = await bcrypt.hash(password, 10);  
 
   // 2. Update password and clear reset token fields synchronously 
   db.prepare("UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?") 
     .run(hashedPassword, user.id);  
 
   return res.json({ message: "Password updated successfully! You can now log in." }); 
 
 } catch (error) {  
   console.error("Reset password database or encryption error:", error);  
   return res.status(500).json({ error: "Failed to update password." });  
 }  
});
export default router;
