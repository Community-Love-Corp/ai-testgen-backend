import logo from './logo.svg';
import './App.css';
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Main() {
  const [userStory, setUserStory] = useState("");
  const [result, setResult] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
    
  // Helper function to check if the user has a token
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please click the Login button to log in first.");
      return false;
    }
    return token;
  };

  const generateTests = async () => {
    // 1. Check authentication status
    const token = checkAuth();
    if (!token) return; // Stop execution if not logged in

    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      // 2. Pass the token in the Authorization header to secure the backend route
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/generate-tests`, 
        { userStory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setError("Failed to generate test cases.");
    }
    
    setLoading(false);
  };

  const handleHistoryClick = () => {
    // Check authentication status before navigating
    if (checkAuth()) {
      navigate("/history");
    }
  };

  return (
    <div className="container">
      <h1>AI Test Case Generator</h1>

      <textarea
        className="input-box"
        placeholder="Enter your user story..."
        value={userStory}
        onChange={(e) => setUserStory(e.target.value)}
      />
      
      <button className="generate-btn" onClick={generateTests}>
        Generate Test Cases
      </button>
      {loading && <p className="loading">Generating...</p>}
      {error && <p className="error">{error}</p>}
           
      <p>
        <button className="generate-btn" onClick={handleHistoryClick}>
          Show History
        </button>
      </p>
      {result && (
        <div className="results">
          <h2>Clarified Requirement</h2>
          <p>{result.clarifiedRequirement}</p>

          <h2>Functional Tests</h2>
          <ul>
            {result.functionalTests.map((t, i) => (
              <li key={i}>
                <strong>{t.title}</strong>: {t.expected}
              </li>
            ))}
          </ul>

          <h2>Edge Cases</h2>
          <ul>
            {result.edgeCases.map((t, i) => (
              <li key={i}>
                <strong>{t.title}</strong>: {t.expected}
              </li>
            ))}
          </ul>

          <h2>API Tests</h2>
          <ul>
            {result.apiTests.map((t, i) => (
              <li key={i}>
                {t.method} {t.endpoint} → {t.expectedStatus}
              </li>
            ))}
          </ul>

          <h2>Acceptance Criteria</h2>
          <ul>
            {result.acceptanceCriteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Main;
