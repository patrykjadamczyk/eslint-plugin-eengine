# Enforce components to be written as a class (eengine/enforce-classes)

Class-based components are easier to read.

## Rule Details

This rule will check for function based React components.

If function based React component are found, the rule will warn you to write this component as a class based component.

The following pattern is considered a warning:

```jsx
function Foo (props) {
    return <div>{props.foo}</div>
}
```

The following pattern is **not** considered a warning:

```jsx
class Foo extends React.Component {
  render() {
    return <div>{this.props.foo}</div>;
  }
}

```


## Rule Options

```js
...
"eengine/enforce-classes": [<enabled>]
...
```

* `enabled`: for enabling the rule. 0=off, 1=warn, 2=error. Defaults to 0.
