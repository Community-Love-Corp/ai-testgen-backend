import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Main from "./Main";
import History from "./History";
import "./App.css";

function App() {
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
      <div className="Logo">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            AI Test Case Generator by Jyotirmay sarna
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
      <div className='App'>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/history" element={<History />} />
          </Routes>
          <p>
            © 2026 Jyotirmay Sarna. This work is original. Do not copy, repost, or use without permission. Contact general@systematicdefence.tech for permission.
          </p>
       </div>
    </Router>
//  </div>
//  </>
  );
}
export default App;

