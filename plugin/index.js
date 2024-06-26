import MagicString from 'magic-string'
import { compile } from './compile.js'
import { hasDotComponent } from './hasDotComponent.js'

const tOverwrite = `
export { default as T } from './T.svelte'

export const extend = () => {
	throw new Error('Threlte Minify is not compatible with the Threlte extend() function.')
}`

/**
 *
 * @returns {import('vite').PluginOption}
 */
export const threlteMinify = () => {
	return {
		name: 'threlte-minify',

		enforce: 'pre',

		/**
		 *
		 * @param {string} src
		 * @param {string} id
		 * @returns
		 */
		async transform(src, id) {
			if (id.endsWith('.svelte') && hasDotComponent(src)) {
				const { code, map } = await compile(src)

				return {
					code,
					map: map?.toString(),
				}
			} else if (id.endsWith('/T.js')) {
				const str = new MagicString(src, { filename: id })
				str.overwrite(0, src.length, tOverwrite)

				return {
					code: str.toString(),
					map: str.generateMap(),
				}
			}

			return Promise.resolve()
		},
	}
}
