import MagicString from 'magic-string'

/**
 *
 * @param {Set<string>} imports
 * @param {string} content
 * @param {string=} filename
 * @returns
 */
export const replaceDotComponents = (imports, content, filename) => {
	const str = new MagicString(content, { filename })
	const openTagRegex = /<T\.(?<temp1>[a-zA-Z0-9_]+)/gu
	const closeTagRegex = /<\/T\.(?<temp1>[a-zA-Z0-9_]+)/gu

	/**
	 * @type {RegExpExecArray | null}
	 */
	let match = null

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
		code: str.toString(),
		map: str.generateMap(),
	}
}
