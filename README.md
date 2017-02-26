# Lernreflex

Lernreflex is an app for Android an iOS to put learning goals in the center of learning. It is developed with
[React Native](https://facebook.github.io/react-native/)

## Get started
Before you get started you need [node](https://nodejs.org/).
Then you need the React Native CLI. Install globally with: `npm install -g react-native-cli`.
And then it's all npm, so just download the code and do `npm install`. When asked to overwrite files choose no. By default the Android project is generated. If you want to add the iOS-Project do `node generate-ios.js` and then `react-native link`. 

For further instructions how to run a React Native app, please have a look at their [docs](https://facebook.github.io/react-native/).
To use the app, a running [COMPBASE](https://github.com/uzuzjmd/COMPBASE) and a [Moodle](https://github.com/moodle/moodle) with the [COMPBASE-Plugin](https://github.com/uzuzjmd/COMPBASE/tree/master/competence-lms-adaptors/moodle) is required. The ip or url to the API must be specified in the `localip.js` (without protocol and port, if you want to make changes there you have to change the code in the initialization in `models/Model.js`)

## Generate documentation
The documentation can be generated using:
`jsdoc . -c conf.json`.
It is exported to /docs
