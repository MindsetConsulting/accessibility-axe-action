const core = require('@actions/core');
const github = require('@actions/github');
const artifact = require('@actions/artifact');
const kill  = require('tree-kill');
const { exec, spawn, execSync } = require("child_process");

try {
  const configFile = core.getInput('config-file-location') ? core.getInput('config-file-location') : "ui5.yaml";
  const projectPath = process.env.GITHUB_WORKSPACE;
  console.log(`Config file: ${configFile}`);

  const build = execSync(`cd ${projectPath} && npm install @sap/ui5-builder-webide-extension@1.0.11 && npx ui5 build dev --all --config=${configFile}`);

  console.log(`stdout: ${build}`);

  const server = spawn(`cd ${projectPath} && npx ui5 serve`, {
    shell: "/bin/bash"
  });

  console.log("Spawned server");

  const axeRunner = execSync("npx axe http://localhost:8080/index.html --exit --load-delay=3000 | sed 's/\x1b\[[0-9;]*[a-zA-Z]//g' > axe.log");

  console.log("Axe run complete and stored in axe.log");
  core.setOutput("axe-results-location", "axe.log");
  kill(server.pid);
} catch (error) {
  core.setFailed(error.message);
}