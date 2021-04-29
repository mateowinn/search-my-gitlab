const Rainbow = require('rainbow-code/dist/rainbow.js');
console.log('Rainbow', Rainbow);

global.Rainbow = Rainbow;

// Add aliases
Rainbow.addAlias('js', 'javascript');

// Import a language

require('rainbow-code/src/language/javascript');
