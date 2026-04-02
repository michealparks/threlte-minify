import { svelte } from '@sveltejs/vite-plugin-svelte'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { build } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'

import { threlteMinify } from '../index.js'

const tempDirs = new Set<string>()

const collectFiles = async (dir: string): Promise<string[]> => {
	const { readdir } = await import('node:fs/promises')
	const entries = await readdir(dir, { withFileTypes: true })
	const files = await Promise.all(
		entries.map(async (entry) => {
			const fullPath = join(dir, entry.name)
			if (entry.isDirectory()) {
				return collectFiles(fullPath)
			}
			return [fullPath]
		})
	)

	return files.flat()
}

const createFixture = async () => {
	const tempRoot = join(process.cwd(), '.vitest-tmp')
	await mkdir(tempRoot, { recursive: true })

	const root = await mkdtemp(join(tempRoot, 'threlte-minify-vite-'))
	tempDirs.add(root)

	await mkdir(join(root, 'src'), { recursive: true })
	await writeFile(
		join(root, 'index.html'),
		`<!doctype html>
<html lang="en">
	<body>
		<div id="app"></div>
		<script type="module" src="/src/main.js"></script>
	</body>
</html>`
	)
	await writeFile(
		join(root, 'src', 'main.js'),
		`import { mount } from 'svelte'
import App from './App.svelte'

mount(App, {
	target: document.getElementById('app'),
})`
	)
	await writeFile(
		join(root, 'src', 'App.svelte'),
		`<script>
	import { Canvas, T } from '@threlte/core'
</script>

<Canvas>
	<T.Mesh>
		<T.BoxGeometry />
	</T.Mesh>
</Canvas>`
	)

	return root
}

afterEach(async () => {
	await Promise.all(
		[...tempDirs].map(async (dir) => {
			tempDirs.delete(dir)
			await rm(dir, { recursive: true, force: true })
		})
	)
})

describe('vite build integration', () => {
	it('builds a fixture app and applies the Svelte transform before compilation', async () => {
		const root = await createFixture()
		let capturedSvelte = ''
		const outDir = join(root, 'dist')

		await build({
			configFile: false,
			logLevel: 'silent',
			root,
			publicDir: false,
			plugins: [
				threlteMinify(),
				{
					name: 'capture-threlte-minify-output',
					enforce: 'pre',
					transform(code, id) {
						if (id.endsWith('/src/App.svelte')) {
							capturedSvelte = code
						}

						return null
					},
				},
				svelte(),
			],
			build: {
				minify: false,
				outDir,
				rollupOptions: {
					input: join(root, 'index.html'),
				},
			},
		})

		expect(capturedSvelte).toContain(`Mesh as THRELTE_MINIFY__Mesh`)
		expect(capturedSvelte).toContain(`BoxGeometry as THRELTE_MINIFY__BoxGeometry`)
		expect(capturedSvelte).toContain(`<T is={THRELTE_MINIFY__Mesh}>`)
		expect(capturedSvelte).toContain(`<T is={THRELTE_MINIFY__BoxGeometry} />`)

		const files = await collectFiles(outDir)
		const jsFiles = files.filter((file) => file.endsWith('.js'))
		expect(jsFiles.length).toBeGreaterThan(0)

		const bundle = (
			await Promise.all(
				jsFiles.map(async (file) => {
					return readFile(file, 'utf8')
				})
			)
		).join('\n')

		expect(bundle).toContain('return Mesh;')
		expect(bundle).toContain('return BoxGeometry;')
	}, 30000)
})
