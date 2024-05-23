import { stripScriptTags } from './stripScriptTags'

export const hasDotComponent = (code: string): boolean => {
	return stripScriptTags(code).includes('<T.')
}
