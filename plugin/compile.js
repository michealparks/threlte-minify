import { insertImports } from './insertImports.js'
import { preprocess } from 'svelte/compiler'
import { replaceDotComponents } from './replaceDotComponents.js'

/**
 * @type {Set<string>}
 */
const imports = new Set()

/**
 *
 * @param {string} source
 * @returns {Promise<import('svelte/compiler').Processed>}
 */
export const compile = (source) => {
	return preprocess(source, [
		{
			name: 'threlte-minify',

			markup: ({ content, filename }) => {
				return replaceDotComponents(imports, content, filename)
			},
			script: ({ content, filename }) => {
				const result = insertImports(imports, content, filename)
				imports.clear()
				return result
			},
		},
	])
}
