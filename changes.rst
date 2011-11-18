* Allow mmap to accept the -1 anon location

* Map Pages alignment fix, in ``AllocGCChunkEv``::

   var $call=__ZL8MapPagesPvj(0, 2097152);
   $call = $call + 1048576;
   $call = $call & 0xFFFFFFFFFFF00000;

* Comment out 0 = 0 

* Remove calls to ``pthread_`` stack size functions, replace with bogus values thus far

* Replace ``getpagesize()`` with constant page size of 4096

* In ``AllocGCChunkEv()``, be sure to return the proper value

* In ``CheckStringLength``, remove the ``JS_UNLIKELY`` which is a hint to the compiler 
  that the branch is not likely to be taken. This is translated down into
  (I think) an llvm intrinsic that emscripten can't deal with.
