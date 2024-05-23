import MagicString from 'magic-string'

/**
 *
 * @param {Set<string>} imports
 * @param {string} content
 * @param {string=} filename
 * @returns
 */
export const replaceDotComponents = (imports, content, filename) => {
	const s = new MagicString(content, { filename })
	const openTagRegex = /<T\.([a-zA-Z0-9_]+)/g
	const closeTagRegex = /<\/T\.([a-zA-Z0-9_]+)/g

	/**
	 * @type {RegExpExecArray | null}
	 */
	let match = null

	/**
	 *
	 * @param {RegExpExecArray} match
	 * @param {string} replacement
	 */
	const replace = (match, replacement) => {
		const [fullMatch] = match
		const start = match.index
		const end = start + fullMatch.length
		s.overwrite(start, end, replacement)
	}

	while ((match = openTagRegex.exec(content)) !== null) {
		const [, componentName] = match
		const taggedComponentName = `THRELTE_MINIFY__${componentName}`
		imports.add(`${componentName} as ${taggedComponentName}`)
		replace(match, `<T is={${taggedComponentName}}`)
	}

	while ((match = closeTagRegex.exec(content)) !== null) {
		replace(match, `</T`)
	}

	return {
		code: s.toString(),
		map: s.generateMap()
	}
}
