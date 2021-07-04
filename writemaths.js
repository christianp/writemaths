/*
Copyright (C) 2012 Christian Perfect

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function() {

var endDelimiters = {
    '$': /[^\\]\$/,
    '\\(': /[^\\]\\\)/,
    '$$': /[^\\]\$\$/,
    '\\[': /[^\\]\\\]/
}
var re_startMaths = /(?:^|[^\\])\$\$|(?:^|[^\\])\$|\\\(|\\\[|\\begin\{(\w+)\}/;
function findMaths(txt,target) {
    var i = 0;
    var m;
    var startDelimiter, endDelimiter;
    var start, end;
    var startChop, endChop;
    var re_end;
   
    while(txt.length) {
        m = re_startMaths.exec(txt);
        
        if(!m)     // if no maths delimiters, target is not in a maths section
            return null;
        
        startDelimiter = m[0];
        var start = m.index;
        
        if(i+start >= target)    // if target was before the starting delimiter, it's not in a maths section
            return null;
        
        startChop = start+startDelimiter.length;
        txt = txt.slice(startChop);
        
        if(startDelimiter.match(/^\\begin/)) {    //if this is an environment, construct a regexp to find the corresponding \end{} command.
            var environment = m[1];
            re_end = new RegExp('[^\\\\]\\\\end\\{'+environment+'\\}');    // don't ask if this copes with nested environments
        }
		else if(startDelimiter.match(/.\$/)) {
			re_end = endDelimiters[startDelimiter.slice(1)];
		} else {
            re_end = endDelimiters[startDelimiter];    // get the corresponding end delimiter for the matched start delimiter
        }
        
        m = re_end.exec(txt);
        
        if(!m) {    // if no ending delimiter, target is in a maths section
            return {
                start: i+start,
                end: i+startChop+txt.length,
                math: txt,
                startDelimiter: startDelimiter,
                endDelimiter: endDelimiter
            };
        }
        
        endDelimiter = m[0];
        var end = m.index+1;    // the end delimiter regexp has a "not a backslash" character at the start because JS regexps don't do negative lookbehind
        endChop = end+endDelimiter.length-1;
        if(i+startChop+end >= target) {    // if target is before the end delimiter, it's in a maths section
            return {
                start: i+start,
                end: i+startChop+endChop,
                math: txt.slice(0,end),
                startDelimiter: startDelimiter,
                endDelimiter: endDelimiter.slice(1)
            };
        } 
        else {
            txt = txt.slice(endChop);
            i += startChop+endChop;
        }
    }
}
var default_options = {
    cleanMaths: function(m){ return m; },
    callback: function() {},
    of: null
}

var previewElement = document.createElement('div');
previewElement.classList.add('wm_preview');

function hidePreview() {
    previewElement.classList.remove('show');
}
function showPreview() {
    previewElement.classList.add('show');
}

var last_math;

function should_ignore(element) {
    return element.nodeType == element.ELEMENT_NODE && (MathJax.Hub.config.tex2jax.skipTags.indexOf(element.nodeName.toLowerCase())!=-1 || element.classList.contains(MathJax.Hub.config.tex2jax.ignoreClass));
}

function writemaths(element, options) {
    document.body.appendChild(previewElement);
    options = Object.assign({},default_options,options);
    options.of = options.of || element;

    element.classList.add('tex2jax_ignore');

    var queue = MathJax.Callback.Queue(MathJax.Hub.Register.StartupHook("End",{}));

    var is_input = element.nodeName == 'TEXTAREA' || element.nodeName == 'INPUT';

    function positionPreview() {
        var rect = options.of.getBoundingClientRect();
        var prect = previewElement.getBoundingClientRect();
        previewElement.style.top = rect.y+'px';
        previewElement.style.left = (rect.x+(rect.width-prect.width)/2)+'px';
    }

    function updatePreview(e) {
        var txt, start;

        hidePreview();

        if(is_input) {
            if(element.selectionStart != element.selectionEnd) {
                return;
            }
            txt = element.value;
            start = element.selectionStart;
        } else {
            sel = window.getSelection();
            if(!sel.isCollapsed) {
                return;
            }
            var range = sel.getRangeAt(0);

            var e = range.startContainer;
            while(e && e != element) {
                if(should_ignore(e)) {
                    return;
                }
                e = e.parentElement;
            }

            txt = range.startContainer.textContent;
            start = range.startOffset;
            for(var n = range.startContainer.previousSibling;n;n=n.previousSibling) {
                if(should_ignore(n)) {
                    continue;
                }
                txt = n.textContent + txt;
                start += n.textContent.length;
            }
            for(var n = range.startContainer.nextSibling;n;n=n.nextSibling) {
                if(should_ignore(n)) {
                    continue;
                }
                txt = txt + n.textContent;
            }
        }

        var q = findMaths(txt,start);

        if(!q) {
            return;
        }

        var math;
        if(q.startDelimiter.match(/^\\begin/)) {
            math = q.startDelimiter + q.math + (q.endDelimiter ? q.endDelimiter : '');
        } else {
            math = q.math;
        }

        if(!math.length) {
            return;
        }

        showPreview();

        if(math!=last_math) {
            var script = document.createElement('script');
            script.setAttribute('type','math/tex');
            script.textContent = options.cleanMaths(math);
            previewElement.innerHTML = '';
            previewElement.appendChild(script);
            last_math = math;
            queue.Push(['Typeset',MathJax.Hub,previewElement[0]]);
            queue.Push(positionPreview);
            queue.Push(options.callback);
        }

        positionPreview();

    }

    element.addEventListener('blur',hidePreview);
    element.addEventListener('keyup',updatePreview);
    element.addEventListener('click',updatePreview);
    element.addEventListener('scroll',updatePreview);
};
window.writemaths = writemaths;
})();
