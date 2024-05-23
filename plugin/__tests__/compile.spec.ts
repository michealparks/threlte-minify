import { describe, it, expect } from 'vitest'
import { compile } from '../compile'

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
		const result = await compile(component)
		expect(result.code).toBe(`
    <script context="module" lang="ts">
import { Group as THRELTE_MINIFY__Group, Mesh as THRELTE_MINIFY__Mesh } from 'three'

      import { Group } from 'three'
    </script>
    <script lang="ts">
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
})
