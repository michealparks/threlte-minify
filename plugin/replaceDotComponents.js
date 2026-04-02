import MagicString from 'magic-string'
import { parse } from 'svelte/compiler'

import { findImportAlias } from './findImportAlias.js'

/**
 *
 * @param {Set<string>} imports A list of imports from "THREE"
 * @param {string} content The stringified component
 * @param {string=} filename The component filename
 * @returns {{ code: string, map: import('magic-string').SourceMap }}
 */
export const replaceDotComponents = (imports, content, filename) => {
	const alias = findImportAlias(content, 'T')
	const str = new MagicString(content, { filename })

	if (!alias) {
		return {
			code: str.toString(),
			map: str.generateMap(),
		}
	}

	const ast = parse(content)

	/**
	 *
	 * @param {string} identifier
	 * @returns {boolean}
	 */
	const hasIdentifier = (identifier) => {
		const escapedIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		return new RegExp(`(?<![\\w$])${escapedIdentifier}(?![\\w$])`).test(content)
	}

	/**
	 *
	 * @param {string} componentName
	 * @returns {string}
	 */
	const getTaggedComponentName = (componentName) => {
		for (const item of imports) {
			const [imported, localName] = item.split(/\s+as\s+/)
			if (imported === componentName && localName) {
				return localName
			}
		}

		let suffix = 0
		let taggedComponentName = `THRELTE_MINIFY__${componentName}`

		while (
			hasIdentifier(taggedComponentName) ||
			[...imports].some((item) => {
				const [, localName] = item.split(/\s+as\s+/)
				return localName === taggedComponentName
			})
		) {
			suffix += 1
			taggedComponentName = `THRELTE_MINIFY__${componentName}_${suffix}`
		}

		imports.add(`${componentName} as ${taggedComponentName}`)
		return taggedComponentName
	}

	/**
	 *
	 * @param {unknown} node
	 * @returns {void}
	 */
	const visit = (node) => {
		if (!node || typeof node !== 'object') return

		if (Array.isArray(node)) {
			for (const child of node) {
				visit(child)
			}
			return
		}

		if (node.type === 'InlineComponent' && node.name.startsWith(`${alias}.`)) {
			const componentName = node.name.slice(alias.length + 1)
			const taggedComponentName = getTaggedComponentName(componentName)
			const openTagNameStart = node.start + 1
			const openTagNameEnd = openTagNameStart + node.name.length

			str.overwrite(openTagNameStart, openTagNameEnd, `${alias} is={${taggedComponentName}}`)

			const closeTag = `</${node.name}`
			const closeTagStart = content.lastIndexOf(closeTag, node.end)

			if (closeTagStart > node.start) {
				const closeTagNameStart = closeTagStart + 2
				const closeTagNameEnd = closeTagNameStart + node.name.length
				str.overwrite(closeTagNameStart, closeTagNameEnd, alias)
			}
		}

		for (const value of Object.values(node)) {
			if (value && typeof value === 'object') {
				visit(value)
			}
		}
	}

	visit(ast.html)

	return {
		code: str.toString(),
		map: str.generateMap(),
	}
}
