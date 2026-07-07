
# AI TestGen

AI-powered Requirements & Test Case Generator for Agile Teams.

## 1.0 Features
- Generate clarified requirements
- Generate functional tests
- Generate edge cases
- Generate API tests
- Generate acceptance criteria
- Save history of generations
- Full-stack app (React + Node + SQLite)
- CI/CD with GitHub Actions
- Cloud deployment

## 2.0 Architecture
Frontend (React) → Backend (Node/Express) → AI Model (OpenAI) → SQLite DB

## 3.0 Running Locally
cd ai-testgen-backend
npm install
node server.js

cd ai-testgen-frontend
npm install
npm start

## 4.0 API
POST /generate-tests
GET /history

## 5.0 Deployment
Backend: http://localhost:3001
Frontend: http://localhost:3000
Production Backend: https://ai-testgen-backend.onrender.com
Production Frontend: https://ai-testgen-frontend.onrender.com

## 6.0 Versions

####0.01 Sunday 5 July 2026 17:41:

Initialised.

####0.02 Sunday 5 July 2026 18:31:

The backend test was failing in CI pipeline with error:

```
Error [ERR_REQUIRE_ESM]: require() of ES Module /home/runner/work/ai-testgen-backend/ai-testgen-backend/node_modules/@babel/core/lib/index.js from /home/runner/work/ai-testgen-backend/ai-testgen-backend/node_modules/babel-jest/build/index.js not supported.
Instead change the require of /home/runner/work/ai-testgen-backend/ai-testgen-backend/node_modules/@babel/core/lib/index.js in /home/runner/work/ai-testgen-backend/ai-testgen-backend/node_modules/babel-jest/build/index.js to a dynamic import() which is available in all CommonJS modules.
```

Fixed by 

a. Getting tests/server.test.js to call the app explicitly (without default keyword)

```
import { app } from "../server.js";//if you exported app
```

b. Getting server.js to start app without reference to default

```
export { app };
```

####0.03 Sunday 5 July 2026 18:45:

Changed node version in ci.yml to 22.

###1.00 Monday 6 July 2026 17:45:

Made updates to frontend in order to enable it to communciate with backend in Production.

--OUTCOME--

a. Dynamic Test Case Generation with backend service utilizing AI:

![Dynamic Test Case Generation with AI](./screenshots/AI-Test-Case-Generator.jpg)

b. REACT SPA application shows history page of all queries made to date, via call to backend which hosts a database. 

![Cost savings via cloud infrastructure destruction](./screenshots/AI-Test-Case-History.jpg)

####1.01 Tuesday 7 July 2026 14:02:

Completed Readme (this document).