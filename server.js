import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';
import db from "./db.js";

dotenv.config();

const app = express();
app.use (cors({
 origin: "*", 
 methods: ["GET", "POST"], 
}));
app.use(express.json());

// Initialise OpenAI client
//console.log(typeof process.env.HF_INFERENCE_TOKEN);
//console.log(`"key:" ${process.env.HF_INFERENCE_TOKEN}`);

const client = new InferenceClient(String(process.env.HF_INFERENCE_TOKEN || ''));
/*
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});
*/

// AI prompt builder
function buildPrompt (userStory){
  return `
You are an expert Agile QA Engineer and Senior Software Developer.
  
Given the following user story:

"${userStory}"

Generate the following in clean JSON format:

1. "clarifiedRequirement" - rewrite the requirement clearly and unambigously.  
2. "functionalTests" - list 5 functional test cases.
3. "edgeCases" - list 5 edge cases.
4. "apiTests" - list 5 API test examples (include method, endpoint and expected status).
5. "acceptanceCriteria" - list 5 acceptance criteria in Gherkin format.

Respond ONLY with valid JSON.
`;
}

function buildPrompt_strictJSON(userStory) {
  return `
You are an expert Agile QA engineer.

Given the user story:

"${userStory}"

Generate STRICT JSON with the following structure:

{
  "clarifiedRequirement": "string",
  "functionalTests": [
    { "title": "string", "expected": "string" }
  ],
  "edgeCases": [
    { "title": "string", "expected": "string" }
  ],
  "apiTests": [
    { "method": "string", "endpoint": "string", "expectedStatus": "number" }
  ],
  "acceptanceCriteria": [
    "string"
  ]
}

Rules:
- NO markdown.
- NO code fences.
- NO explanations.
- NO long paragraphs.
- Keep each list to EXACTLY 3 items.
- Keep responses short and concise.
- Respond ONLY with valid JSON.
`;
}

// Route: /generate-tests
app.post('/generate-tests', async (req, res) =>{
  try {
    const { userStory } = req.body;
    
    if (!userStory || userStory.trim() === "") {
      return res.status(400).json({ error: "userStory is required" });
    } 
    
    const prompt = buildPrompt_strictJSON (userStory);
    
    const completion = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", Content: "You generate structured test cases for Agile teams."},
        { role: "user", content: prompt}
      ],
      max_tokens: 500,
      temperature: 0.2
    });
  
    const aiText = completion.choices[0].message.content;
    
    //Remove Markdown fences if present
    const cleanedText =aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!cleanedText.startsWith("{") || !cleanedText.endsWith("}")) {
      return res.status(500).json({
        error: "AI returned malformed JSON structure",
        raw: cleanedText
      });
    }
    // Parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (err) {
      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: cleanedText
      });
    }
    
    res.json(parsed);
    
    //Save to database
    const stmt = db.prepare(`
        INSERT INTO generations (userStory, resultJson, createdAt)
        VALUES (?, ?, ?) 
    `);
    stmt.run(userStory, JSON.stringify(parsed), new Date().toISOString());
      
  } catch (err) {
    console.error ("Error generating tests:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
  
});  

// Route: /history
app.get('/history', async (req, res) =>{
  try {
    const rows = db.prepare(`
      SELECT id, userStory, resultJson, createdAt
      FROM generations
      ORDER BY id DESC
      LIMIT 20
      `).all();
    
    const parsed = rows.map(r => ({
      id: r.id,
      userStory: r.userStory,
      result: JSON.parse(r.resultJson),
      createdAt: r.createdAt
    }));
    
    res.json(parsed);  
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Failed to load history." });
  }
});

// Only listen if the file is run directly, not when imported by Jest
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`AI TestGen backend running on port ${PORT}`);
  });
}

export { app };


// Export the raw app instance
//export default app;

//cd ai-testgen-frontend
//npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom

