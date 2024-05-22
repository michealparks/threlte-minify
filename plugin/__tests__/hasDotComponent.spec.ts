import { describe, it, expect } from 'vitest'
import { hasDotComponent } from '../hasDotComponent'

describe('hasDotComponent', () => {
	it('returns true when the code contains a <T.>', () => {
		const code = `
      <script></script>
      <T.Mesh></T.Mesh>
    `
		expect(hasDotComponent(code)).toBe(true)
	})

	it('returns true when the code contains multiple <T.> instances', () => {
		const code = `
      <T.Mesh></T.Mesh>
      <T.Object3D attribute="value" {...$$restProps}></T.Object3D>
    `
		expect(hasDotComponent(code)).toBe(true)
	})

	it('returns false when the code does not contain any <T.Component>', () => {
		const code = ``
		expect(hasDotComponent(code)).toBe(false)
	})

	it('should return false when the code contains <T> but not <T.>', () => {
		const code = `
			<T></T>
			<T is={something}></T>
			<Threlte></Threlte>
    `
		expect(hasDotComponent(code)).toBe(false)
	})
})
