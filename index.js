'use strict';

const has = require('has');

const allRules = {
  'prefer-stateless-function': require('./lib/rules/prefer-stateless-function'),
  'prop-types': require('./lib/rules/prop-types'),
};

function filterRules(rules, predicate) {
  const result = {};
  for (const key in rules) {
    if (has(rules, key) && predicate(rules[key])) {
      result[key] = rules[key];
    }
  }
  return result;
}

function configureAsError(rules) {
  const result = {};
  for (const key in rules) {
    if (!has(rules, key)) {
      continue;
    }
    result[`eengine/${key}`] = 2;
  }
  return result;
}

const activeRules = filterRules(allRules, rule => !rule.meta.deprecated);
const activeRulesConfig = configureAsError(activeRules);

const deprecatedRules = filterRules(allRules, rule => rule.meta.deprecated);

module.exports = {
  deprecatedRules: deprecatedRules,
  rules: allRules,
  configs: {
    recommended: {
      plugins: [
        'eengine'
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: {
        'eengine/prop-types': 2,
        'eengine/prefer-stateless-function': 2,
      }
    },
    all: {
      plugins: [
        'eengine'
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: activeRulesConfig
    }
  }
};
