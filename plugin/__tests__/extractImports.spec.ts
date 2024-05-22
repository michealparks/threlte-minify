import { describe, it, expect } from 'vitest'
import { extractImports } from '../extractImports'

describe('extractImports', () => {
	it('returns an array of imports from the specified module', () => {
		const code = `
      import { Mesh, Group, type Material } from 'three'
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})

	it('returns an empty array if no match for the specified module', () => {
		const code = `
	    import { Mesh, Group, type Material } from 'other-module'
	  `
		const result = extractImports(code, 'three')
		expect(result).toEqual([])
	})

	it('returns an empty array if there are no import statements', () => {
		const code = ``
		const result = extractImports(code, 'three')
		expect(result).toEqual([])
	})

	it('handles multiple import statements', () => {
		const code = `
			import { Mesh, Group, type Material } from 'three'
			import { anotherThing } from 'another-module'
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})

	it('handles strange whitespace', () => {
		const code = `
      <script>
        import {   Mesh   ,   Group ,  type Material   } from 'three'
      </script>
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})

	it('handles imports with type and as keywords', () => {
		const code = `
      <script>
        import { Mesh, type Material, Object3D as ThreeObject } from 'three'
      </script>
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'type Material', 'Object3D as ThreeObject'])
	})

	it('handles multiple import statements from the same module', () => {
		const code = `
      <script>
        import { Mesh } from 'three'
        import { Group, type Material } from 'three'
      </script>
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})
})
