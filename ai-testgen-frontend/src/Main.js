import logo from './logo.svg';
import './App.css';
import React, { useState } from "react";
import axios from "axios";
//import { useNavigate } from "react-router-dom";

function Main() {
  const [userStory, setUserStory] = useState("");
  const [result, setResult] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 // const navigate = useNavigate();
    
  const generateTests = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      const res = await axios.post( `${process.env.REACT_APP_BACKEND_URL}/generate-tests`, {
        userStory,  
      });
      setResult(res.data);
    }catch (err) {
      setError("Failed to generate test cases.");
    }
    
    setLoading(false);
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
           
      <p><button onClick={() => window.location.href = "/history"}>
             View History
           </button></p> 
           {/*
      <button className='generate-btn' onClick={() => navigate("/history")}>
        Show History
      </button>
           */}
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

