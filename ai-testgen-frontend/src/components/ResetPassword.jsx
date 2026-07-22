import React, { useState } from "react";   
import { useSearchParams, useNavigate } from "react-router-dom";   
import axios from "axios";   
 
export default function ResetPassword() {   
 const [password, setPassword] = useState("");   
 const [confirmPassword, setConfirmPassword] = useState("");   
 const [message, setMessage] = useState("");   
 const [searchParams] = useSearchParams();   
 const navigate = useNavigate();   
 
 const token = searchParams.get("token");   
 
 const requirements = {   
   length: password.length >= 8,   
   uppercase: /[A-Z]/.test(password),   
   lowercase: /[a-z]/.test(password),   
   number: /[0-9]/.test(password),   
   special: /[^A-Za-z0-9]/.test(password),   
   noSpaces: !/\s/.test(password) && password.length > 0,   
 };   
 
 const isPasswordValid = Object.values(requirements).every(Boolean); 
 
 const handleReset = async (e) => {   
   e.preventDefault();   
    
   if (!isPasswordValid) { 
     setMessage("Password does not meet validation rules."); 
     return; 
   } 
 
   if (password !== confirmPassword) {   
     setMessage("Passwords do not match.");   
     return;   
   }   
 
   try {   
     const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/reset-password`, {   
       token,   
       password   
     });   
     setMessage(res.data.message);   
     setTimeout(() => navigate("/login"), 3000);   
   } catch (err) {   
     setMessage(err.response?.data?.error || "Failed to update password.");   
   }   
 };   
 
 return (   
   <form onSubmit={handleReset} style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>   
     <h2>Set New Password</h2>   
      
     <div style={{ marginBottom: "10px" }}> 
       <input   
         id="password"   
         type="password"   
         value={password}   
         onChange={(e) => setPassword(e.target.value)}   
         placeholder="Enter secure password"   
         style={{ width: "100%", padding: "8px" }}   
         required  
       />   
     </div> 
 
     <div style={{ marginBottom: "15px" }}> 
       {/* FIX: Properly closed the second input element */} 
       <input   
         id="confirmPassword" 
         type="password"  
         value={confirmPassword}   
         onChange={(e) => setConfirmPassword(e.target.value)}   
         placeholder="Re-enter Password"   
         style={{ width: "100%", padding: "8px" }}   
         required 
       />   
     </div> 
 
     {/* Visual Checklist for password rules */} 
     <div style={{ fontSize: "13px", marginBottom: "15px", textAlign: "left" }}> 
       <p style={{ color: requirements.length ? "green" : "red" }}>✔ At least 8 characters</p> 
       <p style={{ color: requirements.uppercase ? "green" : "red" }}>✔ One uppercase letter</p> 
       <p style={{ color: requirements.lowercase ? "green" : "red" }}>✔ One lowercase letter</p> 
       <p style={{ color: requirements.number ? "green" : "red" }}>✔ One number</p> 
       <p style={{ color: requirements.special ? "green" : "red" }}>✔ One special character</p> 
     </div> 
 
     <button type="submit" disabled={!isPasswordValid} style={{ width: "100%", padding: "10px" }}> 
       Reset Password 
     </button> 
 
     {message && <p style={{ marginTop: "15px", fontWeight: "bold" }}>{message}</p>} 
   </form>   
 ); 
} // FIX: Restored missing closing brackets 
