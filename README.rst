
js.js is a JavaScript interpreter in JavaScript. Instead of trying to create an
interpreter from scratch, SpiderMonkey_ is compiled into LLVM_ and then
emscripten_ translates the output into JavaScript.

-----



Demos
-----
See several running demos `here <http://jterrace.github.io/js.js/>`_.

Paper
-----
Academic paper to appear at
`WebApps 2012 <http://static.usenix.org/events/webapps12/>`_ located
`here <http://www.cs.princeton.edu/~jterrace/docs/jsjs.pdf>`_.

Status
------
The compiled version of js.js is 3MB and only **594KB** after gzip compression.
Using the Sunspider_ benchmark, the interpreter is about **200 times slower**
than Spidermonkey's native interpreter with the JIT compiler turned off. More
optimizations and benchmarks are coming soon.

Example Use
-----------
Here is an example of how to use the API::

    var jsObjs = JSJS.Init();
    var rval = JSJS.EvaluateScript(jsObjs.cx, jsObjs.glob, "1 + 1");
    var d = JSJS.ValueToNumber(jsObjs.cx, rval);
    window.alert(d); //2
    JSJS.End(jsObjs);

More examples are available in the ``examples`` directory.

Files
-----
The following files are located in the ``src`` directory.

=================== =========
File                Description
=================== =========
``js.O0.js``        Command-line JS shell, no optimizations
``js.O0.min.js``    Command-line JS shell, no optimizations, closure compiled
``js.O1.js``        Command-line JS shell, O1 optimizations
``js.O1.min.js``    Command-line JS shell, O1 optimizations, closure compiled
``js.O2.js``        Command-line JS shell, O2 optimizations
``js.O2.min.js``    Command-line JS shell, O2 optimizations, closure compiled
``libjs.O0.js``     JSAPI shared library, no optimizations
``libjs.O0.min.js`` JSAPI shared library, no optimizations, closure compiled with js.js wrapper
``libjs.O1.js``     JSAPI shared library, O1 optimizations
``libjs.O1.min.js`` JSAPI shared library, O1 optimizations, closure compiled with js.js wrapper
``libjs.O2.js``     JSAPI shared library, O2 optimizations
``libjs.O2.min.js`` JSAPI shared library, O2 optimizations, closure compiled with js.js wrapper
``jsjs-wrapper.js`` js.js wrapper API to make using the JSAPI easier
=================== =========

To run the shell, you want to run one of these::

    js js.O2.min.js -e "print('hello');"
    node js.O2.min.js -e "print('hello');"

To include the API in your website, include the minified libjs like this::

    <script type="text/javascript" src="libjs.O2.min.js"></script>

Alternatively, you can use the wrapper script directly with a non-minified
version (useful for debugging and modifications)::

    <script type="text/javascript" src="libjs.O2.js"></script>
    <script type="text/javascript" src="jsjs-wrapper.js"></script>

.. _SpiderMonkey: https://developer.mozilla.org/en/SpiderMonkey
.. _emscripten: http://emscripten.org/
.. _LLVM: http://llvm.org/
.. _Sunspider: http://www.webkit.org/perf/sunspider/sunspider.html
