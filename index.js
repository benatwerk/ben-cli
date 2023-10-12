#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs");
const path = require("path");
const deepmerge = require("deepmerge");

/**
 * This script uses yargs to create a CLI tool that allows the user to create a new React
 * project with various options.
 *
 * @file This file contains the code for the CLI tool.
 * @summary A CLI tool for creating new React projects with various options.
 * @requires yargs
 * @requires hideBin
 * @exports argv
 */
const argv = yargs(hideBin(process.argv))
    .scriptName("ben-cli")
    .command(
        "create [name]",
        "Creates a new React project Ben's way",
        (yargs) => {
            return yargs.positional("name", {
                describe: "Project name",
                default: "my-react-app",
            });
        },
        () => {}
    )
    .options({
        typescript: {
            alias: "t",
            type: "boolean",
            description: "Use TypeScript",
        },
        sass: { alias: "s", type: "boolean", description: "Use Sass" },
        classnames: {
            alias: "c",
            type: "boolean",
            description: "Use Classnames library",
        },
        linting: {
            alias: "l",
            type: "boolean",
            description: "Use Airbnb linting rules",
        },
    })
    .help().argv;

const language = argv.typescript ? "ts" : "js";
const projectName = argv.name || "my-react-app";
/**
 * Ensures that a directory exists at the given path. If the directory does not exist,
 * it will be created recursively.
 *
 * @param {string} dirPath - The path of the directory to ensure exists.
 * @returns {void}
 */
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Removes a file from the file system.
 *
 * @param {string} filePath - The path of the file to be removed.
 * @returns {void}
 */
const removeFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

/**
 * Copies a folder from one location to another synchronously.
 *
 * @param {string} from - The source folder path.
 * @param {string} to - The destination folder path.
 * @returns {void}
 */
