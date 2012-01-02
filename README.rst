js.js
=====

js.js is a JavaScript interpreter in JavaScript.

How?
----
Instead of trying to create an interpreter from scratch, SpiderMonkey_
is compiled into LLVM_ and then emscripten_ translates the output into
JavaScript.

Why is it 65MB?
---------------
The current checked-in JavaScript file is 65MB because it is unoptimized. After turning on optimizations and running it through an optimizer (e.g. closure), we expect the library to be around 5-10MB.

How fast is it?
---------------
It currently takes about 40 seconds to run ``print(1+1)``. Obviously, at that speed, the library is practically useless. Once we turn on emscripten's optimizations (relooper algorithm, LLVM optimizations, Typed Arrays), we expect orders of maginitude increases in performance.

Does it work?
-------------
We have been modifying the JavaScript output file directly. Basic expressions now work, so the changes are being backported to C++ patches so that we can run the translator with optimizations. Stay tuned.


Files
-----

* changes.rst - contains a list of changes that had to be manually
  made to get compiled code to run
* instructions.txt - instructions on how to build SpiderMonkey into
  LLVM

.. _SpiderMonkey: https://developer.mozilla.org/en/SpiderMonkey
.. _emscripten: http://emscripten.org/
.. _LLVM: http://llvm.org/
