export const patterns = [
	// Matches comments
	{
		classes: 'comment',
		pattern: /(?<!(:|"|'|`|import))(\/\/|\/\*|\s+?\*)(.*?)(\*\/|\n|\r|$)/g
	},
	// Just strings in general
	{
		classes: 'string',
		pattern: /("|'|`)(.*?)("|'|`|$)/g
	},
	// Function keyword
	{
		classes: 'function declaration',
		pattern: /\b(function)\b/g
	},
	// Arrow functions
	{
		classes: 'function arrow',
		pattern: /=&gt;/g
	},
	// Some pre-determined globals
	{
		classes: 'globals',
		pattern: /\b(window|document|module)\b/g
	},
	// Other keywords
	{
		classes: 'keyword',
		pattern: /\b(import|export|default|from|new|return|if|for|super|as|class|static|private|async|await)\b/g
	},
	// Method calls
	{
		matches: {
			1: '',
			2: 'function call',
			3: ''
		},
		pattern: /([ ]|\.|\t)(\w*?)(\()/g
	},
	// `this`, of  course
	{
		classes: 'this',
		pattern: /\bthis\b/g
	},
	// Operators
	{
		classes: 'operator',
		pattern: /(\?|\:|\!?=\>?\<?|\.\.\.|\>\>?|\<)/g
	},
	// Variable declarations
	{
		classes: 'variable type',
		pattern: /\b(const|let|var)(?=\s)/g
	},
	// Numbers
	{
		classes: 'primitive',
		pattern: /\b(\d+)\b/g
	},
	// Booleans
	{
		classes: 'primitive',
		pattern: /(?<!("|'|`|-|\/))\b(true|false)\b/g
	}
];
