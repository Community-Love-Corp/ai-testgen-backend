import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Main from "./Main";
import History from "./History";
import "./App.css";
import Login from "./Login";
import Register from "./Register"
import Interceptor from "./utilities/AxiosInterceptor";
// Import React-Toastify dependencies
//import { ToastContainer } from 'react-toastify';
//import 'react-toastify/dist/ReactToastify.css'; 
// Import Navbar component
import Navbar from "./Navbar"; 
import VerifyEmail from "./VerifyEmail"; // 1. IMPORT THE NEW PAGE HERE

function App() {
  // Local state array to manage active notification elements safely inside the lifecycle
  const [toasts, setToasts] = useState([]);

  // Create a global listener on the window layout object so any file can trigger an alert safely
  useEffect(() => {
    const handleGlobalAlert = (e) => {
      const { message, type } = e.detail;
      const id = Date.now();
      
      setToasts((prev) => [...prev, { id, message, type }]);

      // Automatically remove the toast card after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener("app-notify", handleGlobalAlert);
    return () => window.removeEventListener("app-notify", handleGlobalAlert);
  }, []);
return (
//  <>
 /* <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>*/
//  <div className='History'>
    <Router>
      {/* 1. custom Navbar component*/}
      <Navbar />
      {/* Base background layer */}
      <div className="app-content">
        
        {/* NEW LAYOUT BOUNDARY: Restricts the layout container width */}
        <div className="page-container">
          <div className="Logo">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                AI Test Case Generator by ARRJ Harmony New Zealand
              </p>
              <a
                className="App-link"
                href="https://blog.systematicdefence.tech"
                target="_blank"
                rel="noopener noreferrer"
              >
                Purchase Top Quality Research
              </a>
            </header>
          </div>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/history" element={<History />} />
		      	<Route path="/login" element={<Login />} />
	       		<Route path="/register" element={<Register />} />

            {/* 2. ADD THIS PATH INTERACTION LAYER MAP */}
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
          <p>
            © 2026 ARRJ Harmony New Zealand. This work is original. Do not copy, repost, or use without permission. Contact general@systematicdefence.tech for permission.
          </p>
       </div>
     </div> 
       {/* Floating Notification Layout Box Container */}
       <div className="toast-portal-container">
         {toasts.map((t) => (
           <div key={t.id} className={`toast-card alert-${t.type}`}>
             <span className="toast-text">{t.message}</span>
             <button className="toast-close" onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>×</button>
           </div>
         ))}
       </div>
    </Router>
 );
}
export default App;
