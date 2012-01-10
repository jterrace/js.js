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

def expandlib_config_liststyle_none(line):
    return line.replace("EXPAND_LIBS_LIST_STYLE = \"linkerscript\"", "EXPAND_LIBS_LIST_STYLE = \"none\"")

def expandlibs_config_filters(line):
    line = expandlib_config_liststyle_none(line)
    return line

def jscpucfg_stack_direction(line):
    line = line.replace("# define JS_STACK_GROWTH_DIRECTION (-1)", "# define JS_STACK_GROWTH_DIRECTION (1)")
    return line.replace("#define JS_STACK_GROWTH_DIRECTION (-1)", "#define JS_STACK_GROWTH_DIRECTION (1)")

def jscpucfg_filters(line):
    line = jscpucfg_stack_direction(line)
    return line

def bytes_per_word(line):
    return line.replace("#define JS_BYTES_PER_WORD 8", "#define JS_BYTES_PER_WORD 4")

def align_of_pointer(line):
    return line.replace("#define JS_ALIGN_OF_POINTER 8", "#define JS_ALIGN_OF_POINTER 4")

def bits_per_word(line):
    return line.replace("#define JS_BITS_PER_WORD_LOG2 6", "#define JS_BITS_PER_WORD_LOG2 5")

def jsconfig_filters(line):
    line = bytes_per_word(line)
    return line

def jsconfdefs_filters(line):
    line = bytes_per_word(line)
    line = align_of_pointer(line)
    line = bits_per_word(line)
    return line

def map_pages_hack(line):
    #FIXME: this leaks memory, but is an acceptable hack for now since emscripten doesn't even implement free()
    return line.replace("p = MapPages(FindChunkStart(p), GC_CHUNK_SIZE);", "p = (void *)((size_t)p + GC_CHUNK_SIZE - ((size_t)p % GC_CHUNK_SIZE));")

def jsgchunk_cpp_filters(line):
    line = map_pages_hack(line)
    return line

def strip_js_likely(line):
    return line.replace("# define JS_LIKELY(x)   (__builtin_expect((x), 1))", "# define JS_LIKELY(x)   (x)")
def strip_js_unlikely(line):
    return line.replace("# define JS_UNLIKELY(x) (__builtin_expect((x), 0))", "# define JS_UNLIKELY(x) (x)")

def jstypes_h_filters(line):
    line = strip_js_likely(line)
    line = strip_js_unlikely(line)
    return line

def strip_null_null(line):
    return line.replace("*((int*)NULL) = 0;", "")
def jsinfer_cpp_filters(line):
    line = strip_null_null(line)
    return line
