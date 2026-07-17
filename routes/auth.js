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

const router = express.Router();

// 1. REGISTER (Updated with validation fix and email trigger)
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required." });
  }

  try {
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    
    // Generate secure token valid for 24 hours
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (email, password, createdAt, isVerified, verificationToken, verificationTokenExpires) 
      VALUES (?, ?, ?, 0, ?, ?)
    `);
    stmt.run(email, hash, new Date().toISOString(), token, expires);

    // Trigger SMTP mail run safely
    await sendVerificationEmail(email, token);

    res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
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
  const { email, password } = req.body;

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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login interface issue." });
  }
});

export default router;
