import MagicString from 'magic-string'
import { findImportAlias } from './findImportAlias.js'
import { parse } from 'svelte/compiler'

/**
 *
 * @param {Set<string>} imports A list of imports from "THREE"
 * @param {string} content The stringified component
 * @param {string=} filename The component filename
 * @returns {{ code: string, map: import('magic-string').SourceMap }}
 */
export const replaceDotComponents = (imports, content, filename) => {
	const ast = parse(content)
	const alias = findImportAlias(content, 'T') ?? 'T'
	const str = new MagicString(content, { filename })
	const openTagRegex = new RegExp(`<${alias}\\.(?<temp1>[a-zA-Z0-9_]+)`, 'g')
	const closeTagRegex = new RegExp(`</${alias}\\.(?<temp1>[a-zA-Z0-9_]+)`, 'g')

	/**
	 *
	 * @param {RegExpExecArray} regExpArray
	 * @param {string} replacement
	 */
	const replace = (regExpArray, replacement) => {
		const [fullMatch] = regExpArray
		const start = regExpArray.index
		const end = start + fullMatch.length
		str.overwrite(start, end, replacement)
	}

	/**
	 *
	 * @param {RegExpExecArray} regExpArray
	 */
	const isOutsideHtml = (regExpArray) => {
		const [fullMatch] = regExpArray
		const start = regExpArray.index
		const end = start + fullMatch.length

		if (
			(ast.module && start > ast.module.start && end < ast.module.end) ||
			(ast.instance && start > ast.instance.start && end < ast.instance.end)
		) {
			return true
		}

		return false
	}

	for (const match of content.matchAll(openTagRegex)) {
		if (isOutsideHtml(match)) continue

		const [, componentName] = match
		const taggedComponentName = `THRELTE_MINIFY__${componentName}`
		imports.add(`${componentName} as ${taggedComponentName}`)
		replace(match, `<${alias} is={${taggedComponentName}}`)
	}

	for (const match of content.matchAll(closeTagRegex)) {
		if (isOutsideHtml(match)) continue

		replace(match, `</${alias}`)
	}

	return {
		code: str.toString(),
		map: str.generateMap(),
	}
}
