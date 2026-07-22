
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
    // Validation checks broken down for the UI checklist 
    const requirements = { 
      length: password.length >= 8, 
      uppercase: /[A-Z]/.test(password), 
      lowercase: /[a-z]/.test(password), 
      number: /[0-9]/.test(password), 
      special: /[^A-Za-z0-9]/.test(password), 
      noSpaces: !/\s/.test(password) && password.length > 0, 
    }; 

    const isPasswordValid = Object.values(requirements).every(Boolean);   
    
    //Password does not meet requirements
    if (!isPasswordValid) {
      window.dispatchEvent(
         new CustomEvent("app-notify", { 
           detail: { message: "Password needs to meet 'Specified Criteria'."} 
         })
       );      

      return;
      
    }
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
    // Debugging check: Confirm the URL is loading correctly in the browser
    console.log("Sending request to:", `${process.env.REACT_APP_BACKEND_URL}/auth/register`);

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
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }} 
						required
					/>
          <input 
             id="password" 
             type="password" 
             value={password} 
             onChange={(e) => setPassword(e.target.value)} 
             placeholder="Enter secure password" 
             style={{ width: "100%", padding: "8px", marginBottom: "10px" }} 
             required
           /> 
					<input 
						value={confirmPassword} 
						onChange={e => setConfirmPassword(e.target.value)} 
						placeholder="Re-enter Password" 
						type="password"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }} 
						required
					/>
                {/* Dynamic Labelling Checklist */} 
               <div style={{ fontSize: "0.85rem", background: "#1a1a2e", padding: "10px", borderRadius: "5px" }}> 
                 <p style={{ color: requirements.length ? "#00fff0" : "#ff4d4d", margin: "4px 0" }}> 
                   {requirements.length ? "✓" : "✗"} Minimum 8 characters 
                 </p> 
                 <p style={{ color: requirements.uppercase ? "#00fff0" : "#ff4d4d", margin: "4px 0" }}> 
                   {requirements.uppercase ? "✓" : "✗"} At least one uppercase letter 
                 </p> 
                 <p style={{ color: requirements.lowercase ? "#00fff0" : "#ff4d4d", margin: "4px 0" }}> 
                   {requirements.lowercase ? "✓" : "✗"} At least one lowercase letter 
                 </p> 
                 <p style={{ color: requirements.number ? "#00fff0" : "#ff4d4d", margin: "4px 0" }}> 
                   {requirements.number ? "✓" : "✗"} At least one number 
                 </p> 
                 <p style={{ color: requirements.special ? "#00fff0" : "#ff4d4d", margin: "4px 0" }}> 
                   {requirements.special ? "✓" : "✗"} At least one special character 
                 </p> 
                 <p style={{ color: requirements.noSpaces ? "#00fff0" : "#ff4d4d", margin: "4px 0" }}> 
                   {requirements.noSpaces ? "✓" : "✗"} No spaces allowed 
                 </p> 
               </div> 
					<button type="submit">Register</button>
				</form>
			) : (
				/* Show success message and redirect button if registered */
				<div>
            <p><b style ={{ color: 'white' }} >Registration successful! </b>  </p>
            <p><i style={{ color: 'white' }} >Please check your email (check SPAM folder, if missing in INBOX) to verify your account prior to attempting Login.</i></p>
          
					<button className="generate-btn" onClick={() => navigate("/login")}>
						Go to Login
					</button>
				</div>
			)}
		</div>
	);
}

