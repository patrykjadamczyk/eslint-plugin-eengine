ESLint-plugin-EEngine
=====================

EEngine specific linting rules for ESLint

# Installation
Install [ESLint](https://www.github.com/eslint/eslint) either locally or globally.

```sh
$ npm install eslint --save-dev
```

If you installed `ESLint` globally, you have to install EEngine plugin globally too. Otherwise, install it locally.

```sh
$ npm install eslint-plugin-eengine --save-dev
```

# Configuration

Use [our preset](#recommended) to get reasonable defaults:

```json
    "extends" : [
        "eslint:recommended",
        "plugin:eengine/recommended"
    ]
```

If you do not use a preset you will need to specify individual rules and add extra configuration.

Add "engine" to the plugins section.

```json
{
  "plugins": [
    "engine"
  ]
}
```

Enable the rules that you would like to use.

```json
  "rules": {
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
  }
```

# List of supported rules

* [eengine/enforce-classes](docs/rules/enforce-classes.md): Enforces class-based components
* [eengine/enforce-proptypes-in-class](docs/rules/enforce-proptypes-in-class.md): Enforces definition of propTypes as properties in body of class

# Shareable configurations

## Recommended

This plugin exports a `recommended` configuration that enforces good practices.

To enable this configuration use the `extends` property in your `.eslintrc` config file:

```json
{
  "extends": ["eslint:recommended", "plugin:eengine/recommended"]
}
```

See [ESLint documentation](http://eslint.org/docs/user-guide/configuring#extending-configuration-files) for more information about extending configuration files.

# License

ESLint-plugin-EEngine is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
