import { describe, expect, it } from 'vitest'
import { replaceDotComponents } from '../replaceDotComponents'

describe('replaceDotComponents', () => {
	it('replaces <T.SomeClass> with <T is={THRELTE_MINIFY__SomeClass}>', () => {
		const content = `<T.SomeClass>`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={THRELTE_MINIFY__SomeClass}>`)
		expect(imports.has('SomeClass as THRELTE_MINIFY__SomeClass')).toBe(true)
	})

	it('handles empty components', () => {
		const content = ''
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe('')
		expect(imports.size).toBe(0)
	})

	it('handles nested components', () => {
		const content = `<T.Outer><T.Inner /></T.Outer>`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={THRELTE_MINIFY__Outer}><T is={THRELTE_MINIFY__Inner} /></T>`)
		expect(imports.has('Outer as THRELTE_MINIFY__Outer')).toBe(true)
		expect(imports.has('Inner as THRELTE_MINIFY__Inner')).toBe(true)
	})

	it('replaces components with attributes', () => {
		const content = `<T.SomeClass attribute="value" {prop} {...$$restProps}><slot /></T>`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(
			`<T is={THRELTE_MINIFY__SomeClass} attribute="value" {prop} {...$$restProps}><slot /></T>`
		)
		expect(imports.has('SomeClass as THRELTE_MINIFY__SomeClass')).toBe(true)
	})

	it('replaces closing tags', () => {
		const content = `<T.SomeClass></T.SomeClass>`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={THRELTE_MINIFY__SomeClass}></T>`)
		expect(imports.has('SomeClass as THRELTE_MINIFY__SomeClass')).toBe(true)
	})

	it('does not affect components without .', () => {
		const content = `<T is={SomeClass} />`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={SomeClass} />`)
		expect(imports.size).toBe(0)
	})

	it.skip('handles import { x as y }', () => {
		const content = `<C.SomeClass />`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<C is={SomeClass} />`)
		expect(imports.size).toBe(0)
	})

	it('does not replace <T.> in the script section', () => {
		const content = `
      <script>
        const str = '<T.Component />
      </script>
    `
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(content)
		expect(imports.size).toBe(0)
	})
})
