import { stripScriptTags } from './stripScriptTags'

/**
 *
 * @param {string} code
 * @returns {boolean}
 */
export const hasDotComponent = (code) => {
	return stripScriptTags(code).includes('<T.')
}
