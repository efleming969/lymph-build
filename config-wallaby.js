module.exports = function () {
    return {
        files: [ "src/main/**/*.js", "src/test/utils/*.js" ],
        tests: [ "src/test/**/*.test.js" ],

        testFramework: "mocha",

        env: {
            type: "node"
        }
    }
}
