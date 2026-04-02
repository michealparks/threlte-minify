/**
 *
 * @param {string} code
 * @param {string} moduleName
 * @returns {string[]}
 */
export const extractExistingImports = (code, moduleName) => {
	const escapedModuleName = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const regex = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${escapedModuleName}['"]`, 'ug')

	/**
	 * @type {RegExpExecArray | null}
	 */
	let match

	/**
	 * @type {Set<string>}
	 */
	const imports = new Set()

	while ((match = regex.exec(code)) !== null) {
		const [, result] = match
		for (const item of result.split(',')) {
			imports.add(item.trim())
		}
	}

	return [...imports]
}
