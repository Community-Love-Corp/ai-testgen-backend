import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import { toast } from "react-toastify"; // 1. Import toast engine
import { useSearchParams } from "react-router-dom"; // Hook to read URL parameters


export default function Login(){
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
  // Email handling inside Login.js component function:
  const [showResend, setShowResend] = useState(false);

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
    const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    navigate("/");
    //const handleBackendSuccess = () => {
    //  toast.success("Welcome back! Login verified successfully.");
    //};
    // Replacement syntax line for your files:
    window.dispatchEvent(
      new CustomEvent("app-notify", { 
        detail: { message: "Welcome back! Login verified successfully."} 
      })
    );

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
      setShowResend(true); // Toggles visibility of a button to trigger /auth/resend-verification
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

	
	return (
		<form onSubmit={handleLogin}>
			<h2>Login</h2>
			<input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" maxLength={50}       
          pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" /* Ensures text@text.domain structure */
          title="Please enter a valid email address containing an '@' symbol and a domain (e.g. user@example.com)" required/>
			<input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" maxLength={25} required/>
			<button>Login</button>
		</form>
	);
}
