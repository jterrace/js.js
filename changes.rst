* Allow mmap to accept the -1 anon location

* Map Pages alignment fix, in ``AllocGCChunkEv``::

   var $call=__ZL8MapPagesPvj(0, 2097152);
   $call = $call + 1048576;
   $call = $call & 0xFFFFFFFFFFF00000;

* Comment out 0 = 0 

* Remove calls to ``pthread_`` stack size functions, replace with STACK_ROOT
  TOTAL_STACK 

* Replace ``getpagesize()`` with constant page size of 4096

* In ``AllocGCChunkEv()``, be sure to return the proper value

* In ``CheckStringLength``, remove the ``JS_UNLIKELY`` which is a hint to the compiler 
  that the branch is not likely to be taken. This is translated down into
  (I think) an llvm intrinsic that emscripten can't deal with.

* In ``BUILD_JSVAL`` in jsval.h, they play a nasty trick with unions to assign
  to two 32bit fields using a single 64bit value. Emscripten has no idea how to 
  deal with this. So replace anything that uses the .asBits field such as 
  l.asBits = (((uint64)(uint32)tag) << 32) | payload;
  
  with
  
  l.s.payload.i32 = payload;
  l.s.tag = tag;

  To fix it in the JavaScript directly, you need to assign to the two fields explicelty
  using HEAP[$addr] = payload and HEAP[$addr + 4] = tag
  
* In the TempAllocPolicy custom malloc, remove the JS_UNLIKELY which is translated
  down to an intrinsic that emscripten does not handle correctly.  
