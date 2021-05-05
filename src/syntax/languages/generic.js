export const patterns = [
	// Comments in common form
	{
		classes: 'comment',
		pattern: /\/\*[\s\S]*?\*\/|(\/\/|\#)(?!.*('|").*?[^:](\/\/|\#)).*?$/gm
	},
	// Just strings in general
	{
		classes: 'string',
		pattern: /("|'|`)(.*?)("|'|`|$)/g
	},
	// Numbers
	{
		classes: 'primitive',
		pattern: /\b(\d+(\.\d+)?(e(\+|\-)?\d+)?(f|d)?|0x[\da-f]+)\b/gi
	},
	// Common keywords
	{
		matches: {
			1: 'keyword'
		},
		pattern: /\b(and|array|as|b(ool(ean)?|reak)|c(ase|atch|har|lass|on(st|tinue))|d(ef|elete|o(uble)?)|e(cho|lse(if)?|xit|xtends|xcept)|f(inally|loat|or(each)?|unction)|global|if|import|int(eger)?|long|new|object|or|pr(int|ivate|otected)|public|return|self|st(ring|ruct|atic)|switch|th(en|is|row)|try|(un)?signed|var|void|while)(?=\b)/gi
	},
	// Other primitive values
	{
		classes: 'primitive',
		pattern: /\btrue|false|null|undefined\b/g
	},
	// Other keywords
	{
		classes: 'keyword',
		pattern: /\b(from|copy|run|expose|cmd|entrypoint|for)\b/gi
	},
	// Operators
	{
		classes: 'operator',
		pattern: /\+|\!|\-|&(gt|lt|amp);|\||\*|\=/g
	},
	// Common form of method invocations
	{
		matches: {
			1: 'function call'
		},
		pattern: /(\w+?)(?=\()/g
	},
	// Common form of function declarations and invocations
	{
		matches: {
			1: 'function declaration',
			2: 'function call'
		},
		pattern: /(function)\s(.*?)(?=\()/g
	}
];
