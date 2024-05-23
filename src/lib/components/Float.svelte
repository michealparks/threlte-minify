<script>
	import { Group } from 'three'
	import { MathUtils } from 'three'
	import { useTask, T } from '@threlte/core'

	// // Group Properties
	export let position = 0
	export let rotation = 0
	// // Float Properties
	export let speed = 1
	export let floatIntensity = 1
	export let floatingRange = [-0.1, 0.1]
	export let rotationSpeed = 0
	export let rotationIntensity = 0
	export let seed = Math.random() * 10000

	let t = seed
	let floatPosition = Array.isArray(position) ? position : [position, position, position]
	const map = MathUtils.mapLinear
	let floatRotation = Array.isArray(rotation) ? rotation : [rotation, rotation, rotation]

	useTask((delta) => {
		t += delta
		// Floating
		const fSpeed = Array.isArray(speed) ? speed : [speed, speed, speed]
		const fIntensity = Array.isArray(floatIntensity)
			? floatIntensity
			: [floatIntensity, floatIntensity, floatIntensity]
		const fRange = floatingRange.length == 3 ? floatingRange : [[0, 0], floatingRange, [0, 0]]
		floatPosition = Array.isArray(position) ? position : [position, position, position]
		floatPosition[0] =
			floatPosition[0] +
			map(Math.sin((t / 4) * fSpeed[0]) / 10, -0.1, 0.1, ...fRange[0]) * fIntensity[0]
		floatPosition[1] =
			floatPosition[1] +
			map(Math.sin((t / 4) * fSpeed[1]) / 10, -0.1, 0.1, ...fRange[1]) * fIntensity[1]
		floatPosition[2] =
			floatPosition[2] +
			map(Math.sin((t / 4) * fSpeed[2]) / 10, -0.1, 0.1, ...fRange[2]) * fIntensity[2]
		floatPosition = floatPosition
		// Rotation
		const rSpeed = Array.isArray(rotationSpeed)
			? rotationSpeed
			: [rotationSpeed, rotationSpeed, rotationSpeed]
		const rIntensity = Array.isArray(rotationIntensity)
			? rotationIntensity
			: [rotationIntensity, rotationIntensity, rotationIntensity]
		floatRotation = Array.isArray(rotation) ? rotation : [rotation, rotation, rotation]
		floatRotation[0] += (Math.cos((t / 4) * rSpeed[0]) / 8) * rIntensity[0]
		floatRotation[1] += (Math.cos((t / 4) * rSpeed[1]) / 8) * rIntensity[1]
		floatRotation[2] += (Math.cos((t / 4) * rSpeed[2]) / 8) * rIntensity[2]
	})

	console.log($$restProps)
</script>

<T is={Group} position={floatPosition} rotation={floatRotation} let:ref {...$$restProps}>
	<slot {ref} />
</T>
