import React, { useState } from "react"; 
import axios from "axios"; 
 
export default function ForgotPassword() { 
 const [email, setEmail] = useState(""); 
 const [message, setMessage] = useState(""); 
 
 const handleRequest = async (e) => { 
   e.preventDefault(); 
   try { 
    if (!window.grecaptcha) { 
         throw new Error("reCAPTCHA script has not loaded yet."); 
     } 

     // Execute reCAPTCHA v3 using the fixed workflow 
     const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY; 
     if(!siteKey){
       throw new Error("Missing reCAPTCHA Site Key environment variable.");
     }
     // 2. Execute reCAPTCHA v3 with your action name 
     const token = await window.grecaptcha.execute( 
         siteKey, { action: "forgot_password" } 
     ); 
     const emailLowerCase = email.toLowerCase(); 
     // 3. Append the token to your existing Axios payload 
     const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/forgot-password`, {  
         email: emailLowerCase,  
         recaptchaToken: token // Send to backend for verification 
     });  
    console.log(`response 4 Forgot Password: ${res}`);
 
     setMessage(res.data.message); 
   } catch (err) { 
     setMessage(err.response?.data?.error || "An error occurred."); 
   } 
 }; 
 
 return ( 
   <form onSubmit={handleRequest}> 
     <h2 style={{ color: 'white'}}>Forgot Password</h2> 
     <input  
       type="email"  
       placeholder="Enter your email"  
       value={email}  
       onChange={(e) => setEmail(e.target.value)}  
       required  
     /> 
     <button type="submit">Send Reset Link</button> 
     {message && <p><i style={{ color: 'white' }}>{message}</i></p>} 
   </form> 
 ); 
} 
 