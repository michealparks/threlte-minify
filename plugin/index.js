import MagicString from 'magic-string'
import { hasDotComponent } from './hasDotComponent.js'
import { compile } from './compile.js'

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
