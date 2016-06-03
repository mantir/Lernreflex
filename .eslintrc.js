module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
      "react"
    ],
    "rules": {
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-console": ["error", { allow: ["log", "warn", "error"] }],
        "quotes": [
            "error",
            "single"
        ],
        "comma-dangle": [
            "off",
            "never"
        ],
        "no-unused-vars": [
          "off", { "vars": "local", "args": "after-used" }
        ]
    }
};
