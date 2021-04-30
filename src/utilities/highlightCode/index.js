import { javascript } from 'src/rainbow/languages';

const langPatterns = {
	js: javascript,
	javascript: javascript
};

function escapeHtml(html) {
	const text = document.createTextNode(html);
	const p = document.createElement('p');

	// The DOM already knows how to parse/escape HTML
	p.appendChild(text);
	return p.innerHTML;
}

export default function highlightCode(str, ext) {
	const patterns = langPatterns[ext];
	if (!patterns) {
		return escapeHtml(str);
	}

	let highlighted = escapeHtml(str);

	for (const entry of patterns) {
		const matches = entry.matches;

		if (matches) {
			Object.keys(matches).forEach((matchNum) => {
				const classes = (entry.classes || '') + ' ' + matches[matchNum];
				if (classes.includes('keyword')) {
					console.log(
						'a match for ' + classes,
						matches[matchNum],
						matchNum,
						entry.pattern,
						`<span class="${classes}">$${matchNum}</span>`,
						JSON.stringify(highlighted)
					);
				}
				highlighted = highlighted.replace(entry.pattern, matches[matchNum] ? `<span class="${classes}">$${matchNum}</span>` : `$${matchNum}`);
			});
		} else {
			console.log('a match for just classes ' + entry.classes, entry.pattern);
			highlighted = highlighted.replace(entry.pattern, `<span class="${entry.classes}">$&</span>`);
		}
	}

	console.log('highlighted', highlighted);
	return highlighted;
}
