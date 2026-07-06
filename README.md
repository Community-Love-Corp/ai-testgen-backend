# ai-testgen-backend

## Versions

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