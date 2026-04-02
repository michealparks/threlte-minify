/**
 *
 * @param {string} content
 * @param {string} alias
 * @returns {string | null}
 */
export const findImportAlias = (content, alias) => {
	const regex = /import\s*{([^}]+)}\s*from\s*["']@threlte\/core["']/g
	const matches = [...content.matchAll(regex)]

	for (const match of matches) {
		const imports = match[1].split(',')
		for (const imp of imports) {
			const [imported, asAlias] = imp
				.trim()
				.split(/\s+as\s+/)
				.map((str) => {
					return str.trim()
				})
			if (imported === alias) {
				return asAlias ?? imported
			}
		}
	}
	return null
}
