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
// none: 698.34 kB
// three: 677.00 kB
// threlte: 501.86 kB
// threlte + three: 480.10 kB
