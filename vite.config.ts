import { type PluginOption, defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { threeMinifier } from '@yushijinhun/three-minifier-rollup'
import { threlteMinify } from './plugin/index'

export default defineConfig(({ mode }) => {
	const plugins: PluginOption[] = [sveltekit()]

	if (mode === 'threlte' || mode === 'production') {
		plugins.unshift(threlteMinify())
	}

	if (mode === 'three' || mode === 'production') {
		plugins.push({ ...threeMinifier(), enforce: 'pre' })
	}

	return {
		build: {
			minify: true,
		},
		plugins,
		ssr: {
			noExternal: ['three'],
		},
	}
})

/**
 * Simple test on +page.svelte
 * - just vite minify: 729.30 kB
 * - threeMinifier: 706.85 kB
 * - threlteMinify: 519.14 kB
 * - threlteMinify + threeMinifier: 496.57 kB
 */
