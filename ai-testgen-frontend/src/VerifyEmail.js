import React, { useEffect, useState, useRef } from "react"; // 1. IMPORT useRef
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("loading"); // loading, success, or error
  const [message, setMessage] = useState("Verifying your email address...");

  // 2. CREATE A RUN-ONCE TRACKING FLAG
  const hasRun = useRef(false);

  useEffect(() => {
    // If this hook has already fired once, block any further execution loops
    if (hasRun.current) return;

    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification request. Missing unique security token.");
        return;
      }
      
      // Lock the door IMMEDIATELY before running the Axios operation
      hasRun.current = true;

      try {
        // Send background network request directly to your Node.js backend port
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
        const res = await axios.get(`${backendUrl}/auth/verify-email?token=${token}`);

        if (res.status === 200) {
          setStatus("success");
          setMessage(res.data.message || "Email successfully verified!");
          
          // Custom clean notification event from our layout engine
          window.dispatchEvent(
            new CustomEvent("app-notify", { 
              detail: { message: "Account activated! You can now log in.", type: "success" } 
            })
          );
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.error || "Verification failed. Link may be expired.");
      }
    };

    verifyToken();
    // Safely handles context mounts now

}, [searchParams]); 
return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <h2>Account Verification</h2>
      
      {status === "loading" && (
        <div className="loading-spinner-text">
          <p>⚙️ {message}</p>
        </div>
      )}

      {status === "success" && (
        <div>
          <p style={{ color: "#2a9d8f", fontSize: "1.1rem" }}>✓ {message}</p>
          <button 
            onClick={() => navigate("/login")} 
            style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
          >
            Go to Login
          </button>
        </div>
      )}

      {status === "error" && (
        <div>
          <p style={{ color: "#e63946", fontSize: "1.1rem" }}>❌ {message}</p>
          <button 
            onClick={() => navigate("/login")} 
            style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
          >
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
}

