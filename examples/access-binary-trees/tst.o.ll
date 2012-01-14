; ModuleID = 'tst.o'
target datalayout = "e-p:64:64:64-i1:8:8-i8:8:8-i16:16:16-i32:32:32-i64:64:64-f32:32:32-f64:64:64-v64:64:64-v128:128:128-a0:0:64-s0:64:64-f80:128:128-n8:16:32:64"
target triple = "x86_64-unknown-linux-gnu"

@.str = private unnamed_addr constant [9 x i8] c"%lf %lf\0A\00"

define i32 @main() nounwind {
entry:
  %retval = alloca i32, align 4
  %a = alloca double, align 8
  %b = alloca double, align 8
  store i32 0, i32* %retval
  store double -0.000000e+00, double* %a, align 8
  store double 0.000000e+00, double* %b, align 8
  %tmp = load double* %a, align 8
  %tmp1 = load double* %b, align 8
  %call = call i32 (i8*, ...)* @printf(i8* getelementptr inbounds ([9 x i8]* @.str, i32 0, i32 0), double %tmp, double %tmp1)
  ret i32 0
}

declare i32 @printf(i8*, ...)
