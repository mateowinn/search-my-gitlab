export const patterns = [
	// Matches comments
	{
		classes: 'comment',
		pattern: /(?<!(:|"|'|`))(\/\/|\/\*|[ ]+?\*)(.*?)(\*\/|\n|\r|$)/g
	},
	// Object keys
	{
		classes: 'storage',
		pattern: /"(.*)":/g
	}
];
