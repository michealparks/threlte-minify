import { describe, expect, it } from 'vitest'
import { stripScriptTags } from '../stripScriptTags'

describe('stripScriptTags', () => {
	it('Does not remove content that is not script tags', () => {
		const input = `<div><p>Paragraph</p></div>`
		const expected = `<div><p>Paragraph</p></div>`
		expect(stripScriptTags(input)).toBe(expected)
	})

	it('Removes a simple script tag', () => {
		const input = `<script>let name = 'world'</script><h1>Hello {name}!</h1>`
		const expected = `<h1>Hello {name}!</h1>`
		expect(stripScriptTags(input)).toBe(expected)
	})

	it('Removes multiple script tags', () => {
		const input = `<script>let name = 'world';</script><style></style><h1>Hello {name}!</h1><script>console.log('test')</script>`
		const expected = `<style></style><h1>Hello {name}!</h1>`
		expect(stripScriptTags(input)).toBe(expected)
	})

	it('Removes script tags with attributes', () => {
		const input = `<script context="module">import { foo } from 'bar'</script><script lang='ts'></script><h1>Hello</h1>`
		const expected = `<h1>Hello</h1>`
		expect(stripScriptTags(input)).toBe(expected)
	})

	it('Removes script tags nested in other tags', () => {
		const input = `<div><script>let name = 'world';</script></div>`
		const expected = `<div></div>`
		expect(stripScriptTags(input)).toBe(expected)
	})

	it('Removes script tags with unusual spacing', () => {
		const input = `<script     >let name = 'world';</script><h1>Hello {name}!</h1>`
		const expected = `<h1>Hello {name}!</h1>`
		expect(stripScriptTags(input)).toBe(expected)
	})

	it('should handle script tags with newlines inside', () => {
		const input = `<script>
      let name = 'world';
    </script><h1>Hello {name}!</h1>`
		const expected = `<h1>Hello {name}!</h1>`
		expect(stripScriptTags(input)).toBe(expected)
	})
})
