import { describe, it, expect } from 'vitest'
import { extractImports } from '../extractImports'

describe('extractImports', () => {
	it('should return an array of imports from the specified module', () => {
		const code = `
      <script>
        import { Mesh, Group, type Material } from 'three';
      </script>
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})

	it('should return an empty array if the import statement does not match the specified module', () => {
		const code = `
	    <script>
	      import { Mesh, Group, type Material } from 'other-module';
	    </script>
	  `
		const result = extractImports(code, 'three')
		expect(result).toEqual([])
	})

	it('should return an empty array if there are no import statements', () => {
		const code = `<script></script>`
		const result = extractImports(code, 'three')
		expect(result).toEqual([])
	})

	it('should handle multiple import statements and only extract the specified module', () => {
		const code = `
      <script>
        import { Mesh, Group, type Material } from 'three';
        import { anotherThing } from 'another-module';
      </script>
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})

	it('should handle whitespace correctly', () => {
		const code = `
      <script>
        import {   Mesh   ,   Group ,  type Material   } from 'three';
      </script>
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})

	it('should handle imports with type and as keywords', () => {
		const code = `
      <script>
        import { Mesh, type Material, Object3D as ThreeObject } from 'three';
      </script>
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'type Material', 'Object3D as ThreeObject'])
	})

	it('should handle multiple import statements from the same module', () => {
		const code = `
      <script>
        import { Mesh } from 'three';
        import { Group, type Material } from 'three';
      </script>
    `
		const result = extractImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})
})
