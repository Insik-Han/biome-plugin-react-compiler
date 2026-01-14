# biome-plugin-react-compiler

[![CI](https://github.com/Insik-Han/biome-plugin-react-compiler/actions/workflows/ci.yml/badge.svg)](https://github.com/Insik-Han/biome-plugin-react-compiler/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/Insik-Han/biome-plugin-react-compiler)](https://github.com/Insik-Han/biome-plugin-react-compiler/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Biome linter plugins for React Compiler rules using GritQL.

This plugin provides static analysis rules that detect common violations that would cause issues with the [React Compiler](https://react.dev/learn/react-compiler).

## Requirements

- Biome v2.0.0 or later (GritQL plugin support)
- Node.js 18+
- React project

## Installation

### From GitHub Packages

```bash
# Configure npm to use GitHub Packages for @insik-han scope
echo "@insik-han:registry=https://npm.pkg.github.com" >> .npmrc

# Install the package
npm install -D @insik-han/biome-plugin-react-compiler @biomejs/biome

# Initialize the plugin (copies rules and updates biome.json)
npx biome-plugin-react-compiler init
```

### From npm (legacy)

```bash
npm install -D biome-plugin-react-compiler @biomejs/biome
npx biome-plugin-react-compiler init
```

### CLI Options

```bash
# Initialize with custom directory
npx biome-plugin-react-compiler init --dir ./rules

# Initialize without updating biome.json
npx biome-plugin-react-compiler init --no-update

# List available rules
npx biome-plugin-react-compiler list
```

### Manual Installation

If you prefer manual setup:

1. Copy the `rules/` directory from the package to your project
2. Add the plugins to your `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "plugins": [
    "./biome-plugins/no-try-catch-in-render.grit",
    "./biome-plugins/no-ref-access-in-render.grit",
    "./biome-plugins/no-prop-mutation.grit",
    "./biome-plugins/no-props-array-push.grit",
    "./biome-plugins/no-props-array-pop.grit",
    "./biome-plugins/no-props-array-splice.grit",
    "./biome-plugins/no-props-array-sort.grit",
    "./biome-plugins/no-props-array-reverse.grit"
  ]
}
```

## Rules

### no-try-catch-in-render

Detects `try/catch` blocks that may be used to handle JSX rendering errors.

**Why?** React errors in child components cannot be caught by try/catch. Use [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) instead.

```tsx
// Bad
function Component() {
  try {
    return <ChildComponent />;
  } catch (error) {
    return <div>Error</div>;
  }
}

// Good
<ErrorBoundary fallback={<div>Error</div>}>
  <ChildComponent />
</ErrorBoundary>
```

### no-ref-access-in-render (⚠️ High false positive rate)

Detects `ref.current` access. Due to GritQL limitations, this rule cannot distinguish between render-time access and valid access in effects/handlers.

**Why?** Refs are mutable and reading them during render breaks React's rendering model.

**Note:** This rule will flag valid usage in effects and event handlers. Consider removing from your config if too noisy.

```tsx
// Bad (during render)
function Component() {
  const ref = useRef(null);
  const value = ref.current; // ❌ Flagged
  return <div>{value}</div>;
}

// Good (but also flagged due to limitations)
useEffect(() => {
  console.log(ref.current); // ⚠️ Also flagged
}, []);
```

### no-prop-mutation

Detects direct assignment to `props` properties.

```tsx
// Bad
props.name = "new name"; // ❌ Flagged
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

## Usage

Run Biome linter:

```bash
npx biome lint .
```

Or check with all Biome features:

```bash
npx biome check .
```

## Programmatic API

```typescript
import {
  RULES,
  getRulesDir,
  getRulePath,
  getRuleContent,
  getBiomePluginConfig,
} from "@insik-han/biome-plugin-react-compiler";

// Get all rule names
console.log(RULES);
// ['no-try-catch-in-render', 'no-ref-access-in-render', ...]

// Get path to rules directory
console.log(getRulesDir());

// Get content of a specific rule
const content = getRuleContent("no-try-catch-in-render");

// Get biome.json plugin config
const config = getBiomePluginConfig("./my-rules");
// { plugins: ['./my-rules/no-try-catch-in-render.grit', ...] }
```

## Limitations

These rules use static pattern matching (GritQL) and **cannot** perform deep semantic analysis like the actual React Compiler.

### Known Limitations

| Limitation | Impact |
|------------|--------|
| No control flow analysis | Cannot exclude refs in effects/handlers |
| No scope tracking | Cannot detect nested component definitions |
| No data flow analysis | Cannot track variable mutations |
| Basic pattern matching only | Limited to literal `props.X` patterns |

### False Positives

- `no-ref-access-in-render` will flag valid usage in effects and event handlers
- Rules may not detect patterns with variable indirection (e.g., `const p = props; p.x = 1`)

### Not Implemented

Due to GritQL limitations in Biome, these rules are not implementable:

- **no-nested-components** - Requires scope analysis
- **no-set-state-in-render** - Requires control flow analysis
- **exhaustive-deps** - Use Biome's built-in `useExhaustiveDependencies`
- **purity checks** - Requires semantic analysis

## Comparison with eslint-plugin-react-compiler

| Feature | This Plugin | eslint-plugin-react-compiler |
|---------|-------------|------------------------------|
| Error Boundaries | ✅ Basic detection | ✅ Full analysis |
| Ref access | ⚠️ High false positives | ✅ Full flow analysis |
| Prop mutation | ✅ Direct patterns only | ✅ Full flow analysis |
| Nested components | ❌ Not possible | ✅ Full analysis |
| setState in render | ❌ Not possible | ✅ Full analysis |
| Performance | ✅ Very fast | ⚠️ Runs full compiler |

For complete React Compiler validation, use the official [eslint-plugin-react-compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler).

## Contributing

Contributions are welcome! Please open an issue or PR.

## License

MIT
