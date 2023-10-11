#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs");
const path = require("path");
const deepmerge = require("deepmerge");

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

const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const removeFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

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

const mergeJsonFiles = (newProjectPath, featurePath, fileName) => {
    try {
        const mainFilePath = path.join(newProjectPath, fileName);
        const featureFilePath = path.join(featurePath, fileName);

        const mainFileJson = require(mainFilePath);
        const featureFileJson = require(featureFilePath);

        // Deep-merge using deepmerge package
        const mergedJson = deepmerge(mainFileJson, featureFileJson);

        // Write back to the main file
        fs.writeFileSync(mainFilePath, JSON.stringify(mergedJson, null, 2));
    } catch (e) {
        console.error(`An error occurred: ${e}`);
    }
};

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
    appFileContent += "\nfunction App() ";

    // TypeScript specific type definition
    if (language === "ts") {
        appFileContent += ": React.ReactElement ";
    }
    appFileContent += "{\n";
    appFileContent += "  return (\n";
    appFileContent += '    <div className="App">\n';
    appFileContent += "      {/* Add your components here */}\n";
    appFileContent += "      Hi... I'm a react app \n";
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
    const projectName = argv.name || "my-react-app";
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

    // Add selected features
    features.forEach((feature) => addFeature(feature, newProjectPath));

    // Construct App.js or App.tsx based on selected features
    const language = argv.typescript ? "ts" : "js";
    constructAppFile(features, newProjectPath, language);

    // Clean up files
    if (argv.typescript)
        removeFile(path.join(newProjectPath, "src", "App.css"));

    console.log(`Project ${projectName} setup complete!`);
}
