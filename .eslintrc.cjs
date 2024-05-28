/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	extends: [
		'eslint:all',
		'plugin:@typescript-eslint/strict',
		'plugin:@typescript-eslint/stylistic',
		'plugin:svelte/recommended',
		'prettier',
	],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint'],
	root: true,
	rules: {
		'arrow-body-style': ['error', 'always'],
		'max-lines-per-function': ['error', 200],
		'max-statements': ['error', 10, { ignoreTopLevelFunctions: true }],
		'no-magic-numbers': 'off',
		'one-var': ['error', 'never'],
		'sort-keys': ['error', 'asc', { allowLineSeparatedGroups: true }],
	},
}
