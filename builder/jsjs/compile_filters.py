import sys

def disable_assembler(line):
    return line.replace("ENABLE_ASSEMBLER=1", "ENABLE_ASSEMBLER=0")
    
def disable_jit(line):
    return line.replace("ENABLE_JIT=1", "ENABLE_JIT=0")
    
def disable_yarr(line):
    return line.replace("ENABLE_YARR=1", "ENABLE_YARR=0")
    
def disable_yarr_jit(line):
    return line.replace("ENABLE_YARR_JIT = 1", "ENABLE_YARR_JIT = 0")
    
def enable_pcre(line):
    return line.replace("ifeq (,$(filter arm% sparc %86 x86_64,$(TARGET_CPU)))", "ifeq (,)")
    
def makefile_filters(line):
    line = disable_assembler(line)
    line = disable_jit(line)
    line = disable_yarr_jit(line)
    line = enable_pcre(line)
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

def force_VA_HAVE_LIST_AS_ARRAY(line):
    return line.replace("JS_ADDRESSOF_VA_LIST(ap))) {", "*(va_list**)&ap))")

def jsapi_filters(line):
    line = remove_jsapi_asm(line)
    line = force_VA_HAVE_LIST_AS_ARRAY(line)
    return line

def remove_MacroAssemblerX86Common_setSSEState_asm(line):
    return line.replace("#elif WTF_COMPILER_GCC", "#elif IHATEYOU_WTF_COMPILER_GCC")

def MacroAssemblerX86Common_filters(line):
    line = remove_MacroAssemblerX86Common_setSSEState_asm(line)
    return line

def change_MacroAssemblerX86Common_cpp_ifdef(line):
    return line.replace("#if WTF_CPU_X86 || WTF_CPU_X86_64", "#if (WTF_CPU_X86 || WTF_CPU_X86_64) && ENABLE_ASSEMBLER")

def ExecutableAllocator_filters(line):
    return line.replace("#error \"The cacheFlush support is missing on this platform.\"", "static void cacheFlush(void*, size_t){}")

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

def remove_methodjit_typed_array(line):
    return line.replace("#define JS_METHODJIT_TYPED_ARRAY 1", "")

def jsconfig_filters(line):
    line = bytes_per_word(line)
    return line

def jsconfdefs_filters(line):
    line = bytes_per_word(line)
    line = align_of_pointer(line)
    line = bits_per_word(line)
    line = remove_methodjit_typed_array(line)
    return line

def map_pages_hack(line):
    #FIXME: this leaks memory, but is an acceptable hack for now since emscripten doesn't even implement free()
    return line.replace("p = MapPages(NULL, GC_CHUNK_SIZE);", "p = MapPages(NULL, GC_CHUNK_SIZE * 2); p = (void *)((size_t)p + GC_CHUNK_SIZE - ((size_t)p % GC_CHUNK_SIZE));")

def jsgchunk_cpp_filters(line):
    line = map_pages_hack(line)
    return line

def strip_js_likely(line):
    return line.replace("# define JS_LIKELY(x)   (__builtin_expect((x), 1))", "# define JS_LIKELY(x)   (x)")
def strip_js_unlikely(line):
    return line.replace("# define JS_UNLIKELY(x) (__builtin_expect((x), 0))", "# define JS_UNLIKELY(x) (x)")
def change_debug_inline(line):
    return line.replace("if defined DEBUG", "if defined JS_INLINE")
def jstypes_h_filters(line):
    line = strip_js_likely(line)
    line = strip_js_unlikely(line)
    line = change_debug_inline(line)
    return line

def strip_null_null(line):
    return line.replace("*((int*)NULL) = 0;", "")
def jsinfer_cpp_filters(line):
    line = strip_null_null(line)
    return line

def disable_jit_define(line):
    return "" if "#define ENABLE_JIT" in line else line
def disable_yarr_define(line):
    return "" if "#define ENABLE_YARR" in line else line
def disable_yarr_jit_define(line):
    return "" if "#define ENABLE_YARR_JIT" in line else line
def disable_wtf_use_jit_stub_argument_register_define(line):
    return "" if "#define WTF_USE_JIT_STUB_ARGUMENT_REGISTER" in line else line
def disable_assembler(line):
    return "" if "#define ENABLE_ASSEMBLER" in line else line
def platform_h_filters(line):
    line = disable_jit_define(line)
    line = disable_yarr_define(line)
    line = disable_yarr_jit_define(line)
    line = disable_wtf_use_jit_stub_argument_register_define(line)
    line = disable_assembler(line)
    return line

def disable_goto_thing2(line):
    return line.replace("USE_COMPUTED_GOTO_FOR_MATCH_OPCODE_LOOP", "XXX_STOP_USING_GOTOS_XXX_USE_COMPUTED_GOTO_FOR_MATCH_OPCODE_LOOP")
def disable_goto_thing1(line):
    line = line.replace("#define USE_COMPUTED_GOTO_FOR_MATCH_RECURSION", "#undef USE_COMPUTED_GOTO_FOR_MATCH_RECURSION\n#undef USE_COMPUTED_GOTO_FOR_MATCH_OPCODE_LOOP")
    line = line.replace("USE_COMPUTED_GOTO_FOR_MATCH_RECURSION", "XXX_STOP_USING_GOTOS_XXX_USE_COMPUTED_GOTO_FOR_MATCH_RECURSION")
    return line
def pcre_exec_cpp_filters(line):
    line = disable_goto_thing1(line)
    line = disable_goto_thing2(line)
    return line

def change_asbits_junk(line):
    return line.replace("l.asBits = (((uint64)(uint32)tag) << 32) | payload;", "l.s.tag = tag; l.s.payload.u32 = payload;")
def jsval_h_filters(line):
    line = change_asbits_junk(line)
    return line

def disable_threaded_interp(line):
    return line.replace("define JS_THREADED_INTERP 1", "define JS_THREADED_INTERP 0")
def change_case1(line):
    return line.replace("# define END_CASE_LEN1      goto advance_pc_by_one;", "# define END_CASE_LEN1      len = 1; break;")
def change_case2(line):
    return line.replace("# define END_CASE_LEN2      len = 2; goto advance_pc;", "# define END_CASE_LEN2      len = 2; break;")
def change_case3(line):
    return line.replace("# define END_CASE_LEN3      len = 3; goto advance_pc;", "# define END_CASE_LEN3      len = 3; break;")
def change_case4(line):
    return line.replace("# define END_CASE_LEN4      len = 4; goto advance_pc;", "# define END_CASE_LEN4      len = 4; break;")
def change_case5(line):
    return line.replace("# define END_CASE_LEN5      len = 5; goto advance_pc;", "# define END_CASE_LEN5      len = 5; break;")
def change_case_varlen(line):
    return line.replace("# define END_VARLEN_CASE    goto advance_pc;", "# define END_VARLEN_CASE    break;")
def change_case_empty(line):
    return line.replace("# define END_EMPTY_CASES    goto advance_pc_by_one;", "# define END_EMPTY_CASES    len = 1; break;")
def remove_advance_one_label(line):
    line = line.replace("advance_pc_by_one:", "")
    line = line.replace("JS_ASSERT(js_CodeSpec[op].length == 1);", "")
    if line.strip() == "len = 1;":
        line = ""
    return line
def jsinterp_cpp_filters(line):
    line = disable_threaded_interp(line)
    line = remove_advance_one_label(line)
    line = change_case1(line)
    line = change_case2(line)
    line = change_case3(line)
    line = change_case4(line)
    line = change_case5(line)
    line = change_case_varlen(line)
    line = change_case_empty(line)
    return line
