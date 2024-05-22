import type { PluginOption } from 'vite'
import { preprocess } from 'svelte/compiler'
import MagicString from 'magic-string'
import { hasDotComponent } from './hasDotComponent'
import { insertImports } from './insertImports'
import { replaceDotComponents } from './replaceDotComponents'

const imports = new Set<string>()

export const compile = async (source: string) => {
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
			}
		}
	])
}

export const threlteMinify = (): PluginOption => {
	return {
		name: 'threlte-minify',
		enforce: 'pre',
		async transform(src, id) {
			if (id.endsWith('.svelte') && hasDotComponent(src)) {
				const { code, map } = await compile(src)

				return {
					code,
					map: map?.toString()
				}
			} else if (id.endsWith('/T.js')) {
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
