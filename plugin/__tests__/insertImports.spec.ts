import { describe, it, expect } from 'vitest'
import { insertImports } from '../insertImports'

describe('insertImports', () => {
	it('inserts new imports into a component with existing imports from the same module', () => {
		const content = `
      import { Mesh } from 'three'
    `
		const newImports = new Set(['Group', 'Material'])
		const result = insertImports(newImports, content)
		expect(result?.code).toContain(`import { Mesh } from 'three'`)
		expect(result?.code).toContain(`import { Group, Material } from 'three'`)
	})

	it('inserts new imports into a component with existing imports from different modules', () => {
		const content = `
      import { someOtherThing } from 'another-module'
    `
		const newImports = new Set(['Mesh', 'Group'])
		const result = insertImports(newImports, content)
		expect(result?.code).toContain(`import { someOtherThing } from 'another-module'`)
		expect(result?.code).toContain(`import { Mesh, Group } from 'three'`)
	})

	it('does not insert duplicate imports', () => {
		const content = `
      import { Mesh } from 'three'
    `
		const newImports = new Set(['Mesh', 'Group'])
		const result = insertImports(newImports, content)
		expect(result?.code).not.toContain(`import { Mesh, Mesh`)
		expect(result?.code).toContain(`import { Mesh } from 'three'`)
		expect(result?.code).toContain(`import { Group } from 'three'`)
	})

	it('handles an empty set of new imports', () => {
		const content = `
      import { Mesh } from 'three'
	  `
		const newImports = new Set<string>()
		const result = insertImports(newImports, content)
		expect(result?.code).toEqual(content) // No changes
	})

	it('should not insert imports if all new imports already exist in the component', () => {
		const content = `
      import { Mesh, Group } from 'three'
    `
		const newImports = new Set(['Mesh', 'Group'])
		const result = insertImports(newImports, content)
		expect(result?.code).toEqual(content) // No changes
	})

	it.skip('renames imports if identifier already exists', () => {
		const content = `
      import { Mesh } from 'three'
      import { Group } from 'some-other-lib'
    `
		const newImports = new Set(['Group'])
		const result = insertImports(newImports, content)
		expect(result?.code).toContain(`import { Mesh, Group as THRELTE_MINIFY__Group } from 'three'`)
		expect(result?.code).toContain(`import { Group } from 'three'`)
	})

	it.skip('replaces an import type statement if identifier is duplicated', () => {
		const content = `
      import { Mesh, type Group } from 'three'
    `
		const newImports = new Set(['Group'])
		const result = insertImports(newImports, content)
		expect(result?.code).toContain(`import { Mesh, Group } from 'three'`)
	})
})