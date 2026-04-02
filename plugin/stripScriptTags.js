/**
 *
 * @param {string} code
 * @returns {string}
 */
export const stripScriptTags = (code) => {
	return code.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/giu, '')
}
