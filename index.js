const core = require('@actions/core');
const fs = require('fs');
const { execSync } = require("child_process");

const failOnViolation = core.getInput('fail-on-violation') ? core.getInput('fail-on-violation') : 'false';

try {
  const location = core.getInput('location') ? core.getInput('location') : "http://localhost:8080/index.html";
  const loadDelay = core.getInput('load-delay') ? core.getInput('load-delay') : '0';
  core.info(`Running on: ${location}`);

  const axeRunner = execSync(`npx axe ${location} --load-delay=${loadDelay} --save=axe.json.log --exit`);

  core.info(axeRunner);
} catch (error) {
  if(error.status === 1) {
    core.info("Exit code 1");
    try {
      const data = JSON.parse(fs.readFileSync('axe.json.log', 'utf8'));
      data[0].violations.forEach(violation => {
        core.error(violation.help + "\n  " + violation.helpUrl);
        core.startGroup("Nodes");
        violation.nodes.forEach(node => {
          core.info(node.failureSummary);
          core.info(node.html);
        })
        core.endGroup();
      });

      core.info(failOnViolation);
      if(failOnViolation === 'true') core.setFailed("a11y checks failed.");
    } catch (error) {
      core.setFailed("Failed to read log file axe.json.log.");
    }
  } else {
    core.info("Exit code <> 1");
    core.setFailed(error.stdout);
  }
}