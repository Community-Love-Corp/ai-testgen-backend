import request from "supertest";
import { app } from "../server.js";//if you exported app

//const request = require("supertest");
//const app = require("../server.js");

console.log("DEBUG - What is app?", app); 
describe ("API basic tests", () => {
  it ("should reject empty userStory", async () => {
    const res = await request(app)
      .post("/generate-tests")
      .send({ userStory: "" });
    
    expect(res.statusCode).toBe(400);
  });
});

