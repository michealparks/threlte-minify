# threlte-minify

A Vite plugin that produces smaller and faster [Threlte](https://threlte.xyz) apps.

> **Note:** This plugin is not compatible with Threlte's `extend` function.

## Install

```bash
npm i -D threlte-minify
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { threlteMinify } from 'threlte-minify'

export default defineConfig({
  plugins: [threlteMinify(), sveltekit()],
})
```

## Results

Tested on a simple scene with a few meshes and materials:

| Configuration | Size | Gzip |
|---|---:|---:|
| No plugins | 810.88 kB | 213.82 kB |
| threlte-minify | 576.58 kB | 150.13 kB |
| threlte-minify + [three-minifier](https://github.com/nickyMcDonald/three-minifier) | 550.64 kB | 145.96 kB |

## How it works

Threlte's `<T.Mesh>` syntax relies on a proxy that does `import * as THREE from 'three'` to resolve Three.js classes at runtime. This has two costs:

1. **Bundle size** -- the wildcard import prevents tree-shaking, pulling in all of Three.js regardless of what you use.
2. **Runtime speed** -- every `<T.Something>` goes through a proxy lookup to resolve the class.

This plugin preprocesses your Svelte components, transforming them from this:

```svelte
<script>
  import { T } from '@threlte/core'
</script>

<T.Mesh>
  <T.BoxGeometry />
  <T.MeshStandardMaterial color="orange" />
</T.Mesh>
```

...into this:

```svelte
<script>
  import { Mesh as THRELTE_MINIFY__Mesh } from 'three'
  import { BoxGeometry as THRELTE_MINIFY__BoxGeometry } from 'three'
  import { MeshStandardMaterial as THRELTE_MINIFY__MeshStandardMaterial } from 'three'
  import { T } from '@threlte/core'
</script>

<T is={THRELTE_MINIFY__Mesh}>
  <T is={THRELTE_MINIFY__BoxGeometry} />
  <T is={THRELTE_MINIFY__MeshStandardMaterial} color="orange" />
</T>
```

By replacing proxy-resolved dot notation with direct imports, the bundler can tree-shake unused Three.js classes and the runtime skips the proxy entirely.

The plugin also removes the wildcard import from Threlte's internals to complete the tree-shaking.

## License

MIT
