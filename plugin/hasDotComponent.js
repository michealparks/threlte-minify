import { stripScriptTags } from './stripScriptTags.js'

/**
 *
 * @param {string} code
 * @returns {boolean}
 */
export const hasDotComponent = (code) => {
	return stripScriptTags(code).includes('<T.')
}
