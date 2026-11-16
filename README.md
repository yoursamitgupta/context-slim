# ContextSlim ⚡

> **Semantic AST context minifier for AI coding agents.**  
> Condenses TypeScript, JavaScript, and Python codebases by 80%+ while preserving interfaces, type annotations, and docstrings intact.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)](#)
[![Node.js CI](https://img.shields.io/badge/Node.js-18%2B-green.svg)](#)

---

## 🎯 The Problem

When coding agents (Cursor, Claude Code, Aider, Antigravity) inspect large repositories, feeding full source files causes two major issues:
1. **Context Window Exhaustion:** Complex files with hundreds of lines of loop logic burn through your context quota in minutes.
2. **Attention Degradation ("Lost in the Middle"):** LLMs perform significantly worse at reasoning when surrounded by thousands of lines of irrelevant implementation boilerplate.

## ⚡ The Solution

**ContextSlim** strips inner loop and business logic while keeping the semantic skeleton that AI models actually need:
- Module imports and exports
- Interfaces, type definitions, and enums
- Function & method signatures with parameter and return types
- JSDoc / TSDoc / Python docstrings

```
[1,200-line File] ──> ⚡ ContextSlim ──> [45-line Semantic Interface] (-85% tokens)
```

---

## 🚀 Quick Start

Run directly via `npx` with **zero installation**:

```bash
# Minify a single file
npx context-slim src/index.ts

# Minify an entire project directory with token metrics
npx context-slim ./src --tokens

# Save minified context to a file for prompt pasting
npx context-slim ./src -o context.md
```

---

## 📊 CLI Options

| Flag | Description |
| :--- | :--- |
| `-t, --tokens` | Show token reduction metrics and savings percentage |
| `-o, --output <file>` | Write minified context to an output file |
| `--raw` | Output plain code without markdown formatting |
| `--json` | Return structured JSON with per-file stats |
| `-h, --help` | Display usage instructions |

---

## 💻 Programmatic Usage

You can also use ContextSlim as a library in your own Node.js tools:

```javascript
import { slimCode, computeReduction } from 'context-slim';

const tsCode = `
export function processPayment(amount: number): boolean {
  // 50 lines of payment processing logic...
  return true;
}
`;

const minified = slimCode(tsCode, 'javascript');
console.log(minified);
// Output: export function processPayment(amount: number): boolean { /* implementation truncated */ }
```

---

## 🛡️ License

MIT © [Amit Gupta](https://github.com/yoursamitgupta)
