export const patterns = [
	// Comments
	{
		classes: 'comment',
		pattern: /(?<!(:|"|'|`))(\#)(.*)/g
	},
	// Just strings in general
	{
		classes: 'string',
		pattern: /("|'|`)(.*?)("|'|`|$)/g
	},
	// Standalone numbers
	{
		classes: 'primitive',
		pattern: /\b(\d+(\.\d+)?(e(\+|\-)?\d+)?(f|d)?|0x[\da-f]+)\b/gi
	},
	// Some primitive values
	{
		classes: 'primitive',
		pattern: /\btrue|false|null\b/g
	},
	// Yaml property keys
	{
		matches: {
			1: 'object property',
			2: ''
		},
		pattern: /([^\s]*?)(\:(\n|\r|\s))/g
	},
	// Yaml command lines
	{
		matches: {
			1: '',
			2: 'string'
		},
		pattern: /(-\s?)(.*)/gm
	}
];
