import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login(){
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const submit = async (e) => {
		e.preventDefault();
		const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
			email, password
		});
		localStorage.setItem("token", res.data.token);
		navigate("/history");
	};
	
	return (
		<form onSubmit={submit}>
			<h2>Login</h2>
			<input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
			<input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"/>
			<button>Login</button>
		</form>
	);
}