const copyFolderSync = (from, to) => {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach((element) => {
        const stat = fs.statSync(path.join(from, element));
        if (stat.isFile()) {
            const dest = path.join(to, element);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(path.join(from, element), dest);
            }
        } else if (stat.isDirectory()) {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
};

/**
 * Merges two JSON files and writes the result to the main file.
 *
 * @param {string} newProjectPath - The path to the main project directory.
 * @param {string} featurePath - The path to the feature directory.
 * @param {string} fileName - The name of the JSON file to merge.
 * @returns {void}
 */
const mergeJsonFiles = (newProjectPath, featurePath, fileName) => {
    const mainFilePath = path.join(newProjectPath, fileName);
    const featureFilePath = path.join(featurePath, fileName);

    if (!fs.existsSync(mainFilePath) || !fs.existsSync(featureFilePath)) {
        console.error(
            `Either ${mainFilePath} or ${featureFilePath} doesn't exist.`
        );
        return;
    }

    try {
        const mainFileContent = fs.readFileSync(mainFilePath, "utf8");
        const featureFileContent = fs.readFileSync(featureFilePath, "utf8");

        const mainFileJson = JSON.parse(mainFileContent);
        const featureFileJson = JSON.parse(featureFileContent);

        const mergedJson = deepmerge(mainFileJson, featureFileJson);

        mergedJson.name = projectName;
        fs.writeFileSync(mainFilePath, JSON.stringify(mergedJson, null, 2));
    } catch (e) {
        console.error(`An error occurred: ${e}`);
    }
};

/**
 * Generates a webpack configuration object for loading Sass files.
 *
 * @returns {Object} Webpack configuration object.
 */
const generateSassConfig = () => {
    return {
        module: {
            rules: [
                {
                    test: `/\.scss$/`,
                    use: ["style-loader", "css-loader", "sass-loader"],
                },
            ],
        },
    };
};

/**
 * Generates a TypeScript configuration object for Webpack.
 *
 * @returns {Object} The TypeScript configuration object.
 */
const generateTypescriptConfig = () => {
    return {
        resolve: {
            extensions: [".ts", ".tsx"],
        },
        module: {
            rules: [
                {
                    test: `/\.(tsx?)$`,
                    use: "ts-loader",
                    exclude: "/node_modules/",
                },
            ],
        },
    };
};

/**
 * Generates a Webpack configuration object based on selected features, project path, and language.
 *
 * @param {string[]} features - An array of selected features (e.g. "typescript", "sass").
 * @param {string} projectPath - The path to the project directory.
 * @param {string} language - The language used in the project ("js" or "ts").
 * @returns {void}
 */
const generateWebpackConfig = (features, projectPath, language) => {
    let baseConfig = {
        mode: "development",
        entry: `./src/index.${language === "ts" ? "tsx" : "js"}`,
        output: {
            filename: "bundle.js",
            path: "path.resolve(__dirname, 'dist')",
        },
        devServer: {
            static: [
                {
                    directory: "path.resolve(__dirname, 'public')",
                    publicPath: "/",
                },
                "./dist",
            ],
            open: true,
            hot: true,
            port: 3000,
        },
        module: {
            rules: [],
        },
        resolve: {
            extensions: [".js"],
        },
        plugins: ["HtmlWebpackPluginPlaceholder"],
    };

    // Initialize an empty object to hold all the feature configurations
    let allFeatureConfigs = {};

    // Add feature configs based on selected features
    features.forEach((feature) => {
        if (feature === "typescript") {
            allFeatureConfigs = deepmerge(
                allFeatureConfigs,
                generateTypescriptConfig(),
                {
                    arrayMerge: (dest, source) => dest.concat(source),
                }
            );
        }
        if (feature === "sass") {
            allFeatureConfigs = deepmerge(
                allFeatureConfigs,
                generateSassConfig(),
                {
                    arrayMerge: (dest, source) => dest.concat(source),
                }
            );
        }
    });

    // Merge all feature configs into the base config
    baseConfig = deepmerge(baseConfig, allFeatureConfigs, {
        arrayMerge: (dest, source) => dest.concat(source),
    });

    // This variable contains the initial content for the configuration file.
    let configContent =
        "const path = require('path');\nconst HtmlWebpackPlugin = require('html-webpack-plugin');\n";
    configContent += "module.exports = " + JSON.stringify(baseConfig, null, 4);

    // Replace placeholders with proper code snippets
    configContent = configContent.replace(
        '"path": "path.resolve(__dirname, \'dist\')"',
        '"path": path.resolve(__dirname, "dist")'
    );
    configContent = configContent.replace(
        '"directory": "path.resolve(__dirname, \'public\')"',
        '"directory": path.resolve(__dirname, "public")'
    );
    configContent = configContent.replace(
        `"test": "/.(tsx?)$"`,
        `"test": /\\.(tsx?)$/`
    );
    configContent = configContent.replace(
        `"test": "/.scss$/"`,
        `"test": /\\.scss$/`
    );
    configContent = configContent.replace(
        '"exclude": "/node_modules/"',
        '"exclude": /node_modules/'
    );
    configContent = configContent.replace(
        '"HtmlWebpackPluginPlaceholder"',
        `new HtmlWebpackPlugin({template: "./index.html"})`
    );

    const webpackConfigPath = path.join(projectPath, "webpack.config.js");
    fs.writeFileSync(webpackConfigPath, configContent);
};

/**
 * Copies the specified feature to the new project path and merges its package.json and .eslintrc.json
 * files if they exist.
 * @param {string} feature - The name of the feature to add.
 * @param {string} newProjectPath - The path of the new project to add the feature to.
 * @returns {void}
 */
const addFeature = (feature, newProjectPath) => {
    const featurePath = path.join(__dirname, "templates", feature);

    if (fs.existsSync(featurePath)) {
        copyFolderSync(featurePath, newProjectPath);
    }
    if (fs.existsSync(path.join(featurePath, "package.json"))) {
        mergeJsonFiles(newProjectPath, featurePath, "package.json");
    }
    if (fs.existsSync(path.join(featurePath, ".eslintrc.json"))) {
        mergeJsonFiles(newProjectPath, featurePath, ".eslintrc.json");
    }
    copyFolderSync(featurePath, newProjectPath);
};

/**
 * Constructs an App file with the given features and language.
 *
 * @param {string[]} features - An array of features to include in the App file.
 * @param {string} projectPath - The path to the project directory.
 * @param {string} [language="js"] - The language of the App file. Defaults to "js".
 * @returns {void}
 */
const constructAppFile = (features, projectPath, language = "js") => {
    let appFileContent = "import React from 'react';\n";
    if (language === "ts") {
        appFileContent = "import React, { FC } from 'react';\n";
    }

    // Feature-specific imports
    if (features.includes("sass")) {
        appFileContent += "import './App.scss';\n";
    }

    if (features.includes("classnames")) {
        appFileContent += "import classNames from 'classnames';\n";
    }

    // Start function body
    appFileContent += "\nfunction App()";

    // TypeScript specific type definition
    if (language === "ts") {
        appFileContent += ": React.ReactElement";
    }
    appFileContent += " {\n";
    appFileContent += "  return (\n";
    appFileContent += '    <div className="App">\n';
    appFileContent += "      I'm a react app...\n";
    // Add the list of features
    if (features.length > 0) {
        appFileContent += "      <ul>\n";
        features.forEach((feature) => {
            appFileContent += `        <li>${feature}</li>\n`;
        });
        appFileContent += "      </ul>\n";
    }
    appFileContent += "    </div>\n";
    appFileContent += "  );\n";
    appFileContent += "}\n\nexport default App;\n";

    const appFileName = `App.${language === "ts" ? "tsx" : "js"}`;
    const appFilePath = path.join(projectPath, "src", appFileName);

    // Ensure src directory exists
    ensureDirExists(path.join(projectPath, "src"));

    fs.writeFileSync(appFilePath, appFileContent, "utf8");
};

if (argv._.includes("create")) {
    const newProjectPath = path.join(process.cwd(), projectName);

    // Always start with the default template
    const defaultTemplatePath = path.join(__dirname, "templates", "default");
    copyFolderSync(defaultTemplatePath, newProjectPath);

    // Features to be added
    const features = [];
    if (argv.typescript) features.push("typescript");
    if (argv.sass) features.push("sass");
    if (argv.classnames) features.push("classnames");
    if (argv.linting) features.push("linting");

    // Generate webpack config
    generateWebpackConfig(features, newProjectPath, language);

    // Add selected features
    features.forEach((feature) => addFeature(feature, newProjectPath));

    // Construct App.js or App.tsx based on selected features
    constructAppFile(features, newProjectPath, language);

    // Clean up files
    if (argv.sass) {
        removeFile(path.join(newProjectPath, "src", "App.css"));
    }
    if (argv.typescript) {
        removeFile(path.join(newProjectPath, "src", "index.js"));
    }

    console.log(`Project ${projectName} setup complete!`);
    console.log(`To get started, run the following commands:`);
    console.log(`- cd ${projectName}`);
    console.log(`- npm install`);
    console.log(`- npm start`);
    console.log(`🦦`);
}
