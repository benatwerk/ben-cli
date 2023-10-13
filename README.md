# It's a React App CLI alright 🦦

## Overview

This is a simple CLI tool for creating React applications with various options. The CLI is built to be easily extendable and allows you to choose from a set of features to include in your new React project.

I just did this as a coding project.

## Features

-   **TypeScript**: Adds TypeScript support to your project.
-   **Sass**: Adds Sass support for styling.
-   **Airbnb**: Adds Airbnb linting rules.
-   **Classnames**: Adds the Classnames library for easier className manipulation in React.

## Directory Structure

```bash
.
├── airbnb
│   ├── .eslintignore
│   └── .eslintrc.json
├── classnames
│   └── package.json
├── default
│   ├── .babelrc
│   ├── .eslintignore
│   ├── .eslintrc.json
│   ├── index.html
│   ├── jest.setup.js
│   ├── package.json
│   ├── public
│   │   └── favicon.ico
│   ├── src
│   │   ├── App.css
│   │   ├── App.test.js
│   │   ├── assets
│   │   │   └── images
│   │   ├── components
│   │   └── index.js
│   └── webpack.config.js
├── sass
│   ├── package.json
│   └── src
│       └── App.scss
└── typescript
    ├── .eslintrc.json
    ├── package.json
    ├── src
    │   ├── App.test.tsx
    │   └── index.tsx
    └── tsconfig.json
```

## Installation

To install the CLI globally, run:

```bash
npm install -g ben-cli
```

## Usage

Then to to create a new React project, run:

```bash
ben-cli create [name]
```

## Running with NPX

You can also run the CLI without installing it globally by using `npx`. This will download and execute the CLI in a single command:

```bash
npx ben-cli create [name] [options]
```

### Options

-   `--typescript, -t`: Use TypeScript
-   `--sass, -s`: Use Sass
-   `--classnames, -c`: Use Classnames library
-   `--airbnb, -a`: Use Airbnb linting rules

### Example:

```bash
ben-cli create my-new-project --typescript --sass
```

or

```bash
npx ben-cli create my-new-project --typescript --sass
```

## How It Works

The CLI uses templates stored in the `templates` directory to scaffold out a new React project. Each feature (e.g., TypeScript, Sass, etc.) has its own sub-directory under `templates`. When you select a feature, the CLI copies the files from the corresponding sub-directory into your new project and merges any JSON files (like `package.json` and `.eslintrc.json`).

## Extending the CLI

The CLI is built to be easily extendable. To add a new feature, simply create a new sub-directory under `templates` and add the necessary files and configurations.

## Contributing

Feel free to contribute by submitting pull requests or creating issues if you really want.

## License

MIT
