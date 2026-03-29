export function normalize(value) {
	return String(value || "").trim()
}

export function normalizeKey(value) {
	return normalize(value).toLowerCase()
}

export function toNumber(value, fallback = 0) {
	const num = Number(value)
	return Number.isFinite(num) ? num : fallback
}

export function makeArray(value) {
	return Array.isArray(value) ? value : []
}