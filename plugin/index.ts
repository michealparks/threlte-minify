import type { PluginOption } from 'vite'
import { preprocess } from 'svelte/compiler'
import MagicString from 'magic-string'

const svelteFileRegex = /\.(svelte)$/
const typescriptFileRegex = /\.(js)$/

const imports = new Set<string>()

const hasTComponent = (code: string): boolean => {
	return code.includes('<T.') || code.includes('<T ') || code.includes('<T\n')
}

const extractImportItems = (component: string, moduleName: string): string[] => {
	const regex = new RegExp(`import \\{([^}]+)\\} from ['"]${moduleName}['"]`)
	const match = regex.exec(component)

	if (match) {
		return match[1]
			.split(',')
			.map((x) => x.trim())
			.filter((x) => !x.startsWith('type '))
	}

	return []
}

const replaceTSvelteComponents = (content: string, filename?: string) => {
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
		imports.add(componentName)
		replace(match, `<T is={${componentName}}`)
	}

	while ((match = closeTagRegex.exec(content)) !== null) {
		replace(match, `</T`)
	}

	return {
		code: s.toString(),
		map: s.generateMap()
	}
}

const replaceImports = (content: string, filename?: string) => {
	if (imports.size === 0) return

	const s = new MagicString(content, { filename })
	const existingImports = extractImportItems(content, 'three')
	const filteredImports = [...imports]
		.filter((item) => {
			if (existingImports.includes(item)) return false
			return true
		})
		.join(', ')

	s.prepend(`\nimport { ${filteredImports} } from 'three'\n`)
	imports.clear()
	return {
		code: s.toString(),
		map: s.generateMap()
	}
}

export const compile = async (source: string) => {
	return preprocess(source, [
		{
			name: 'threlte-minify',
			markup: ({ content, filename }) => {
				return replaceTSvelteComponents(content, filename)
			},
			script: ({ content, filename }) => {
				return replaceImports(content, filename)
			}
		}
	])
}

export const threlteMinify = (): PluginOption => {
	return {
		name: 'threlte-minify',
		enforce: 'pre',
		async transform(src, id) {
			if (svelteFileRegex.test(id) && hasTComponent(src)) {
				const { code, map } = await compile(src)
				return {
					code,
					map: map?.toString()
				}
			} else if (typescriptFileRegex.test(id)) {
				if (id.endsWith('T.js')) {
					const s = new MagicString(src, { filename: id })
					s.overwrite(0, src.length, `export { default as T } from './T.svelte'`)
					return {
						code: s.toString(),
						map: s.generateMap()
					}
				}
			}
		}
	}
}
