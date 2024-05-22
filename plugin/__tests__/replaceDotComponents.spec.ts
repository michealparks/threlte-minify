import { describe, it, expect } from 'vitest'
import { replaceDotComponents } from '../replaceDotComponents'

describe('replaceDotComponents', () => {
	it('replaces <T.SomeClass> with <T is={SomeClass}>', () => {
		const content = `<T.SomeClass />`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={SomeClass} />`)
		expect(imports.has('SomeClass')).toBe(true)
	})

	it('handles nested components', () => {
		const content = `<T.Outer><T.Inner /></T.Outer>`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={Outer}><T is={Inner} /></T>`)
		expect(imports.has('Outer')).toBe(true)
		expect(imports.has('Inner')).toBe(true)
	})

	it('handles components with attributes', () => {
		const content = `<T.SomeClass attribute="value" />`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={SomeClass} attribute="value" />`)
		expect(imports.has('SomeClass')).toBe(true)
	})

	it('handles closing tags', () => {
		const content = `<T.SomeClass></T.SomeClass>`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={SomeClass}></T>`)
		expect(imports.has('SomeClass')).toBe(true)
	})

	it('should not affect components without .', () => {
		const content = `<T is={SomeClass} />`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={SomeClass} />`)
		expect(imports.size).toBe(0)
	})

	it('should handle an empty component', () => {
		const content = ``
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(``)
		expect(imports.size).toBe(0)
	})
})
