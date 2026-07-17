import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      alert("Passwords do not match");
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
      // Alerts your browser UI if the network request fails completely
      alert("Network or Server Error. Check browser console.");
      console.error("Registration failed:", error.response?.data?.message || error.message);
    }
  };
	
	return (
		<div>
			<h2>Register</h2>
			{/* Show registration form if not registered yet */}
			{!isRegistered ? (
				<form onSubmit={submit}>
					<input 
						value={email} 
						onChange={e => setEmail(e.target.value)} 
						placeholder="Email" 
						type="email"
						required
					/>
					<input 
						value={password} 
						onChange={e => setPassword(e.target.value)} 
						placeholder="Password" 
						type="password"
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
					<p>Registration successful! Please log in.</p>
					<button className="generate-btn" onClick={() => navigate("/login")}>
						Go to Login
					</button>
				</div>
			)}
		</div>
	);
}
