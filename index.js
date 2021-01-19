const core = require('@actions/core');
const { execSync } = require("child_process");

try {
  const location = core.getInput('location') ? core.getInput('location') : "http://localhost:8080/index.html";
  const loadDelay = core.getInput('load-delay') ? core.getInput('load-delay') : '0';
  core.info(`Running on: ${location}`);

  const axeRunner = execSync(`npx axe ${location} --load-delay=${loadDelay}`);

  core.info(axeRunner);
} catch (error) {
  core.setFailed(error.message);
}