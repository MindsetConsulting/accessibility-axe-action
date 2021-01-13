const core = require('@actions/core');
const github = require('@actions/github');
const artifact = require('@actions/artifact');
const kill  = require('tree-kill');
const { exec, spawn } = require("child_process");

try {
  const configFile = core.getInput('config-file-location') ? core.getInput('config-file-location') : "ci.yaml";
  const projectPath = core.getInput('project-path') ? core.getInput('project-path') : "node_modules/msp_transPost";
  console.log(`Config file: ${configFile}`);

  const build = exec(`cd ${projectPath} && npm install @sap/ui5-builder-webide-extension@1.0.11 && ui5 build dev --all --config=${configFile}`);

  build.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  build.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  })
  
  build.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
  });
  
  build.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);

    const server = spawn(`cd ${projectPath} && ui5 serve`, {
      shell: "/bin/bash"
    });

    server.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);

      if(data === "URL: http://localhost:8080") {
        console.log("Server started");
      }
    });

    server.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    })
    
    server.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);
    });
    
    server.on('exit', (code) => {
      console.log(`child process exited with code ${code}`);

    });

    const axeRunner = exec("axe http://localhost:8080/index.html --exit --load-delay=3000 | sed 's/\x1b\[[0-9;]*[a-zA-Z]//g' > axe.log");

    axeRunner.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    })

    axeRunner.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    })
    
    axeRunner.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);
    });
    
    axeRunner.on('exit', async (code) => {
      console.log(`child process exited with code ${code}`);
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
    });
  });
} catch (error) {
  core.setFailed(error.message);
}