# Write maths, see maths

Write maths, see maths is a jQuery plugin for editable areas which gives an instant [MathJax](http://www.mathjax.org) preview of the TeX you're writing just above the cursor.

To use it, just call <code>writemaths(element,options)</code> when the page loads.

You can optionally pass in an object with some options:

* ```cleanMaths```: a function which does something to the LaTeX before displaying it.
* ```callback```: a function which is called when the preview is displayed.
* ```of```: the element to position relative to.

## Usage

```javascript
<script src="writemaths.js"></script>
<link rel="stylesheet" href="writemaths.css"/>
```
