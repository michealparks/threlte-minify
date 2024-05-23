/**
 *
 * @param {string} code
 * @param {string} moduleName
 * @returns {string[]}
 */
export const extractExistingImports = (code, moduleName) => {
	const regex = new RegExp(`import \\{([^}]+)\\} from ['"]${moduleName}['"]`, 'g')

	/**
	 * @type {RegExpExecArray | null}
	 */
	let match = null

	/**
	 * @const {Set<string>}
	 */
	const imports = new Set()

	while ((match = regex.exec(code)) !== null) {
		match[1]
			.split(',')
			.map((x) => x.trim())
			.forEach((item) => imports.add(item))
	}

	return [...imports]
}
