const core = require('@actions/core');
const github = require('@actions/github');
const artifact = require('@actions/artifact');
const kill  = require('tree-kill');
const { exec, spawn, execSync } = require("child_process");

try {
  const configFile = core.getInput('build-config-file') ? core.getInput('build-config-file') : "ui5.yaml";
  const configFileServe = core.getInput('serve-config-file') ? core.getInput('serve-config-file') : "ui5.yaml";
  const projectPath = process.env.GITHUB_WORKSPACE;
  core.info(`Build config file: ${configFile}`);
  core.info(`Serve config file: ${configFileServe}`);

  const build = execSync(`cd ${projectPath} && npm install @sap/ui5-builder-webide-extension@1.0.11 && npx ui5 build dev --all --config=${configFile}`);

  core.info(build);

  const server = spawn(`cd ${projectPath} && npx ui5 serve --config=${configFile}`, {
    shell: "/bin/bash"
  });

  core.info("Spawned server");

  const axeRunner = execSync("npx axe http://localhost:8080/index.html --load-delay=3000");

  core.info(axeRunner);

  kill(server.pid);
} catch (error) {
  core.setFailed(error.message);
}