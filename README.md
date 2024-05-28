# threlte-minify

An 🚧 experimental 🚧 vite plugin to produce better minification results when building a Threlte app.

It is only compatible with Svelte 5 and `@threlte/core@next` at the moment.

```bash
npm i -D michealparks/threlte-minify
```

```ts
import { threlteMinify } from 'threlte-minify'

export default defineConfig({
	build: {
		minify: true,
	},
	plugins: [threlteMinify()],
})
```

## How does it do it?

Threlte needs to `import * as THREE from 'three'` in order to resolve components such as `<T.Mesh>`.

This plugin preprocesses your svelte components, transforming them from this:

```svelte
<script>
	import { T } from '@threlte/core'
</script>

<T.Mesh>...</T.Mesh>
```

...to this:

```svelte
<script>
	import { Mesh as THRELTE_MINIFY__Mesh } from 'three'
	import { T } from '@threlte/core'
</script>

<T is={THRELTE_MINIFY__Mesh}>...</T>
```

The import is aliased to attempt to avoid collisions with existing imports / identifiers.

Finally, it removes the aforementioned wildcard import from Threlte's internals.

This allows more THREE components to be treeshaken.

### Issues

Currently...

- it will not work if you've aliased your T import, like `import { T as C } from '@threlte/core`
