import { threeMinifier } from '@yushijinhun/three-minifier-rollup'
import { threlteMinify } from './plugin/index'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

const plugins = [mkcert(), sveltekit()]

plugins.unshift(threlteMinify())
plugins.push({ ...threeMinifier(), enforce: 'pre' })

console.log(plugins)

export default defineConfig({
	build: {
		minify: true
	},
	plugins,
	ssr: {
		noExternal: ['three']
	}
})

// +page.svelte
// just vite minify: 698.34 kB
// threeMinifier: 677.00 kB
// threlteMinify: 501.86 kB
// threlteMinify + threeMinifier: 480.10 kB
