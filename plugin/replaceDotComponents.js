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

	if (content.length === 0) {
		return {
			code: str.toString(),
			map: str.generateMap(),
		}
	}

	const scriptSectionRegex = /<script.*?>[\s\S]*?<\/script>/giu
	const openTagRegex = /<T\.(?<temp1>[a-zA-Z0-9_]+)/gu
	const closeTagRegex = /<\/T\.(?<temp1>[a-zA-Z0-9_]+)/gu

	/**
	 * @type {Array<{
	 *   content: string
	 *   end: number
	 *   start: number
	 * }>}
	 */
	const scriptSections = []

	/**
	 * @type {RegExpExecArray | null}
	 */
	let match = null

	while ((match = scriptSectionRegex.exec(content)) !== null) {
		scriptSections.push({
			content: match[0],
			end: scriptSectionRegex.lastIndex,
			start: match.index,
		})
	}

	// Split content into parts: HTML and scripts

	/**
	 * @type {number}
	 */
	let lastIndex = 0

	/**
	 * @type {Array<{
	 *   content: string
	 *   type: 'html' | 'script'
	 * }>}
	 */
	const sections = []

	for (const section of scriptSections) {
		if (lastIndex < section.start) {
			sections.push({
				content: content.slice(lastIndex, section.start),
				type: 'html',
			})
		}
		sections.push({
			content: section.content,
			type: 'script',
		})
		lastIndex = section.end
	}

	if (lastIndex < content.length) {
		sections.push({
			content: content.slice(lastIndex),
			type: 'html',
		})
	}

	// Process only HTML sections
	for (const section of sections) {
		if (section.type === 'html') {
			/**
			 * @type {string}
			 */
			let sectionContent = section.content

			while ((match = openTagRegex.exec(sectionContent)) !== null) {
				const [, componentName] = match
				const taggedComponentName = `THRELTE_MINIFY__${componentName}`
				imports.add(`${componentName} as ${taggedComponentName}`)
				sectionContent = sectionContent.replace(match[0], `<T is={${taggedComponentName}}`)
			}

			while ((match = closeTagRegex.exec(sectionContent)) !== null) {
				sectionContent = sectionContent.replace(match[0], `</T`)
			}

			section.content = sectionContent
		}
	}

	const result = sections
		.map((section) => {
			return section.content
		})
		.join('')

	str.overwrite(0, content.length, result)

	return {
		code: str.toString(),
		map: str.generateMap(),
	}
}
