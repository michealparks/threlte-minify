import MagicString from 'magic-string'

export const replaceDotComponents = (imports: Set<string>, content: string, filename?: string) => {
	const s = new MagicString(content, { filename })
	const openTagRegex = /<T\.([a-zA-Z0-9_]+)/g
	const closeTagRegex = /<\/T\.([a-zA-Z0-9_]+)/g
	let match: RegExpExecArray | null = null

	const replace = (match: RegExpExecArray, replacement: string) => {
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
