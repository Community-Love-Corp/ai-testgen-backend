import React, { useEffect, useState } from "react";
import axios from "axios";

function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuthError("Please login to view your history.");
      setLoading(false);
      return;
    }

    // Corrected the closing parenthesis to include the headers object
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log("History response: ", res.data);
      setItems(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("History error:", err);
      setLoading(false);
    });
  }, []);
  
  // Render loading state
  if (loading) {
    return <div className="container"><p>Loading history...</p></div>;
  }

  // Render auth error message if not logged in
  if (authError) {
    return <div className="container"><p>{authError}</p></div>;
  }

  return (
    <div className="container">
      <h1>History</h1>
      {items.length === 0 ? (
        <p>No history found.</p>
      ) : (
        items.map(item => (
          <div key={item.id || item._id} className="results">
            <h2>User Story</h2>
            <p>{item.userStory}</p>
            
            {/* Added optional chaining (?.) in case result object is missing */}
            <h3>Clarified Requirement</h3>
            <p>{item.result?.clarifiedRequirement}</p>
            
            <h3>Functional Tests</h3>
            <ul> {/* Fixed typo from <u1> to <ul> */}
              {item.result?.functionalTests?.map((t, i) => (
                <li key={i}><strong>{t.title}:</strong> {t.expected}</li>
              ))}
            </ul>
            
            <p><em>Generated at: {new Date(item.createdAt).toLocaleString()}</em></p>
          </div>
        ))
      )}
    </div>
  );
}

export default History;
