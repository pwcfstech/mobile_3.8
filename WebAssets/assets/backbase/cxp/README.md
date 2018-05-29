CXP Webview client
====================

Contains all assets necessary to run the CXP Web Client in a iOS or Android webview usin the Backbase mobile SDKs

##Depenedencies

This repo includes a gulp script to obtain 3rd party dependencies via NPM.

To update a dependency:

1. Change the relevant versions in `package.json`
2. Run `npm update`
3. Run `gulp`
4. Commit the update dependencies in the `js/shared` directory