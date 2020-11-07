const {
    cleanUrl,
    escape
  } = require('./helpers.js');

var main = {
    fetchNavigation: function() {
        console.log("Fetching navigation.md");

        fetch("navigation.md").then(function(resp) {
            
        
            if (!resp.ok) {
                console.log(`navigation.md not fetched [${resp.status} - ${resp.statusText}]`);
            }
            else {
                console.log("Fetched navigation.md");
                resp.text().then(main.renderNavigation, function(reason) {
                    console.log("Failed to get navigation.md text, reason: " + reason);
                });
            }
        }, function(reason) {
            console.log(`Failed to retrieve navigation.md reason: ${reason}`);
        });
    },
    
    renderNavigation: function(text) {        
        var marked = require('marked');

        console.log("Received navigation.md text");
        console.log("Rending navigation.md ...");

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
        console.log("Fetching content from " + url);

        fetch(url).then(function(resp) {
            console.log("Fetched content from " + url);
            resp.text().then(main.renderPage);
        });
    },
    
    renderPage: function(text) {
        console.log("Showing fetched content");      
        var marked = require('marked');

        console.log("Received navigation.md text");
        console.log("Rending navigation.md ...");

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
        marked.use({renderer: newRenderer});
        document.getElementById("content").innerHTML
                    = marked(text);
    },
}

module.exports = main;