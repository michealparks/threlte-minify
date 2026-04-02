import { describe, expect, it } from 'vitest'
import { compile } from '../compile.js'

describe('compile', () => {
	const component = `
    <script context="module" lang="ts">
      import { Group } from 'three'
    </script>
    <script lang="ts">
      import { Canvas, T } from '@threlte/core'
    </script>

    <Canvas>
      <T.Group>
        <T.Mesh>
          <T is={Group}>

          </T>
        </T.Mesh>
      </T.Group>
    </Canvas>
  `

	it('Correctly modifies <T.> components during compilation', async () => {
		const result = await compile(component, 'file.svelte')
		expect(result.code).toBe(`
    <script context="module" lang="ts">
      import { Group } from 'three'
    </script>
    <script lang="ts">
import { Group as THRELTE_MINIFY__Group, Mesh as THRELTE_MINIFY__Mesh } from 'three'

      import { Canvas, T } from '@threlte/core'
    </script>

    <Canvas>
      <T is={THRELTE_MINIFY__Group}>
        <T is={THRELTE_MINIFY__Mesh}>
          <T is={Group}>

          </T>
        </T>
      </T>
    </Canvas>
  `)
	})

	it('does not transform comment, style, or text literals that contain <T.>', async () => {
		const source = `
    <script>
      import { T } from '@threlte/core'
    </script>
    <!-- <T.Mesh /> -->
    <style>.x::before { content: "<T.Mesh />"; }</style>
    <p>{'<T.Mesh />'}</p>
  `
		const result = await compile(source, 'file.svelte')
		expect(result.code).toBe(source)
	})

	it('does not transform components when T is not imported from @threlte/core', async () => {
		const source = `
    <script>
      import * as T from './local.js'
    </script>
    <T.Mesh />
  `
		const result = await compile(source, 'file.svelte')
		expect(result.code).toBe(source)
	})

	it('is idempotent and returns a source map for transformed components', async () => {
		const source = `
    <script>
      import { T } from '@threlte/core'
    </script>
    <T.Mesh />
  `
		const first = await compile(source, '/virtual/Test.svelte')
		const second = await compile(first.code, '/virtual/Test.svelte')

		expect(second.code).toBe(first.code)
		expect(first.map).toMatchObject({
			version: 3,
			sources: ['Test.svelte'],
		})
		expect(second.map).toMatchObject({
			version: 3,
			sources: ['Test.svelte'],
		})
	})
})
