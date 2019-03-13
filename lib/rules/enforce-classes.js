/**
 * @fileoverview Enforce components to be written as a class
 * @author Patryk Adamczyk
 * @copyright 2019 Patryk Adamczyk. All rights reserved.
 */
'use strict';

const Components = require('../util/Components');
const versionUtil = require('../util/version');
const astUtil = require('../util/ast');
const docsUrl = require('../util/docsUrl');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Enforce components to be written as a class',
      category: 'Stylistic Issues',
      recommended: false,
      url: docsUrl('enforce-classes')
    },
    schema: [{
      type: 'object',
      properties: {
        ignorePureComponents: {
          default: false,
          type: 'boolean'
        }
      },
      additionalProperties: false
    }]
  },

  create: Components.detect((context, components, utils) => {
    const configuration = context.options[0] || {};
    const ignorePureComponents = configuration.ignorePureComponents || false;

    const sourceCode = context.getSourceCode();

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    /**
     * Mark component as pure as declared
     * @param {ASTNode} node The AST node being checked.
     */
    const markSCUAsDeclared = function (node) {
      components.set(node, {
        hasSCU: true
      });
    };

    /**
     * Mark childContextTypes as declared
     * @param {ASTNode} node The AST node being checked.
     */
    const markChildContextTypesAsDeclared = function (node) {
      components.set(node, {
        hasChildContextTypes: true
      });
    };

    /**
     * Mark a setState as used
     * @param {ASTNode} node The AST node being checked.
     */
    function markThisAsUsed(node) {
      components.set(node, {
        useThis: true
      });
    }

    /**
     * Mark a props or context as used
     * @param {ASTNode} node The AST node being checked.
     */
    function markPropsOrContextAsUsed(node) {
      components.set(node, {
        usePropsOrContext: true
      });
    }

    /**
     * Mark a ref as used
     * @param {ASTNode} node The AST node being checked.
     */
    function markRefAsUsed(node) {
      components.set(node, {
        useRef: true
      });
    }

    /**
     * Mark return as invalid
     * @param {ASTNode} node The AST node being checked.
     */
    function markReturnAsInvalid(node) {
      components.set(node, {
        invalidReturn: true
      });
    }

    /**
     * Mark a ClassDeclaration as having used decorators
     * @param {ASTNode} node The AST node being checked.
     */
    function markDecoratorsAsUsed(node) {
      components.set(node, {
        useDecorators: true
      });
    }

    function visitClass(node) {
      if (ignorePureComponents && utils.isPureComponent(node)) {
        markSCUAsDeclared(node);
      }

      if (node.decorators && node.decorators.length) {
        markDecoratorsAsUsed(node);
      }
    }

    return {
      ClassDeclaration: visitClass,
      ClassExpression: visitClass,

      // Mark `this` destructuring as a usage of `this`
      VariableDeclarator: function(node) {
        // Ignore destructuring on other than `this`
        if (!node.id || node.id.type !== 'ObjectPattern' || !node.init || node.init.type !== 'ThisExpression') {
          return;
        }
        // Ignore `props` and `context`
        const useThis = node.id.properties.some(property => {
          const name = astUtil.getPropertyName(property);
          return name !== 'props' && name !== 'context';
        });
        if (!useThis) {
          markPropsOrContextAsUsed(node);
          return;
        }
        markThisAsUsed(node);
      },

      // Mark `this` usage
      MemberExpression: function(node) {
        if (node.object.type !== 'ThisExpression') {
          if (node.property && node.property.name === 'childContextTypes') {
            const component = utils.getRelatedComponent(node);
            if (!component) {
              return;
            }
            markChildContextTypesAsDeclared(component.node);
            return;
          }
          return;
        // Ignore calls to `this.props` and `this.context`
        } else if (
          (node.property.name || node.property.value) === 'props' ||
          (node.property.name || node.property.value) === 'context'
        ) {
          markPropsOrContextAsUsed(node);
          return;
        }
        markThisAsUsed(node);
      },

      // Mark `ref` usage
      JSXAttribute: function(node) {
        const name = sourceCode.getText(node.name);
        if (name !== 'ref') {
          return;
        }
        markRefAsUsed(node);
      },

      // Mark `render` that do not return some JSX
      ReturnStatement: function(node) {
        let blockNode;
        let scope = context.getScope();
        while (scope) {
          blockNode = scope.block && scope.block.parent;
          if (blockNode && (blockNode.type === 'MethodDefinition' || blockNode.type === 'Property')) {
            break;
          }
          scope = scope.upper;
        }
        const isRender = blockNode && blockNode.key && blockNode.key.name === 'render';
        const allowNull = versionUtil.testReactVersion(context, '15.0.0'); // Stateless components can return null since React 15
        const isReturningJSX = utils.isReturningJSX(node, !allowNull);
        const isReturningNull = node.argument && (node.argument.value === null || node.argument.value === false);
        if (
          !isRender ||
          (allowNull && (isReturningJSX || isReturningNull)) ||
          (!allowNull && isReturningJSX)
        ) {
          return;
        }
        markReturnAsInvalid(node);
      },

      'Program:exit': function() {
        const list = components.list();
        Object.keys(list).forEach(component => {
          if (
            (utils.isES5Component(list[component].node) && utils.isES6Component(list[component].node))
          ) {
            return;
          }
          context.report({
            node: list[component].node,
            message: 'Enforce components to be written as a class'
          });
        });
      }
    };
  })
};
