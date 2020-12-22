const core   = require("@actions/core");
const githubAction = require("@actions/github");
const {checkCommits} = require("./helper");

async function action() {
    const token = core.getInput("github-token", {required: true});
    const protected_extra = core.getInput("protected-paths", {required: false});

    const github = new githubAction.getOctokit(token);

    const result = await checkCommits(github,
                                      core,
                                      githubAction.context,
                                      {protected_extra});

    core.info(`hold protected: ${ result.hold_protected }`);
    core.info(`hold development: ${ result.hold_development }`);

    core.setOutput("hold_protected", result.hold_protected);
    core.setOutput("hold_development", result.hold_development);
    core.setOutput("proceed", result.proceed);
}

action()
    .then(() => core.info("success"))
    .catch(error => core.setFailed(error.message));