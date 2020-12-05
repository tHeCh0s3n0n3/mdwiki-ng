MDWiki-ng
---------

This is a reimagining of [Dynalon's mdwiki project](https://github.com/Dynalon/mdwiki) which has served me well for a while but has become unmaintained.

Features ported over
--------------------
MDWiki-ng has the following features from the original project:

* Can use the `navigation.md` special file to set the navigation bar at the top
* Can use any Markdown file as the page conent
* Will automatically open `home.md` if no file is specified
* Single file deployment, all you need is the `index.html` file

Differences
-----------
The following is done slightly differently

* The site title is taken from the first heading of `navigation.md` instead of a dedicated `config.json` file
* The page title is taken from the first heading of the file you are viewing and is prepended to the site title
* Syntax highlighting in code blocks is included by default
* Built on top of the [Halfmoon](https://gethalfmoon.com/) front-end framework instead of bootstrap
  * Uses Halfmoon's built-in light and dark themes and persists the choice across visits
* Everything is built into the `index.html`. __No external dependencies__ at all (not even from CDNs)
* All linked files __must__ be at the same directory level as/lower than `index.html`. You cannot link to a file elsewhere in the directory structure.

Limitations
-----------
Unlike the original MDWiki, MDWiki-ng is _not_ designed to be run on your local machine. This is because most browsers now block files opened with the file:// scheme from being able to load other files from disk (ex: `navigation.md`, `index.md`, etc.). You can of course override this behavior, however __this is not recommended__ as it will make your browser __less__ secure.
