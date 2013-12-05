Write maths, see maths is a jQuery plugin for editable areas which gives an instant [MathJax](http://www.mathjax.org) preview of the TeX you're writing just above the cursor.

To use it, just call <code>$(selector).writemaths()$</code> when the page loads.

You can optionally pass in an object with some options:

* ```cleanMaths```: a function which does something to the LaTeX before displaying it.
* ```callback```: a function which is called when the preview is displayed.
* ```iFrame```: set this to `true` if you're applying writemaths to something like TinyMCE, which lives inside an iframe.
* ```position```: the position on the parent element on which to place the preview. It's really the ```at`` option of [jquery.ui.position](http://jqueryui.com/position/).
* ```previewPosition```: the position on the preview element to line up with the parent element. It's really the ```my``` option of [jquery.ui.position](http://jqueryui.com/position/).
* ```of```: the element to position relative to.
