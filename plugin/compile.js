import MagicString from 'magic-string'
import { insertImports } from './insertImports.js'
import { parse, preprocess } from 'svelte/compiler'
import { replaceDotComponents } from './replaceDotComponents.js'

/**
 *
 * @param {Set<string>} imports
 * @returns {string}
 */
const createThreeImport = (imports) => {
	return `import { ${[...imports].join(', ')} } from 'three'`
}

/**
 *
 * @param {string} code
 * @param {Set<string>} imports
 * @param {string=} filename
 * @returns {{ code: string; map: import('magic-string').SourceMap }}
 */
const injectInstanceScript = (code, imports, filename) => {
	const ast = parse(code)
	const str = new MagicString(code, { filename })
	const instanceScript = `<script>\n${createThreeImport(imports)}\n</script>`
	const insertAt = ast.module ? ast.module.end : 0
	const prefix = insertAt === 0 ? '' : '\n'
	const suffix = insertAt === 0 ? '\n' : ''

	str.appendLeft(insertAt, `${prefix}${instanceScript}${suffix}`)

	return {
		code: str.toString(),
		map: str.generateMap(),
	}
}

/**
 *
 * @param {string} source
 * @param {string} filename
 * @returns {Promise<import('svelte/compiler').Processed>}
 */
export const compile = async (source, filename) => {
	/** @type {Set<string>} */
	const imports = new Set()

	const processed = await preprocess(
		source,
		[
			{
				name: 'threlte-minify',

				markup: ({ content }) => {
					return replaceDotComponents(imports, content, filename)
				},
				script: ({ content, attributes }) => {
					if (attributes.context === 'module' || 'module' in attributes) return
					const result = insertImports(imports, content, filename)
					imports.clear()
					return result
				},
			},
		],
		{ filename }
	)

	if (imports.size === 0) {
		return processed
	}

	return {
		...processed,
		...injectInstanceScript(processed.code, imports, filename),
	}
}
