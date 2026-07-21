import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import { toast } from "react-toastify"; // 1. Import toast engine

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isRegistered, setIsRegistered] = useState(false); // Controls rendering the login button
	const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    // Debugging check: Confirm the URL is loading correctly in the browser
    console.log("Sending request to:", `${process.env.REACT_APP_BACKEND_URL}/auth/register`);

    if (password !== confirmPassword) {
      //alert("Passwords do not match");
      //const passwordMatchFailure = () => {
      //  toast.warn("Passwords do not match.");
      //};
      window.dispatchEvent(
         new CustomEvent("app-notify", { 
           detail: { message: "Passwords do not match."} 
         })
       );      

      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, {
        email, password
      });

      // FIX: Check for any successful response (200, 201, etc.)
      if (res.status >= 200 && res.status < 300) {
        console.log("Registration successful!", res.data);
        setIsRegistered(true); 
      } else {
        // Alert yourself if the status is unexpected
        console.warn("Unexpected status code received:", res.status);
      }
    } catch (error) { 

      // Extract the specific error message from the backend response 

      // Falls back to error.message if the network request failed entirely 

      const errorMessage = error.response?.data?.error || error.message; 

      

      window.dispatchEvent( 

        new CustomEvent("app-notify", {  

          detail: { message: errorMessage }  

        }) 

      );       

      

      console.error("Registration failed:", errorMessage); 

    } 
 };
	
	return (
		<div>
			<h2  style={{ color: 'white' }} >Register</h2>
			{/* Show registration form if not registered yet */}
			{!isRegistered ? (
				<form onSubmit={submit}>
					<input 
						value={email} 
						onChange={e => setEmail(e.target.value)} 
						placeholder="Email" 
						type="email"
            maxLength={50}       
            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" /* Ensures text@text.domain structure */
            title="Please enter a valid email address containing an '@' symbol and a domain (e.g. user@example.com)"
						required
					/>
					<input 
						value={password} 
						onChange={e => setPassword(e.target.value)} 
						placeholder="Password" 
						type="password"
						maxLength={25}
            required
					/>
					<input 
						value={confirmPassword} 
						onChange={e => setConfirmPassword(e.target.value)} 
						placeholder="Re-enter Password" 
						type="password"
						required
					/>
					<button type="submit">Register</button>
				</form>
			) : (
				/* Show success message and redirect button if registered */
				<div>
					<p style={{ color: 'white' }} >
            <b>Registration successful! </b>  
            <p style={{ color: 'white' }} >Please check your email (check SPAM folder, if missing in INBOX) to verify your account prior to attempting Login.</p>
          </p>
					<button className="generate-btn" onClick={() => navigate("/login")}>
						Go to Login
					</button>
				</div>
			)}
		</div>
	);
}

