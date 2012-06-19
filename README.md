Write maths, see maths is a jQuery plugin for editable areas which gives an instant [MathJax](http://www.mathjax.org) preview of the TeX you're writing just above the cursor.

To use it, just call <code>$(selector).writemaths()$</code> when the page loads.

You can optionally pass in an object with some options:

* ```cleanMaths```: a function which does something to the LaTeX before displaying it.
* ```callback```: a function which is called when the preview is displayed.
* ```iFrame```: set this to `true` if you're applying writemaths to something like TinyMCE, which lives inside an iframe.

The old version of write maths, see maths was an attempt at a line-by-line WYSIWYG editor with instant maths preview and a load of other stuff.
It lives on at [takenot.es](http://takenot.es).
