import { describe, it, expect } from 'vitest'
import { insertImports } from '../insertImports'

describe('insertImports', () => {
	it('should insert new imports into a component with existing imports from the same module', () => {
		const content = `
      <script>
        import { Mesh } from 'three';
      </script>
    `
		const newImports = new Set(['Group', 'type Material'])
		const result = insertImports(newImports, content)
		expect(result?.code).toContain(`import { Mesh } from 'three'`)
		expect(result?.code).toContain(`import { Group, type Material } from 'three'`)
	})

	it('should insert new imports into a component with existing imports from different modules', () => {
		const content = `
      <script>
        import { someOtherThing } from 'another-module';
      </script>
    `
		const newImports = new Set(['Mesh', 'Group'])
		const result = insertImports(newImports, content)
		expect(result?.code).toContain(`import { someOtherThing } from 'another-module'`)
		expect(result?.code).toContain(`import { Mesh, Group } from 'three'`)
	})

	it('should not insert duplicate imports', () => {
		const content = `
      <script>
        import { Mesh } from 'three';
      </script>
    `
		const newImports = new Set(['Mesh', 'Group'])
		const result = insertImports(newImports, content)
		expect(result?.code).not.toContain(`import { Mesh, Mesh`)
		expect(result?.code).toContain(`import { Mesh } from 'three'`)
		expect(result?.code).toContain(`import { Group } from 'three'`)
	})

	it('should handle an empty set of new imports', () => {
		const content = `
      <script>
        import { Mesh } from 'three';
      </script>
	  `
		const newImports = new Set<string>()
		const result = insertImports(newImports, content)
		expect(result?.code).toEqual(content) // No changes
	})

	it('should not insert imports if all new imports already exist in the component', () => {
		const content = `
      <script>
        import { Mesh, Group } from 'three';
      </script>
    `
		const newImports = new Set(['Mesh', 'Group'])
		const result = insertImports(newImports, content)
		expect(result?.code).toEqual(content) // No changes
	})
})
