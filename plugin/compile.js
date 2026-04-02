import { insertImports } from './insertImports.js'
import { preprocess } from 'svelte/compiler'
import { replaceDotComponents } from './replaceDotComponents.js'

/**
 *
 * @param {string} source
 * @returns {Promise<import('svelte/compiler').Processed>}
 */
export const compile = (source) => {
	/** @type {Set<string>} */
	const imports = new Set()

	return preprocess(source, [
		{
			name: 'threlte-minify',

			markup: ({ content, filename }) => {
				return replaceDotComponents(imports, content, filename)
			},
			script: ({ content, filename, attributes }) => {
				if (attributes.context === 'module' || 'module' in attributes) return
				const result = insertImports(imports, content, filename)
				imports.clear()
				return result
			},
		},
	])
}
