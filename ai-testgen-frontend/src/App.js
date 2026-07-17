import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Main from "./Main";
import History from "./History";
import "./App.css";
import Login from "./Login";
import Register from "./Register"
import Interceptor from "./utilities/AxiosInterceptor";


// 1. Import Navbar component
import Navbar from "./Navbar"; 

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
      {/* custom Navbar component*/}
      <Navbar />
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
		      	<Route path="/login" element={<Login />} />
	       		<Route path="/register" element={<Register />} />
          </Routes>
          <p>
            © 2026 Jyotirmay Sarna. This work is original. Do not copy, repost, or use without permission. Contact general@systematicdefence.tech for permission.
          </p>
       </div>
    </Router>
 );
}
export default App;

