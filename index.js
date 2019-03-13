'use strict';

const has = require('has');

const allRules = {
  'enforce-classes': require('./lib/rules/enforce-classes'),
  'enforce-proptypes-in-class': require('./lib/rules/enforce-proptypes-in-class'),
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
        'eengine/enforce-classes': 2,
        'eengine/enforce-proptypes-in-class': 2,
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
