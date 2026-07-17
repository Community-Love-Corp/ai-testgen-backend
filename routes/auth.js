/*
Author: Jay Sarna
Last Modified Date: 17 July 2026
Description: Contains authentication routes Login and Register. 
Successful Login results in JWT token creation, which is valid for 15 minutes.
*/


import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();
router.post("/register", async (req, res) =>{
	const { email, password } = req.body;
	
	if (!email || !password)
		return res.status(400).json({ error: "Email and password required." });
	const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
	if (existing){
		return res.status(409).json({ error: "Email already registered" });
	}
	const hash = await bcrypt.hash(password, 10);
	
	const stmt = db.prepare(
		`INSERT INTO users (email, password, createdAt) VALUES (?, ?, ?)`
	);
	const result = stmt.run(email, hash, new Date().toISOString());
	const token = jwt.sign({ userId: result.lastInsertRowid }, process.env.JWT_SECRET);
	res.json({ token });
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	
	const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
	if (!user) return res.status(401).json({ error: "Invalid Credentials" });
	
	const match = await bcrypt.compare(password, user.password);
	if (!match) return res.status(401).json({ error: "Invalid Credentials" });

	const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
	res.json ({ token });
});

export default router;