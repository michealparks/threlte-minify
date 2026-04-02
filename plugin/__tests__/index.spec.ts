import { describe, expect, it } from 'vitest'
import { threlteMinify } from '../index.js'

describe('threlteMinify', () => {
	it('transforms aliased T dot components', async () => {
		const plugin = threlteMinify()

		if (!plugin || Array.isArray(plugin) || !('transform' in plugin) || !plugin.transform) {
			throw new Error('Expected a Vite plugin with a transform hook')
		}

		const result = await plugin.transform.call(
			{},
			`
				<script>
					import { T as C } from '@threlte/core'
				</script>
				<C.Mesh />
			`,
			'/virtual/Test.svelte'
		)

		expect(result).toMatchObject({
			code: `
				<script>
import { Mesh as THRELTE_MINIFY__Mesh } from 'three'

					import { T as C } from '@threlte/core'
				</script>
				<C is={THRELTE_MINIFY__Mesh} />
			`,
		})
	})

	it('does not transform non-Threlte T components', async () => {
		const plugin = threlteMinify()

		if (!plugin || Array.isArray(plugin) || !('transform' in plugin) || !plugin.transform) {
			throw new Error('Expected a Vite plugin with a transform hook')
		}

		const source = `
				<script>
					import * as T from './local.js'
				</script>
				<T.Mesh />
			`
		const result = await plugin.transform.call({}, source, '/virtual/Test.svelte')

		expect(result).toBeUndefined()
	})
})
