import { parse } from 'svelte/compiler'

import { findImportAlias } from './findImportAlias.js'
import { stripScriptTags } from './stripScriptTags.js'

/**
 *
 * @param {string} code
 * @returns {boolean}
 */
export const hasDotComponent = (code) => {
	const alias = findImportAlias(code, 'T')

	if (!alias) {
		return false
	}

	if (!stripScriptTags(code).includes(`<${alias}.`)) {
		return false
	}

	let hasMatch = false

	/**
	 *
	 * @param {unknown} node
	 * @returns {void}
	 */
	const visit = (node) => {
		if (!node || typeof node !== 'object' || hasMatch) return

		if (Array.isArray(node)) {
			for (const child of node) {
				visit(child)
			}
			return
		}

		if (node.type === 'InlineComponent' && node.name.startsWith(`${alias}.`)) {
			hasMatch = true
			return
		}

		for (const value of Object.values(node)) {
			if (value && typeof value === 'object') {
				visit(value)
			}
		}
	}

	visit(parse(code).html)

	return hasMatch
}
