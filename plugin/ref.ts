import { parse, walk } from 'svelte/compiler'
import MagicString from 'magic-string'
import * as THREE from 'three'

/**
 * Parses an ImportMap to actual imports
 * @param importMap
 * @returns
 */
const parseImportMap = (importMap) => {
	return Object.entries(importMap)
		.filter(([_from, { imports }]) => imports.length > 0)
		.map(([module, { imports }]) => {
			return `import { ${[...new Set(imports)].join(', ')} } from '${module}';`
		})
		.join('\n')
}
const addImport = (importMap, module, imports) => {
	if (importMap[module]) {
		importMap[module] = {
			imports: [...importMap[module].imports, ...imports]
		}
	} else {
		importMap[module] = {
			imports
		}
	}
}
const preprocessMarkup = (content, transformOptions) => {
	const prefix = (
		transformOptions === null || transformOptions === void 0 ? void 0 : transformOptions.prefix
	)
		? `${transformOptions === null || transformOptions === void 0 ? void 0 : transformOptions.prefix}.`
		: 'T.'
	if (!content.includes(`<${prefix}`)) {
		return {
			markup: content
		}
	}
	const importMap = {}
	const documentImportMap = {}
	const ast = parse(content)
	const markup = new MagicString(content)
	let scriptContentNode
	walk(ast, {
		enter(node, parent, key, index) {
			if (node.type === 'Script' && node.context === 'default') {
				scriptContentNode = node.content
			}
			if (node.type === 'ImportDeclaration') {
				// // remove import of <T> component
				// if (node.source.value === '@threlte/core') {
				// 	if (node.specifiers.find((s) => s.imported.name === 'T')) {
				// 		// remove import of <T> component
				// 		const isMultiImport = node.specifiers.length > 1
				// 		if (!isMultiImport) {
				// 			// remove the whole import statement
				// 			markup.remove(node.start, node.end)
				// 		} else {
				// 			// cut out the T import
				// 			const specifierIndex = node.specifiers.findIndex((s) => s.imported.name === 'T')
				// 			const specifier = node.specifiers[specifierIndex]
				// 			const isLastImport = specifierIndex === node.specifiers.length - 1
				// 			const isFirstImport = specifierIndex === 0
				// 			if (isLastImport) {
				// 				const specifierBefore = node.specifiers[specifierIndex - 1]
				// 				markup.remove(specifierBefore.end, specifier.end)
				// 			} else if (isFirstImport) {
				// 				const specifierAfter = node.specifiers[specifierIndex + 1]
				// 				markup.remove(specifier.start, specifierAfter.start)
				// 			} else {
				// 				const specifierBefore = node.specifiers[specifierIndex - 1]
				// 				const specifierAfter = node.specifiers[specifierIndex + 1]
				// 				markup.update(specifierBefore.end, specifierAfter.start, ', ')
				// 			}
				// 		}
				// 	}
				// }
				addImport(
					documentImportMap,
					node.source.value,
					node.specifiers
						.filter((s) => s.type === 'ImportSpecifier')
						.map((specifier) => specifier.imported.name)
				)
			}
			if (node.type === 'Element' || node.type === 'InlineComponent') {
				const { name } = node
				if (!name.startsWith(prefix)) return
				const maybeImport = name.replace(prefix, '')
				const isInThree = maybeImport in THREE
				const isInExtensions =
					(transformOptions === null || transformOptions === void 0
						? void 0
						: transformOptions.extensions) &&
					Object.values(transformOptions.extensions).find((extension) => {
						return extension.includes(maybeImport)
					})
				if (isInThree || isInExtensions) {
					if (isInThree) {
						addImport(importMap, 'three', [maybeImport])
					} else if (transformOptions && transformOptions.extensions) {
						const extension = Object.entries(transformOptions.extensions).find(([key, value]) => {
							if (Array.isArray(value)) {
								return value.includes(maybeImport)
							} else {
								return value === maybeImport
							}
						})
						if (!extension) return
						const [module] = extension
						addImport(importMap, module, [maybeImport])
					} else {
						// this should never happen, sanity check
						return
					}
					// change start of node
					const length = name.length
					markup.remove(node.start + 1, node.start + 1 + length)
					markup.appendRight(node.start + 1, `T is={${maybeImport}}`)
					// change end of node: </boxGeometry> -> </Three>
					const selfClosing = content.slice(node.end - 2, node.end) === '/>'
					if (!selfClosing) {
						markup.update(node.end - length - 1, node.end - 1, 'T')
					}
				}
			}
		}
	})
	if (Object.keys(importMap).length > 0) {
		addImport(importMap, '@threlte/core', ['Three'])
	}
	// Filter out existing dependencies
	Object.entries(documentImportMap).forEach(([from, { imports }]) => {
		if (importMap[from]) {
			importMap[from].imports = importMap[from].imports.filter((i) => !imports.includes(i))
		}
	})
	if (Object.keys(importMap).length > 0) {
		const imports = parseImportMap(importMap)
		if (scriptContentNode) {
			markup.appendLeft(scriptContentNode.start, '\n' + imports + '\n')
		} else {
			markup.prepend('<script>\n' + imports + '\n</script>\n')
		}
	}
	return {
		markup: markup.toString()
	}
}
/**
 * This preprocessor will transform <T.BoxGeometry>
 * into <T is={BoxGeometry} /> + imports
 * @param options
 * @returns
 */
export const preprocessThrelte = (options) => {
	return {
		markup: ({ content }) => {
			const { markup } = preprocessMarkup(content, options)
			return {
				code: markup
			}
		}
	}
}
