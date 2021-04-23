function hashCode(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
}

function intToRGB(i) {
	const c = (i & 0x00ffffff).toString(16).toUpperCase();

	return '00000'.substring(0, 6 - c.length) + c;
}

export default function strToColorHex(str) {
	if (!str || !str.length) {
		// Return black by default for non-strings
		return '#000';
	}

	const hash = hashCode(str);
	const hexColor = intToRGB(hash);

	return hexColor;
}
