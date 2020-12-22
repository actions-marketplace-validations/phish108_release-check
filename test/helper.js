const chai = require("chai");
const expect = chai.expect;

const githubAction = require("@actions/github");
const core = require("@actions/core");
const helper = require("../src/helper");

const packageJson = "{\"version\": \"1.0.0\", \"devDependencies\": {\"foo\": \"bar\", \"bar\": \"baz\"}}";

describe( "basic functions", function() {
    // we need to run the test script outside of a runner with a local token.
    const token = core.getInput("token");
    const github = githubAction.getOctokit(token);

    it("prepareProtectedPaths basic", function() {
        const pp = helper.prepareProtectedPaths();

        expect(pp.length).to.be.equal(4);
        expect(pp[0]).to.be.equal(".github/");
        expect(pp[1]).to.be.equal("tests/");
        expect(pp[2]).to.be.equal("test/");
        expect(pp[3]).to.be.equal(".gitignore");
    });

    it("prepareProtectedPaths one", function() {
        const pp = helper.prepareProtectedPaths("extra");

        expect(pp.length).to.be.equal(5);
        expect(pp[0]).to.be.equal(".github/");
        expect(pp[1]).to.be.equal("tests/");
        expect(pp[2]).to.be.equal("test/");
        expect(pp[3]).to.be.equal(".gitignore");
        expect(pp[4]).to.be.equal("extra");
    });

    it("prepareProtectedPaths many", function() {
        const pp = helper.prepareProtectedPaths("extra .eslintrc foobar/");

        expect(pp.length).to.be.equal(7);
        expect(pp[0]).to.be.equal(".github/");
        expect(pp[1]).to.be.equal("tests/");
        expect(pp[2]).to.be.equal("test/");
        expect(pp[3]).to.be.equal(".gitignore");
        expect(pp[4]).to.be.equal("extra");
        expect(pp[5]).to.be.equal(".eslintrc");
        expect(pp[6]).to.be.equal("foobar/");
    });

    it("checkOnlyPaths NULL", function() {
    });

    it("checkOnlyPaths empty", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyPaths([], pp);

        expect(test).to.be.true;
    });

    it("checkOnlyPaths one direct", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyPaths([".github/"], pp);

        expect(test).to.be.true;
    });

    it("checkOnlyPaths one partial", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyPaths([".github/workloads/foobar.yml"], pp);

        expect(test).to.be.true;
    });

    it("checkOnlyPaths some", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyPaths([
            ".github/workloads/foobar.yml",
            "test/helper.js"
        ], pp);

        expect(test).to.be.true;
    });

    it("checkOnlyPaths all", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyPaths([
            ".github/workloads/foobar.yml",
            "test/helper.js",
            "tests/data.db",
            ".gitignore"
        ], pp);

        expect(test).to.be.true;
    });

    it("checkOnlyPaths all extra", function() {
        const pp = helper.prepareProtectedPaths(".eslintrc .travis");

        const test = helper.checkOnlyPaths([
            ".github/workloads/foobar.yml",
            "test/helper.js",
            "tests/data.db",
            ".gitignore",
            ".eslintrc",
            ".travis/_config.yaml"
        ], pp);

        expect(test).to.be.true;
    });

    it("checkOnlyPaths more", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyPaths([
            ".github/workloads/foobar.yml",
            "test/helper.js",
            "tests/data.db",
            ".gitignore",
            ".eslintrc",
            ".travis/_config.yaml"
        ], pp);

        expect(test).to.be.false;
    });

    it("checkOnlyPaths more", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyPaths([
            ".github/workloads/foobar.yml",
            "test/helper.js",
            "tests/data.db",
            ".gitignore",
            ".eslintrc",
            ".travis/_config.yaml"
        ], pp);

        expect(test).to.be.false;
    });

    it("checkNpmFiles none", function() {
        const test = helper.checkNpmFiles([
            ".github/workloads/foobar.yml",
            "test/helper.js",
            "tests/data.db",
            ".gitignore",
            ".eslintrc",
            ".travis/_config.yaml"
        ]);

        expect(test).to.be.false;
    });

    it("checkNpmFiles one", function() {
        const test = helper.checkNpmFiles([
            ".github/workloads/foobar.yml",
            "test/helper.js",
            "tests/data.db",
            ".gitignore",
            "package.json",
            ".travis/_config.yaml"
        ]);

        expect(test).to.be.true;
    });

    it("checkOnlyHoldPaths more", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyHoldPaths([
            ".github/workloads/foobar.yml",
            "test/helper.js",
            "tests/data.db",
            ".gitignore",
            "package.json",
            ".travis/_config.yaml"
        ], pp);

        expect(test).to.be.false;
    });

    it("checkOnlyHoldPaths some", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyHoldPaths([
            ".github/workloads/foobar.yml",
            "test/helper.js",
            ".gitignore",
            "package.json",
        ], pp);

        expect(test).to.be.true;
    });

    it("checkOnlyHoldPaths some", function() {
        const pp = helper.prepareProtectedPaths();

        const test = helper.checkOnlyHoldPaths([
            ".github/workloads/foobar.yml",
            "test/helper.js",
            ".gitignore",
            "package.json",
        ], pp);

        expect(test).to.be.true;
    });

    it("prepare json diff none", function() {
        const diffStr = "@@aasdsa,asdas@@\n- {\n+ }";
        const test = helper.prepareJsonDiff(diffStr);

        expect(test).to.have.length(0);
    });

    it("prepare json diff some", function() {
        const diffStr = "@@aasdsa,asdas@@\n- \"version\": \"1.0.0\"\n+ \"version\": \"1.1.0\"";

        const test = helper.prepareJsonDiff(diffStr);

        expect(test).to.have.length(2);
        expect(test[0]).to.equal("version");
        expect(test[1]).to.equal("version");
    });

    it("check dev dependencies none", function() {
        const diffStr = "@@aasdsa,asdas@@\n- \"version\": \"1.0.0\"\n+ \"version\": \"1.1.0\"";

        const test = helper.checkChangesOnlyInDevDependencies(diffStr, packageJson);

        expect(test).to.be.false;
    });

    it("check dev dependencies one", function() {
        const diffStr = "@@aasdsa,asdas@@\n- \"foo\": \"1.0.0\"\n+ \"foo\": \"1.1.0\"";
        const test = helper.checkChangesOnlyInDevDependencies(diffStr, packageJson);

        expect(test).to.be.true;
    });

    it("check dev dependencies some", function() {
        const diffStr = "@@aasdsa,asdas@@\n- \"version\": \"1.0.0\"\n+ \"version\": \"1.1.0\"\n- \"foo\": \"1.0.0\"\n+ \"foo\": \"1.1.0\"";

        const test = helper.checkChangesOnlyInDevDependencies(diffStr, packageJson);

        expect(test).to.be.false;
    });

    // the following tests require access to the github API with
    // proper heads and base references
    it("compare proceed none", async function() {
        const before = "";
        const after = "";

        const ctx = {
            owner: "phish108",
            repo:  "release-check",
            payload: {
                before,
                after
            }
        }; 

        const result = await helper.checkCommits(github, ctx, {protected_extra: null});

        expect(result).to.haveOwnProperty("hold_protected");
        expect(result).to.haveOwnProperty("hold_development");
        expect(result).to.haveOwnProperty("proceed");

        expect(result.proceed).to.be.true;
        expect(result.hold_development).to.be.false;
        expect(result.hold_protected).to.be.false;
    });

    it("compare hold_protected", async function() {
        const before = "";
        const after = "";

        const ctx = {
            owner: "phish108",
            repo:  "release-check",
            payload: {
                before,
                after
            }
        }; 

        const result = await helper.checkCommits(github, ctx, {protected_extra: null});

        expect(result).to.haveOwnProperty("hold_protected");
        expect(result).to.haveOwnProperty("hold_development");
        expect(result).to.haveOwnProperty("proceed");

        expect(result.proceed).to.be.false;
        expect(result.hold_development).to.be.false;
        expect(result.hold_protected).to.be.true;

    });

    it("compare hold_development", async function() {
        const before = "";
        const after = "";

        const ctx = {
            owner: "phish108",
            repo:  "release-check",
            payload: {
                before,
                after
            }
        }; 

        const result = await helper.checkCommits(github, ctx, {protected_extra: null});

        expect(result).to.haveOwnProperty("hold_protected");
        expect(result).to.haveOwnProperty("hold_development");
        expect(result).to.haveOwnProperty("proceed");

        expect(result.proceed).to.be.false;
        expect(result.hold_development).to.be.true;
        expect(result.hold_protected).to.be.true;

    });

    it("compare proceed some development", async function() {
        const before = "";
        const after = "";

        const ctx = {
            owner: "phish108",
            repo:  "release-check",
            payload: {
                before,
                after
            }
        }; 

        const result = await helper.checkCommits(github, ctx, {protected_extra: null});

        expect(result).to.haveOwnProperty("hold_protected");
        expect(result).to.haveOwnProperty("hold_development");
        expect(result).to.haveOwnProperty("proceed");

        expect(result.proceed).to.be.true;
        expect(result.hold_development).to.be.false;
        expect(result.hold_protected).to.be.false;

    });

    it("compare proceed some protected", async function() {
        const before = "";
        const after = "";

        const ctx = {
            owner: "phish108",
            repo:  "release-check",
            payload: {
                before,
                after
            }
        };

        const result = await helper.checkCommits(github, ctx, {protected_extra: null});

        expect(result).to.haveOwnProperty("hold_protected");
        expect(result).to.haveOwnProperty("hold_development");
        expect(result).to.haveOwnProperty("proceed");

        expect(result.proceed).to.be.true;
        expect(result.hold_development).to.be.false;
        expect(result.hold_protected).to.be.false;

    });
});
