// CSS
import "halfmoon/css/halfmoon-variables.min.css";
import 'halfmoon-highlight/dist/index.css';

// JavaScript
window.halfmoon = require("halfmoon");
window.hljs = require('highlight.js');
require('highlightjs-line-numbers.js');
window.marked = require('marked');
window.main = require("./main.js").default;