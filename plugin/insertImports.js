import { extractExistingImports } from './extractExistingImports'
import MagicString from 'magic-string'

/**
 *
 * @param {Set<string>} imports
 * @param {string} content
 * @param {string=} filename
 * @returns {{ code: string; map: import('magic-string').SourceMap }}
 */
export const insertImports = (imports, content, filename) => {
	const s = new MagicString(content, { filename })
	const existingImports = extractExistingImports(content, 'three')
	const filteredImports = [...imports]
		.filter((item) => {
			if (existingImports.includes(item)) return false
			return true
		})
		.join(', ')

	if (filteredImports.length > 0) {
		s.prepend(`\nimport { ${filteredImports} } from 'three'\n`)
	}

	return {
		code: s.toString(),
		map: s.generateMap()
	}
}
