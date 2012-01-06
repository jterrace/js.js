import sys

def disable_assembler(line):
    return line.replace("ENABLE_ASSEMBLER=1", "ENABLE_ASSEMBLER=0")
    
def disable_jit(line):
    return line.replace("ENABLE_JIT=1", "ENABLE_JIT=0")
    
def disable_yarr(line):
    return line.replace("ENABLE_YARR=1", "ENABLE_YARR=0")
    
def disable_yarr_jit(line):
    return line.replace("ENABLE_YARR_JIT = 1", "ENABLE_YARR_JIT = 0")
    
def makefile_filters(line):
    line = disable_assembler(line)
    line = disable_jit(line)
    line = disable_yarr_jit(line)
    return line

def check_asm():
    f = open('/usr/include/stdlib.h', 'r')
    for line in f:
        if '__asm' in line and not line.strip().startswith('//'):

            error_msg = """

Detected __asm in /usr/include/stdlib.h. Cannot continue.

 * To fix this, open /usr/include/stdlib.h and find this block:

=====================
# ifdef __cplusplus
extern "C++" int at_quick_exit (void (*__func) (void))
     __THROW __asm ("at_quick_exit") __nonnull ((1));
# else
extern int at_quick_exit (void (*__func) (void)) __THROW __nonnull ((1));
# endif
====================

 * Change it to this:

=====================
//# ifdef __cplusplus
//extern "C++" int at_quick_exit (void (*__func) (void))
//     __THROW __asm ("at_quick_exit") __nonnull ((1));
//# else
extern int at_quick_exit (void (*__func) (void)) __THROW __nonnull ((1));
//# endif
====================

"""

            sys.stderr.write(error_msg)
            sys.exit(1)

def remove_jsapi_asm(line):
    if not line.strip().startswith("//"):
        return line.replace("asm volatile(\"\":: \"g\" (hold) : \"memory\");", "//asm volatile(\"\":: \"g\" (hold) : \"memory\");")
    return line

def jsapi_filters(line):
    line = remove_jsapi_asm(line)
    return line

def remove_MacroAssemblerX86Common_setSSEState_asm(line):
    return line.replace("#elif WTF_COMPILER_GCC", "#elif IHATEYOU_WTF_COMPILER_GCC")

def MacroAssemblerX86Common_filters(line):
    line = remove_MacroAssemblerX86Common_setSSEState_asm(line)
    return line

def change_MacroAssemblerX86Common_cpp_ifdef(line):
    return line.replace("#if WTF_CPU_X86 || WTF_CPU_X86_64", "#if (WTF_CPU_X86 || WTF_CPU_X86_64) && ENABLE_ASSEMBLER")

def MacroAssemblerX86Common_cpp_filters(line):
    line = change_MacroAssemblerX86Common_cpp_ifdef(line)
    return line
