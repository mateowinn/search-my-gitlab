import logger from 'utilities/logger';

// A flag to simply indicate if we can support syntax highlighting
let syntaxHighlightingOn = false;

// Defines all language patterns we accept and the extension aliases we expect (will be filled out later after we've checked browser compatibility)
const langPatterns = {};

const SPAN_PATTERN = /\<span data-highlighted.*?\<\/span\>/gs;

/**
 * Takes an HTML string and escapes the special characters that could potentially be used in an attack
 *
 * @param {String} html - the HTML string that could potentially contain harmful characters if rendered literally
 * @returns {String} - an escaped HTML string
 */
function escapeHtml(html) {
	const text = document.createTextNode(html);
	const p = document.createElement('p');

	// The DOM already knows how to parse/escape HTML
	p.appendChild(text);
	return p.innerHTML;
}

/**
 * Our crazy function for iterating through an HTML string's parts and applying all highlighting rules pertaining to the indicated extension. Wraps qualified sections in spans with particular classes that will color accordingly (see css/syntax.monokai.scss).
 *
 * @param {String} str - the code string that we want to try to add syntax highlighting to
 * @param {String} ext - the extension associated with this code aka what programming language we are trying to parse. It should be noted that we don't support ALL languages. It will hopefully improve over time, however.
 * @returns {String} - the same code string but hopefully with some highlight spans injected.
 */
export default function highlightCode(str, ext) {
	const patterns = langPatterns[ext];
	if (!patterns) {
		// If we don't yet have highlighting rules for this kind of code, we're not going to attempt anything
		return escapeHtml(str);
	}

	// We must escape this first or we'll have a really hard time later rendering our spans while not rendering the original code
	let highlighted = escapeHtml(str);

	// Cycle through each syntax pattern (in priority order) that we want to potentially highlight
	for (const entry of patterns) {
		const matches = entry.matches;

		// If we've already applied highlight spans to a section, then we want to take those sections out so as to not cause clashes and make things fail altogether
		const sansSpansPieces = highlighted.split(SPAN_PATTERN);

		for (const piece of sansSpansPieces) {
			// Process each sans-span segment if we detect that our current pattern could apply
			if (piece.match(entry.pattern)) {
				if (matches) {
					// If our pattern contains multiple matching groups, and we therefore must piece together a more detailed highlight, we'll treat that different than the rest
					for (const matchNum of Object.keys(matches)) {
						const classes = (entry.classes || '') + ' ' + matches[matchNum];

						if (matches[matchNum]) {
							// We've specifically indicated in our patterns which regex groupings ought to be highlighted and which not. This highlights the main segment(s) and simply puts back the non-highlighted ones
							let replacement = `<span data-highlighted class="${classes}">$${matchNum}</span>`;

							if (matches[+matchNum - 1] === '') {
								replacement = `$${+matchNum - 1}${replacement}`;
							}
							if (matches[+matchNum + 1] === '') {
								replacement = `${replacement}$${+matchNum + 1}`;
							}

							// Create a piece with the properly replaced highlighted syntax, then replace the original piece in the whole segment with the updated one
							const hlPiece = piece.replace(entry.pattern, replacement);
							highlighted = highlighted.replace(piece, hlPiece);
						}
					}
				} else {
					// Create a piece with the properly replaced highlighted syntax, then replace the original piece in the whole segment with the updated one
					const hlPiece = piece.replace(entry.pattern, `<span data-highlighted class="${entry.classes}">$&</span>`);
					highlighted = highlighted.replace(piece, hlPiece);
				}
			}
		}
	}

	return highlighted;
}

/**
 * It, uh, just returns whether syntax highlighting is on, in case you didn't get that.
 *
 * @returns {Boolean}
 */
export function canSyntaxHighlight() {
	return syntaxHighlightingOn;
}

/**
 * A simple function that tells whether the user's browser supports positive lookbehinds in Regex
 * (StackOverflow: https://stackoverflow.com/questions/60325323/how-to-test-to-determine-if-browser-supports-js-regex-lookahead-lookbehind#answer-65896524)
 *
 * And yes, in case you were wondering, this is all Safari's fault.
 *
 * @returns {Boolean} - whether or not positive lookbehinds are supported in this browser
 */
function supportsRegexLookAheadLookBehind() {
	try {
		return 'hibyehihi'.replace(new RegExp('(?<=hi)hi', 'g'), 'hello').replace(new RegExp('hi(?!bye)', 'g'), 'hey') === 'hibyeheyhello';
	} catch (error) {
		return false;
	}
}

if (supportsRegexLookAheadLookBehind()) {
	// Woo-hoo! We can support syntax highlighting!
	syntaxHighlightingOn = true;

	// Now import our actual highlighting rules
	import('../languages')
		.then((languages) => {
			const { javascript, json, generic, yaml } = languages;

			// Pre-populate the syntax language options
			langPatterns.js = javascript;
			langPatterns.javascript = javascript;
			langPatterns.json = json;
			langPatterns.jsonc = json;
			langPatterns.generic = generic;
			langPatterns.example = generic;
			langPatterns.yaml = yaml;
			langPatterns.yml = yaml;
		})
		.catch((error) => {
			syntaxHighlightingOn = false;

			logger.error('Shoot. Could not dynamically load language patterns. Syntax highlighting disabled!', error);
		});
} else {
	logger.warn('Browser does not support positive lookbehinds in Regex. Syntax highlighting disabled!');
}
