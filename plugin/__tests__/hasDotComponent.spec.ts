import { describe, it, expect } from 'vitest'
import { hasDotComponent } from '../hasDotComponent'

describe('hasDotComponent', () => {
	it('should return true when the code contains a <T.Component>', () => {
		const code = `
      <script></script>
      <T.Component></T.Component>
    `
		expect(hasDotComponent(code)).toBe(true)
	})

	it('should return true when the code contains multiple <T.Component> instances', () => {
		const code = `
      <T.ComponentOne></T.ComponentOne>
      <div>Some content</div>
      <T.ComponentTwo attribute="value"></T.ComponentTwo>
    `
		expect(hasDotComponent(code)).toBe(true)
	})

	it('should return false when the code does not contain any <T.Component>', () => {
		const code = ``
		expect(hasDotComponent(code)).toBe(false)
	})

	it('should return false when the code contains <T> but not <T.Component>', () => {
		const code = `
			<T></T>
			<T is={something}></T>
			<Threlte></Threlte>
    `
		expect(hasDotComponent(code)).toBe(false)
	})
})
