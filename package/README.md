# fragments
Cloud computing API
## Installation
1. Clone the repository:
npm init -y
npm install --save-dev eslint
# Create ESLint configuration
npx eslint --init
# setup pino
npm install --save pino pino-pretty pino-http
# Set up Express and Middleware
npm install --save express cors helmet compression


# Add scripts to package.json
# "dev": "node --env-file=debug.env --watch ./src/server.js"
# "debug": "node --env-file=debug.env --inspect=0.0.0.0:9229 --watch ./src/server.js"

# for testing server
curl http://localhost:8080
curl -s localhost:8080 | jq
curl -i localhost:8080

## Usage

npm start
npm run dev
npm run debug

## debug 
# debug.env
LOG_LEVEL=debug

# package.josn
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "lint": "eslint \"./src/**/*.js\"",
  "start": "node src/server.js",
  "dev": "node --env-file=debug.env --watch ./src/server.js",
  "debug": "node --env-file=debug.env --inspect=0.0.0.0:9229 --watch ./src/server.js"
},
