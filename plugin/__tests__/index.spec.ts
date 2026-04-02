import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { threlteMinify } from '../index.js'

const getTransform = () => {
	const plugin = threlteMinify()

	if (!plugin || Array.isArray(plugin) || !('transform' in plugin) || !plugin.transform) {
		throw new Error('Expected a Vite plugin with a transform hook')
	}

	return plugin.transform
}

const getExportedNames = (code: string) => {
	const names = new Set<string>()

	for (const match of code.matchAll(/export const (\w+)/g)) {
		names.add(match[1])
	}

	for (const match of code.matchAll(/export \{\s*default as (\w+)\s*\}/g)) {
		names.add(match[1])
	}

	return [...names].sort()
}

describe('threlteMinify', () => {
	it('transforms aliased T dot components', async () => {
		const transform = getTransform()
		const result = await transform.call(
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

		if (!result || typeof result === 'string') {
			throw new Error('Expected an object transform result')
		}

		expect(JSON.parse(result.map)).toMatchObject({
			version: 3,
			sources: ['Test.svelte'],
		})
	})

	it('does not transform non-Threlte T components', async () => {
		const transform = getTransform()
		const source = `
				<script>
					import * as T from './local.js'
				</script>
				<T.Mesh />
			`
		const result = await transform.call({}, source, '/virtual/Test.svelte')

		expect(result).toBeUndefined()
	})

	it('preserves the installed @threlte/core T.js export contract when overwriting', async () => {
		const transform = getTransform()
		const id = resolve(process.cwd(), 'node_modules/@threlte/core/dist/components/T/T.js')
		const source = await readFile(id, 'utf8')

		expect(getExportedNames(source)).toEqual(['T', 'extend'])

		const result = await transform.call({}, source, id)

		if (!result || typeof result === 'string') {
			throw new Error('Expected an object transform result')
		}

		expect(getExportedNames(result.code)).toEqual(['T', 'extend'])
		expect(result.code).toContain(`export { default as T } from './T.svelte'`)
		expect(result.code).toContain(`export const extend = () => {`)
		expect(result.code).not.toContain(`import * as THREE from 'three'`)
		expect(JSON.parse(result.map.toString())).toMatchObject({
			version: 3,
			sources: [''],
		})
	})
})
