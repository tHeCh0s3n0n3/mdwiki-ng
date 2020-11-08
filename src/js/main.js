import { cleanUrl, escape } from './helpers.js';

var main = {
    fetchNavigation: function() {
        // console.info("Fetching navigation.md");

        fetch("navigation.md").then(function(resp) {
            
        
            if (!resp.ok) {
                console.warn(`navigation.md not fetched [${resp.status} - ${resp.statusText}]`);
            }
            else {
                // console.info("Fetched navigation.md");
                resp.text().then(main.renderNavigation, function(reason) {
                    console.error("Failed to get navigation.md text, reason: " + reason);
                });
            }
        }, function(reason) {
            console.error(`Failed to retrieve navigation.md reason: ${reason}`);
        });
    },
    
    renderNavigation: function(text) {        
        const marked = require('marked');

        // console.info("Received navigation.md text");
        // console.info("Rending navigation.md ...");

        const newRenderer = {
            heading(text, level) {
                if (level === 1)
                return `<a href="#" class="navbar-brand">${text}</a>`;
            },
            link(href, title, text) {
                return `<li class="nav-item">
                            <a href="${href}" class="nav-link">${text}</a>
                        </li>`
            },
        };
        marked.use({renderer: newRenderer});
        document.getElementById("topNavbar").innerHTML
            = marked(text);
    },

    fetchPage: function(url) {
        // console.info("Fetching content from " + url);

        fetch(url).then(function(resp) {
            // console.info("Fetched content from " + url);
            resp.text().then(main.renderPage);
        });
    },
    
    renderPage: function(text) {
        // console.info("Showing fetched content");      
        const marked = require('marked');

        // console.info("Received navigation.md text");
        // console.info("Rending navigation.md ...");

        const newRenderer = {
            link(href, title, text) {
                href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
                if (href === null) {
                    return text;
                }
                const titleAttrib = (title !== null)
                                    ? ` title="${title}"`
                                    : '';
                return `<a href="${escape(href)}" class="hyperlink-underline"${titleAttrib}>${text}</a>`;
            },
            codespan(code){
                return `<code class="code">${code}</code>`;
            },
            code(code, infostring, escaped) {
                const lang = (infostring || '').match(/\S*/)[0];
                if (this.options.highlight) {
                  const out = this.options.highlight(code, lang);
                  if (out != null && out !== code) {
                    escaped = true;
                    code = out;
                  }
                }
            
                if (!lang) {
                  return '<div class="card">'
                         + '<pre class="is-card">'
                         + '<code>'
                         + (escaped ? code : escape(code, true))
                         + '</code></pre></div>';
                }
            
                return '<div class="card">'
                       + '<h2 class="card-title">' + escape(lang, true) + '</h2>'
                       + '<pre class="is-card">'
                       + '<code class="hljs '
                         + this.options.langPrefix
                         + escape(lang, true)
                       + '">'
                       + (escaped ? code : escape(code, true))
                       + '</code></pre></div>';
            },
            image(href, title, text) {
                href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
                if (href === null) {
                    return text;
                }                
                return `<img src="${href}" class="img-fluid" alt="${text}" title="${title}">`;
            },
            list(body, isOrdered, startNumber){
                const type = isOrdered ? "ol" : "ul";
                const startAt = (isOrdered && startNumber !== 1)
                                ? (' start="' + startNumber + '"')
                                : '';
                return `<${type}${startAt}>${body}</${type}>`;
            },
            listitem(text, isTask, isChecked) {
                return `<li class="m-0">${text}</li>`;
            },
            table(header, body){
                return `<table class="table table-striped">
                            <thead>${header}</thead>
                            <tbody>${body}</tbody>
                        </table>`;
            },
            tablerow(content){
                return `<tr>${content}</tr>`;
            },
            tablecell(content, flags){
                const type = flags.header ? "th" : "td";
                const align = flags.align
                              ? (' style="text-align: ' + flags.align + '"')
                              : '';
                return `<${type}${align}>${content}</${type}>`;
            },

        };
        marked.use({
            renderer: newRenderer,
            highlight: function(code, language) {
                const hljs = require('highlight.js');
                const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
                //console.info(`hljs lang: ${validLanguage}`);
                return hljs.highlight(validLanguage, code).value;
            },
            smartLists: true,
            smartypants: true,
        });
        document.getElementById("content").innerHTML
                    = marked(text);

        hljs.initHighlightingOnLoad();
        hljs.initLineNumbersOnLoad();
    },
}

export default main;