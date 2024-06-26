import { describe, expect, it } from 'vitest'
import { replaceDotComponents } from '../replaceDotComponents.js'

describe('replaceDotComponents', () => {
	it('replaces <T.SomeClass> with <T is={THRELTE_MINIFY__SomeClass}>', () => {
		const content = `<T.SomeClass></T.SomeClass>`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`<T is={THRELTE_MINIFY__SomeClass}></T>`)
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

	it('handles mixed components', () => {
		const content = `
			<T
				is={group}
				bind:ref
				{...props}
			>
				<T.Group rotation.x={Math.PI / 2}>
					<T.Mesh
						scale.y={-1}
						rotation.x={-Math.PI / 2}
						material={shadowMaterial}
						geometry={planeGeometry}
					/>

					<T
						is={shadowCamera}
						manual
					/>

					<slot ref={group} />
				</T.Group>
			</T>
		`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`
			<T
				is={group}
				bind:ref
				{...props}
			>
				<T is={THRELTE_MINIFY__Group} rotation.x={Math.PI / 2}>
					<T is={THRELTE_MINIFY__Mesh}
						scale.y={-1}
						rotation.x={-Math.PI / 2}
						material={shadowMaterial}
						geometry={planeGeometry}
					/>

					<T
						is={shadowCamera}
						manual
					/>

					<slot ref={group} />
				</T>
			</T>
		`)
		expect(imports.has('Group as THRELTE_MINIFY__Group')).toBe(true)
		expect(imports.has('Mesh as THRELTE_MINIFY__Mesh')).toBe(true)
	})

	it('replaces components with attributes', () => {
		const content = `
			<T.SomeClass attribute="value" {prop} {...$$restProps}>
				<slot />
			</T.SomeClass>
		`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`
			<T is={THRELTE_MINIFY__SomeClass} attribute="value" {prop} {...$$restProps}>
				<slot />
			</T>
		`)
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

	it('handles import { x as y }', () => {
		const content = `
			<script>
				import { T as C } from '@threlte/core'
			</script>
			<C.SomeClass />
		`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`
			<script>
				import { T as C } from '@threlte/core'
			</script>
			<C is={THRELTE_MINIFY__SomeClass} />
		`)
		expect(imports.size).toBe(1)
	})

	it('does not replace <T.> in the script section', () => {
		const content = `
			<script>
				import { T } from '@threlte/core'
				const str = '<T.Component />'
			</script>
			<T.Mesh></T.Mesh>
		`
		const imports = new Set<string>()
		const result = replaceDotComponents(imports, content)
		expect(result.code).toBe(`
			<script>
				import { T } from '@threlte/core'
				const str = '<T.Component />'
			</script>
			<T is={THRELTE_MINIFY__Mesh}></T>
		`)
		expect(imports.size).toBe(1)
	})
})
