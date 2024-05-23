export const stripScriptTags = (code: string): string => {
	const scriptTagRegex = /<script[\s\S]*?>[\s\S]*?<\/script>/gi

	// Continuously remove <script> tags until none are left
	let result = code
	while (scriptTagRegex.test(result)) {
		result = result.replace(scriptTagRegex, '')
	}

	return result
}
