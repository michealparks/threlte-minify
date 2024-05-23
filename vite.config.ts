import { threeMinifier } from '@yushijinhun/three-minifier-rollup'
import { threlteMinify } from './plugin/index'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

const plugins = [mkcert(), sveltekit()]

plugins.unshift(threlteMinify())
plugins.push({ ...threeMinifier(), enforce: 'pre' })

export default defineConfig({
	build: {
		minify: true
	},
	plugins,
	ssr: {
		noExternal: ['three']
	}
})

// Simple test on +page.svelte
// just vite minify: 729.30 kB
// threeMinifier: 706.85 kB
// threlteMinify: 519.14 kB
// threlteMinify + threeMinifier: 496.57 kB
