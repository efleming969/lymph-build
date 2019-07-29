module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "mocha": true
    },
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "no-multi-spaces": [ "error" ],
        "space-in-parens": [ "error", "always" ],
        "array-bracket-spacing": [ "error", "always" ],
        "object-curly-spacing": [ "error", "always" ],
        "template-curly-spacing": [ "error", "always" ],
        "key-spacing": [ "error", { "afterColon": true } ],
        "indent": [ "error", 4 ],
        "comma-dangle": [ "error" ]
    }
}
