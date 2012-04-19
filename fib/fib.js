function fibonacci(n) {
  if (n==0 || n==1) {
    return n;
  }
  var prev2 = 0, prev1 = 1, fib = 1, i;
  for (i=2; i<=n; i++) {
    fib = prev1 + prev2;
    prev2 = prev1;
    prev1 = fib;
  }
  return fib;
}
