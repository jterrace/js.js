js.js
=====

js.js is a JavaScript interpreter in JavaScript.

How?
----
Instead of trying to create an interpreter from scratch, SpiderMonkey_
is compiled into LLVM_ and then emscripten_ translates the output into
JavaScript.

Files
-----

* changes.rst - contains a list of changes that had to be manually
  made to get compiled code to run
* instructions.txt - instructions on how to build SpiderMonkey into
  LLVM

.. _SpiderMonkey: https://developer.mozilla.org/en/SpiderMonkey
.. _emscripten: http://emscripten.org/
.. _LLVM: http://llvm.org/
