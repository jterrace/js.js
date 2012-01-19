function fib(fld) {
       function f(n) {
         if(n == 0) return(0);
         if(n == 1) {
           return(1);
         }
         else {
           return(f(n - 1) + f(n - 2));
         }
       };
        
       var iters = window.prompt("What iteration (less than 30) of the Fibonacci sequence would you like to see?", 10);
       var res = f(iters);
       var ret = "The " + iters + " iteration of Fibonacci sequence is " + res;
       document.getElementById(fld).innerHTML = ret;
}

