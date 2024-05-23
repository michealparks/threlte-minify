export const extractExistingImports = (code: string, moduleName: string): string[] => {
	const regex = new RegExp(`import \\{([^}]+)\\} from ['"]${moduleName}['"]`, 'g')
	let match: RegExpExecArray | null = null
	const imports = new Set<string>()

	while ((match = regex.exec(code)) !== null) {
		match[1]
			.split(',')
			.map((x) => x.trim())
			.forEach((item) => imports.add(item))
	}

	return [...imports]
}
