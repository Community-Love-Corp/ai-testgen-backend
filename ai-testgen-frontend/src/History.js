import React, { useEffect, useState } from "react";
import axios from "axios";

function History(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/history`)
//    axios.get("http://localhost:3001/history")  
    .then(res => {
      console.log("History response: ", res.data);
      setItems(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("History error:", err);
    });
  }, []);
  
  return (
  <div className="container">
    <h1>History</h1>
      {items.map(item => (
        <div key={item.id} className="results">
          <h2>User Story</h2>
          <p>{item.userStory}</p>
          
          <h3>Clarified Requirement</h3>
          <p>{item.result.clarifiedRequirement}</p>
          
          <h3>Functional Tests</h3>
          <u1>
            {item.result.functionalTests.map((t, i) => (
              <li key={i}>{t.title}: {t.expected}</li>
            ))}
          </u1>
          
          <p><em>Generated at: {item.createdAt}</em></p>
        </div>
      ))}
  </div>
  );
}

export default History;     
