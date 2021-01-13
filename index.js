const core = require('@actions/core');
const github = require('@actions/github');
const artifact = require('@actions/artifact');
const kill  = require('tree-kill');
const { exec, spawn, execSync } = require("child_process");

try {
  const configFile = core.getInput('config-file-location') ? core.getInput('config-file-location') : "ci.yaml";
  const projectPath = process.env.GITHUB_WORKSPACE;
  console.log(`Config file: ${configFile}`);

  const build = execSync(`cd ${projectPath} && npm install @sap/ui5-builder-webide-extension@1.0.11 && ui5 build dev --all --config=${configFile}`);

  console.log(`stdout: ${build}`);

  const server = spawn(`cd ${projectPath} && ui5 serve`, {
    shell: "/bin/bash"
  });

  const axeRunner = execSync("axe http://localhost:8080/index.html --exit --load-delay=3000 | sed 's/\x1b\[[0-9;]*[a-zA-Z]//g' > axe.log");

  core.setOutput("axe-results-location", "axe.log");
  kill(server.pid);

  // if(process.env.ACTIONS_RUNTIME_TOKEN) {
  //   const artifactClient = artifact.create()
  //   const artifactName = 'axe-output';
  //   const files = [
  //       'axe-output.txt'
  //   ]

  //   const rootDirectory = '.' // Also possible to use __dirname
  //   const options = {
  //       continueOnError: false
  //   }

  //   const uploadResponse = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)
  // }
} catch (error) {
  core.setFailed(error.message);
}