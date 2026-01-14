# biome-plugin-react-compiler

[![npm version](https://badge.fury.io/js/biome-plugin-react-compiler.svg)](https://www.npmjs.com/package/biome-plugin-react-compiler)
[![CI](https://github.com/Insik-Han/biome-plugin-react-compiler/actions/workflows/ci.yml/badge.svg)](https://github.com/Insik-Han/biome-plugin-react-compiler/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Biome linter plugins for React Compiler rules using GritQL.

This plugin detects **prop mutation** patterns that would cause issues with the [React Compiler](https://react.dev/learn/react-compiler).

## Requirements

- Biome v2.0.0 or later (GritQL plugin support)
- Node.js 18+

## Installation

```bash
npm install -D biome-plugin-react-compiler @biomejs/biome
```

Add plugins to your `biome.json`:

```json
{
  "plugins": [
    "./node_modules/biome-plugin-react-compiler/rules/no-prop-mutation.grit",
    "./node_modules/biome-plugin-react-compiler/rules/no-props-array-push.grit",
    "./node_modules/biome-plugin-react-compiler/rules/no-props-array-pop.grit",
    "./node_modules/biome-plugin-react-compiler/rules/no-props-array-splice.grit",
    "./node_modules/biome-plugin-react-compiler/rules/no-props-array-sort.grit",
    "./node_modules/biome-plugin-react-compiler/rules/no-props-array-reverse.grit"
  ]
}
```

### CLI Helper

```bash
# Show the plugins config to copy
npx biome-plugin-react-compiler init

# List available rules
npx biome-plugin-react-compiler list
```

## Rules

### no-prop-mutation

Detects direct assignment to `props` properties.

```tsx
// Bad
props.name = "new name"; // ❌ Flagged

// Good
const newProps = { ...props, name: "new name" };
```

### no-props-array-push/pop/splice/sort/reverse

Detects mutating array methods called on `props`.

```tsx
// Bad
props.items.push("new");    // ❌ Flagged
props.items.pop();          // ❌ Flagged
props.items.splice(0, 1);   // ❌ Flagged
props.items.sort();         // ❌ Flagged
props.items.reverse();      // ❌ Flagged

// Good
const newItems = [...props.items, "new"];
const sorted = [...props.items].sort();
```

## Limitations

These rules use static pattern matching (GritQL) and **cannot** perform deep semantic analysis like the actual React Compiler.

### Known Limitations

| Limitation | Impact |
|------------|--------|
| No `"use no memo"` support | Cannot exclude opted-out components/hooks |
| No destructuring detection | `{ items }` → `items.push()` not detected |
| No variable tracking | `const p = props; p.x = 1` not detected |
| Literal patterns only | Only matches `props.X` directly |

### Workaround for `"use no memo"`

If you have components that use `"use no memo"`, exclude them via biome.json:

```json
{
  "overrides": [{
    "includes": ["**/opted-out-components/**"],
    "plugins": []
  }]
}
```

## Comparison with eslint-plugin-react-compiler

| Feature | This Plugin | eslint-plugin-react-compiler |
|---------|-------------|------------------------------|
| Prop mutation (`props.x = y`) | ✅ Direct patterns | ✅ Full flow analysis |
| Array mutation (`props.arr.push()`) | ✅ Direct patterns | ✅ Full flow analysis |
| Destructured props | ❌ Not detected | ✅ Full analysis |
| `"use no memo"` | ❌ Not supported | ✅ Respected |
| Performance | ✅ Very fast | ⚠️ Runs full compiler |

For complete React Compiler validation, use the official [eslint-plugin-react-compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler).

## Contributing

Contributions are welcome! Please open an issue or PR.

## License

MIT
