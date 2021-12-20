import { cleanUrl, escape } from './helpers.js';
require('./fontawesome.js');

var main = {
    fetchNavigation: function() {
        // console.info("Fetching navigation.md");

        fetch("navigation.md").then(function(resp) {
            if (!resp.ok) {
                console.warn(`navigation.md not fetched [${resp.status} - ${resp.statusText}]`);
            }
            else {
                //console.info("Fetched navigation.md");
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

        let tokens = marked.lexer(text);

        let result = "";

        let isList = false;
        let i = 0;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            switch (token.type) {
                case "heading":
                    if (i === 0) {
                        result += main.renderNavigationHeading(token);
                    }
                    result += `<ul class="navbar-nav d-none d-md-flex">`;
                    break;
                case "paragraph":
                    if (isList) {
                        // close the previous list
                        result += `</div></li>`;
                        isList = false;
                    }
                    let adjustNextForAmount = 0;
                    let makeLastTokenManu = false;
                    // Check if we have a list following the paragraph
                    let checkListOffset = i+1;
                    if (tokens.length > checkListOffset) {
                        let nextToken = tokens[checkListOffset];
                        if (nextToken.type === "space") {
                            checkListOffset += 1;
                            if (tokens.length > checkListOffset) {
                                nextToken = tokens[checkListOffset];
                            }
                        }
                        if (nextToken.type === "list") {
                            adjustNextForAmount = checkListOffset - i;
                            makeLastTokenManu = true;
                        }
                    }
                    for (let j = 0; j < token.tokens.length - (makeLastTokenManu ? 1 : 0); j++) {
                        const subtoken = token.tokens[j];
                        switch(subtoken.type) {
                            case "link":
                                result += `<li class="nav-item">${main.renderNavigationLink(subtoken, "nav-link")}</li>`;
                                break;
                        }
                    }
                    if (makeLastTokenManu) {
                        const replaceRegEx = / /gi;
                        const menuItemToken = token.tokens[token.tokens.length - 1];
                        const menuItemId = `nav-link-dropdown-toggle-${menuItemToken.text.replaceAll(replaceRegEx, '-')}`;
                        result += `<li class="nav-item dropdown with-arrow">`;
                        result += `<a class="nav-link" data-toggle="dropdown" id="${menuItemId}">`;
                        result += menuItemToken.text;
                        result += `<i class="fas fa-angle-down ml-5" aria-hidden="true"></i>`;
                        result += `</a>`;
                        result += `<div class="dropdown-menu dropdown-menu-center" aria-labelledby="${menuItemId}">`;
                    }
                    break;
                case "list":
                    isList = true;
                    token.items.forEach(listItem => {
                        let subToken = marked.lexer(listItem.text)[0];
                        switch (subToken.type) {
                            case "heading":
                                result += `<div class="dropdown-content"><i><b>${subToken.text}</b></i></div>`;
                                break;
                            case "paragraph":
                                result += main.renderNavigationLink(subToken.tokens[0], "dropdown-item");
                                break;
                        }
                    });
                    break;
                case "hr":
                    if (isList) {
                        result += `<div class="dropdown-divider"></div>`;
                    }
                    break;
                default:
                    break;
            }
        }

        result += "</ul>";

        // Add the Halfmoon darkmode toggle button
        result += `<div class="navbar-content ml-auto">`;
        result += `<button class="btn btn-action" type="button" aria-label="Toggle dark mode" onclick="window.mdwiking.toggleDarkMode()">`;
        result += `<i id="mdwiki-ng_darkmode_icon" class="fas fa-moon" style="color: yellow;" area-hidden="true"></i>`;
        result += `</button>`;
        result += `</div>`;

        document.getElementById("topNavbar").innerHTML = result;

        // Set the correct dark-mode toggle icon
        main.renderDarkModeButton();
    },

    renderDarkModeButton: function() {
        const icon = document.body.querySelector("#mdwiki-ng_darkmode_icon");
        if (document.body.classList.contains("dark-mode")) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        }
        else {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
        }
    },

    renderNavigationHeading: function(token) {
        // Also set the page title
        window.document.title = token.text;
        window.mdwiking.title = token.text;
        return `<a href="#" class="navbar-brand">${token.text}</a>`;
    },

    renderNavigationLink: function(token, linkClass, newWindow = true) {
        const baseUrl = `${location.protocol}//${location.hostname}`;
        const url = new URL(token.href, baseUrl);
        if (`${url.protocol}//${url.hostname}` === baseUrl) {
            // This is a sub-page, add the #!
            return `<a href="#!${url.pathname}" class="${linkClass}">${token.text}</a>`;
        }
        else {
            return `<a href="${url.href}" class="${linkClass}" target="${newWindow ? "_blank" : "_self"}">${token.text}</a>`
        }
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
            heading(text, level, raw, slugger) {
                var output = "";
                const cssFontClass = `font-size-${20 - (level)} font-weight-bold`;
                const cssClass = (level === 1 ? "content-title pb-0 mb-0 font-weight-bold" : cssFontClass);
                if (this.options.headerIds) {

                    output = `<h${level} id="${this.options.headerPrefix}${slugger.slug(raw)}"
                                      class="${cssClass}">
                                ${text}
                            </h${level}>\n`;
                }
                else {
                    // ignore IDs
                    output = `<h${level} class="${cssClass}">${text}</h${level}>\n`;
                }

                if (level === 1) {
                    output += this.hr() + '\n';
                }

                return output;
            },
            link(href, title, text) {
                href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
                if (href === null) {
                    return text;
                }
                const titleAttrib = (title === null || title === undefined)
                                    ? ''
                                    : ` title="${title}"`;

                const baseUrl = `${location.protocol}//${location.hostname}:${location.port}`;
                const url = new URL(href, baseUrl);
                const urlMatch = `${url.protocol}//${url.hostname}:${url.port}`;

                if (urlMatch !== baseUrl) {
                    return `<a href="${escape(href)}" target="_blank" class="hyperlink-underline"${titleAttrib}>${text}</a>`;
                }
                else {
                    return `<a href="${escape(href)}" class="hyperlink-underline"${titleAttrib}>${text}</a>`;
                }
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
                       + '<span class="card-title code m-0 p-0">' + escape(lang, true) + '</span>'
                       + '<pre>'
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
                //return hljs.highlight(validLanguage, code).value;
                return hljs.highlight(code, {language: validLanguage}).value;
            },
            smartLists: true,
            smartypants: true,
        });
        const tokens = marked.lexer(text);
        if (tokens[0].type === "heading") {
            // also change the title to the new heading
            window.document.title = `${tokens[0].text} :: ${window.mdwiking.title}`;
        }
        document.getElementById("content").innerHTML
                    = marked.parse(text);

        hljs.highlightAll();
        hljs.initLineNumbersOnLoad();
    },
}

export default main;