import { describe, expect, it } from 'vitest'
import { findImportAlias } from '../findImportAlias.js'

describe('findImportAlias', () => {
	it('returns the alias when the import statement is correctly formatted', () => {
		const svelteComponent = `
      <script>
        import { T as y } from '@threlte/core';
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBe('y')
	})

	it('returns null when the import statement does not exist', () => {
		const svelteComponent = `
      <script>
        // no import statement
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBeNull()
	})

	it('handles no whitespace', () => {
		const svelteComponent = `
      <script>
        import{T as y}from'@threlte/core';
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBe('y')
	})

	it('returns null when the alias is not found in the import statement', () => {
		const svelteComponent = `
      <script>
        import { X as y } from '@threlte/core';
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBeNull()
	})

	it('handles extra whitespace', () => {
		const svelteComponent = `
      <script>
        import {  T  as   y      } from '@threlte/core';
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBe('y')
	})

	it('handles multiple import statements and find the correct one', () => {
		const svelteComponent = `
      <script>
        import { A as b } from '@threlte/core';
        import { T as y } from '@threlte/core';
        import { C as d } from 'otherlib';
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBe('y')
	})

	it('should return the correct alias when there are multiple imports with the same alias', () => {
		const svelteComponent = `
      <script>
        import { T as b } from 'otherlib';
        import { T as a } from '@threlte/core';
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		// Only the first match is considered
		expect(result).toBe('a')
	})

	it('should handle import statements without "as"', () => {
		const svelteComponent = `
      <script>
        import { T } from '@threlte/core';
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBeNull()
	})

	it('should handle an empty component string', () => {
		const svelteComponent = ``
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBeNull()
	})

	it('should handle multiple imports from the same library', () => {
		const svelteComponent = `
      <script>
        import { A as a, T as y, C as c } from '@threlte/core';
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBe('y')
	})

	it('should handle multiple lines of imports from the same library', () => {
		const svelteComponent = `
      <script>
        import {
          A as a,
          T as y,
          C as c
        } from '@threlte/core';
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBe('y')
	})

	it('should handle import statement with double quotes', () => {
		const svelteComponent = `
      <script>
        import { A as a, T as y, C as c } from "@threlte/core";
      </script>
    `
		const alias = 'T'
		const result = findImportAlias(svelteComponent, alias)
		expect(result).toBe('y')
	})
})
