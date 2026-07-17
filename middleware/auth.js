/*
Author: Jay Sarna
Last Modified Date: 17 July 2026
Description: Contains middleware function that verified JWT tokens.
*/


import jwt from "jsonwebtoken";

export default function auth(req, res, next){
	const header = req.headers.authorization;
	if (!header || !header.startsWith("Bearer "))
		return res.status(401).json({ error: "Unauthorised" });
	
	const token = header.split(" ")[1];
	
	try{
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = payload.userId;
		next();
	}catch (err) {
		return res.status(401).json({ error: "Invalid Token" });
	}
}