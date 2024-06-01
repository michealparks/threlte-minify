import { describe, expect, it } from 'vitest'
import { extractExistingImports } from '../extractExistingImports.js'

describe('extractExistingImports', () => {
	it('returns an array of imports from the specified module', () => {
		const code = `
      import { Mesh, Group, type Material } from 'three'
    `
		const result = extractExistingImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})

	it('returns an empty array if no match for the specified module', () => {
		const code = `
	    import { Mesh, Group, type Material } from 'other-module'
	  `
		const result = extractExistingImports(code, 'three')
		expect(result).toEqual([])
	})

	it('returns an empty array if there are no import statements', () => {
		const code = ``
		const result = extractExistingImports(code, 'three')
		expect(result).toEqual([])
	})

	it('handles multiple import statements', () => {
		const code = `
			import { Mesh, Group, type Material } from 'three'
			import { anotherThing } from 'another-module'
    `
		const result = extractExistingImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})

	it('handles strange whitespace', () => {
		const code = `
      import {   Mesh   ,   Group ,  type Material   } from 'three'
    `
		const result = extractExistingImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})

	it('handles imports with type and as keywords', () => {
		const code = `
      import { Mesh, type Material, Object3D as ThreeObject } from 'three'
    `
		const result = extractExistingImports(code, 'three')
		expect(result).toEqual(['Mesh', 'type Material', 'Object3D as ThreeObject'])
	})

	it('handles multiple import statements from the same module', () => {
		const code = `
			import { Mesh } from 'three'
			import { Group, type Material } from 'three'
    `
		const result = extractExistingImports(code, 'three')
		expect(result).toEqual(['Mesh', 'Group', 'type Material'])
	})
})
