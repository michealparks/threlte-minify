import { execSync } from 'node:child_process'

const builds = [
	{ name: 'null', script: 'build:null' },
	{ name: 'three only', script: 'build:three' },
	{ name: 'threlte only', script: 'build:threlte' },
	{ name: 'both', script: 'build' },
]

const results = []

for (const { name, script } of builds) {
	const output = execSync(`npm run ${script} 2>&1`, { encoding: 'utf-8' })
	const match = output.match(/nodes\/2\.\S+\s+([\d.]+)\s+kB\s+│\s+gzip:\s+([\d.]+)\s+kB/)

	if (match) {
		results.push({ name, size: match[1], gzip: match[2] })
	}
}

const nameW = Math.max(6, ...results.map((r) => r.name.length))
const sizeW = Math.max(4, ...results.map((r) => r.size.length))
const gzipW = Math.max(4, ...results.map((r) => r.gzip.length))

const header = `| ${'Mode'.padEnd(nameW)} | ${'Size'.padStart(sizeW)} kB | ${'Gzip'.padStart(gzipW)} kB |`
const sep = `| ${'-'.repeat(nameW)} | ${'-'.repeat(sizeW + 3)} | ${'-'.repeat(gzipW + 3)} |`

console.log()
console.log(header)
console.log(sep)

for (const { name, size, gzip } of results) {
	console.log(`| ${name.padEnd(nameW)} | ${size.padStart(sizeW)} kB | ${gzip.padStart(gzipW)} kB |`)
}

console.log()
