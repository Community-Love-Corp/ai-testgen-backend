import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import { toast } from "react-toastify"; // 1. Import toast engine
import { useSearchParams } from "react-router-dom"; // Hook to read URL parameters
//import { useGoogleReCaptcha } from "react-google-recaptcha-v3"; 

export default function Login(){
  //const { executeRecaptcha } = useGoogleReCaptcha();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
  // Email handling inside Login.js component function:
  const [showResendBtn, setShowResendBtn] = useState(false);
    const [isResending, setIsResending] = useState(false);

  //NEW: Added state for MFA tracking and input
  const [step, setStep] = useState("login");
  const [mfaCodeInput, setMfaCodeInput] = useState("");
  
	const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check if the user was kicked here by the Axios Interceptor
    if (searchParams.get("expired") === "true") {
      //toast.error("Your session has expired. Please log in again.");
      // Replacement syntax line for your files:
      window.dispatchEvent(
        new CustomEvent("app-notify", { 
          detail: { message: "Your session has expired. Please log in again.", type: "error" } 
        })
      );

      // Clean up the URL parameter so the message doesn't keep popping up on manual refreshes
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);
/*	const submit = async (e) => {
		e.preventDefault();
		const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
			email, password
		});
		localStorage.setItem("token", res.data.token);
		navigate("/history");
	};*/
  

  const handleLogin = async (e) => {
  e.preventDefault();
  try { 
    
    /*if(!executeRecaptcha){
      throw new Error("reCAPTCHA has not initialised yet.")
    }*/
    // Execute reCAPTCHA using the hook function
    //const recaptchaToken = await executeRecaptcha('login');
    
      // 1. Ensure grecaptcha is fully loaded on the window object 
      if (!window.grecaptcha) { 
          throw new Error("reCAPTCHA script has not loaded yet."); 
      } 
      
      const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
      if(!siteKey){
        throw new Error("Missing reCAPTCHA Site Key environment variable.");
      }
      // 2. Execute reCAPTCHA v3 with your action name 
      const token = await window.grecaptcha.execute( 
          siteKey, { action: "login" } 
      ); 

      // 3. Append the token to your existing Axios payload 
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {  
          email,  
          password, 
          recaptchaToken: token // Send to backend for verification 
      });  

      if (res.data.requiresMfa){
        //Toggle a local flag state to render the OTP verification screen
        setStep("mfa");
        
        window.dispatchEvent(
          new CustomEvent("app-notify", { 
            detail: { message: "An Email with 6 digit Code has been sent."} 
          })
        );
  
      } else if (res.data.token){
        localStorage.setItem("token", res.data.token);
        navigate("/");
        
        window.dispatchEvent(
          new CustomEvent("app-notify", { 
            detail: { message: "Welcome back! Login verified successfully."} 
          })
        );
  
      }
      //const handleBackendSuccess = () => {
      //  toast.success("Welcome back! Login verified successfully.");
      //};
      // Replacement syntax line for your files:
  
  } catch (err) {
    if (err.response && err.response.status === 403 && err.response.data.requiresVerification) {
      //alert("Please verify your email before logging in.");
      //const handleEmailVerificationPrompt = () => {
      //  toast.success("Please verify your email before logging in.");
      //};
      window.dispatchEvent(
        new CustomEvent("app-notify", { 
          detail: { message: "Please verify your email before logging in."} 
        })
      );      
      setShowResendBtn(true); // Toggles visibility of a button to trigger /auth/resend-verification
    } else {
      //alert(err.response?.data?.error || "Login failed");
        //const handleBackendFailure = () => {
        //toast.error(err.response?.data?.error || "Login failed.");
      //};
      window.dispatchEvent(
        new CustomEvent("app-notify", { 
          detail: { message: err.response?.data?.error || "Login failed."} 
        })
      );      
    }
  }
};

const handleMfaSubmit = async (e) => { 
 e.preventDefault(); 
 try { 
   const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/verify-mfa`, { email, code: mfaCodeInput }); 
   localStorage.setItem("token", res.data.token); 
   window.dispatchEvent(
      new CustomEvent( "app-notify", {
          detail: { message: "MFA verified successfully! Welcome. "}  
      }) 
   );
   navigate("/dashboard"); 
 } catch (err) { 
   // Show validation error feedback 
   window.dispatchEvent(
      new CustomEvent( "app-notify", {
          detail: { message: err.response?.data?.error || "Invalid MFA code.", type: "error"}  
      }) 
   );

 } 
};



const handleMfaResendRequest = async () => { 

    if (isResending) return; 

    setIsResending(true); 

    try { 

        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/resend-verification`, { email }); 

        window.dispatchEvent(new CustomEvent("app-notify", { detail: { message: "Link resent!" } })); 

    } catch (err) { 

        window.dispatchEvent(new CustomEvent("app-notify", { detail: { message: "Failed to resend.", type: "error" } })); 

    } finally { 

        setIsResending(false); 

    } 

}; 

  


// CONDITIONAL RENDERING: Render MFA view if step is "mfa" 
if (step === "mfa") { 
  return ( 
    <form onSubmit={handleMfaSubmit}> 
      <h2 style={{ color: 'white' }}>MFA Verification</h2> 
      <p style={{ color: 'white' }}>Please enter the 6-digit code sent to your Inbox (Check Spam Folder too).</p> 
      <input  
        value={mfaCodeInput}  
        onChange={e => setMfaCodeInput(e.target.value)}  
        placeholder="6-Digit Code"  
        maxLength={6}   
        pattern="\d{6}"  
        title="Please enter a 6-digit numeric verification code"  
        required 
      /> 
      <button type="submit">Verify Code</button> 
      <button type="button" onClick={() => setStep("login")} style={{ marginLeft: '10px' }}> 
        Back to Login 
      </button> 
    </form> 
  ); 
} 


  
// Inside your JSX return block: 

	
	return (
		<form onSubmit={handleLogin}>
			<h2  style={{ color: 'white' }} >Login</h2>
      <p><h4  style={{ color: 'white' }} >Email: </h4><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" maxLength={50}       
          pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" /* Ensures text@text.domain structure */
          title="Please enter a valid email address containing an '@' symbol and a domain (e.g. user@example.com)" required/></p>
          <p><h4  style={{ color: 'white' }} >Password: </h4><input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" maxLength={25} required/></p>
      <p><button className="generate-btn" onClick={() => navigate("/forgot-password")}>Forgot Password</button></p>
      <p><button className="generate-btn" type="submit">Login</button></p>
      {showResendBtn && ( 
          <button  
              type="button"  
              style={{ marginLeft: "10px" }}  
              onClick={handleMfaResendRequest} 
              disabled={isResending} 
          > 
              {isResending ? "Sending..." : "Resend Verification Link"} 
          </button> 
      )} 
		</form>
	);
}
