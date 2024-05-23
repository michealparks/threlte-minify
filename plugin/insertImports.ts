import { extractExistingImports } from './extractExistingImports'
import MagicString from 'magic-string'

export const insertImports = (imports: Set<string>, content: string, filename?: string) => {
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
