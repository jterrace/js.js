#!/usr/bin/python

"""This script builds js.js"""

import os
import sys
import argparse
import urllib
import zipfile
import shutil
import filecmp
import tempfile
import tarfile
import subprocess

import conf
import jsjs.util as util
import jsjs.compile_filters as compile_filters
from jsjs.filtering import filter_file
import jsjs.emscripten as emscripten

CURDIR = os.path.abspath(os.path.dirname(__file__))
ROOTDIR = util.abspath_join(CURDIR, "..")
BUILD_DIR_ABS = util.abspath_join(CURDIR, conf.BUILD_DIR)
NEEDED_COMMANDS = [("hg", "Mercurial"),
                   ("git", "Git"),
                   ("svn", "Subversion"),
                   ("make", "Make"),
                   ("autoreconf2.13", "autoreconf 2.13"),
                   ("scons", "SCons"),
                   ("java", "Java VM")]

def ensure_needed_commands():
    for command, name in NEEDED_COMMANDS:
        if util.which(command) is None:
            sys.stderr.write(("Could not find command: '%s'\n" + 
                             "Install %s and be sure that '%s' is on the path.\n")
                             % (command, name, command))
            sys.exit(1)

def get_llvm_dir():
    return util.abspath_join(BUILD_DIR_ABS, conf.LLVM_DIR)
def get_llvm_bindir():
    return util.abspath_join(get_llvm_dir(), "Debug+Asserts/bin")
def get_clang_path():
    return util.abspath_join(get_llvm_dir(), "Debug+Asserts/bin/clang")
def get_clangpp_path():
    return util.abspath_join(get_llvm_dir(), "Debug+Asserts/bin/clang++")
def get_llvm_link_path():
    return util.abspath_join(get_llvm_dir(), "Debug+Asserts/bin/llvm-link")
def get_llvm_dis_path():
    return util.abspath_join(get_llvm_dir(), "Debug+Asserts/bin/llvm-dis")
def get_llvm_ar_path():
    return util.abspath_join(get_llvm_dir(), "Debug+Asserts/bin/llvm-ar")
def get_v8_path():
    return util.abspath_join(BUILD_DIR_ABS, conf.V8_DIR, "out", "native", "d8")
def get_closure_compiler_path():
    return util.abspath_join(BUILD_DIR_ABS, conf.CLOSURE_COMPILER_DIR, "compiler.jar")
def get_emscripten_dir():
    return util.abspath_join(CURDIR, "../external/emscripten")
def get_emconfigure_path():
    return util.abspath_join(get_emscripten_dir(), "emconfigure")
def get_emcc_path():
    return util.abspath_join(get_emscripten_dir(), "emcc")
def get_nodejs_dir():
    return util.abspath_join(BUILD_DIR_ABS, conf.NODEJS_DIR, "node-v0.10.22")
def get_nodejs_path():
    return util.abspath_join(get_nodejs_dir(), "node")
def get_jsjs_out(filename="js.js"):
    return util.abspath_join(BUILD_DIR_ABS, "./%s" % filename)

def deps(**kwargs):
    print("[START] - deps")
    
    print("Checking for needed commands: " + ", ".join(c[0] for c in NEEDED_COMMANDS))
    ensure_needed_commands()
    
    print("Creating build directory: '%s'" % BUILD_DIR_ABS)
    util.mkdir(BUILD_DIR_ABS)
    
    llvmdir = get_llvm_dir()
    print("Checking for LLVM: '%s'" % llvmdir)
    if not os.path.isdir(util.abspath_join(llvmdir, "lib")):
        util.svn_co(conf.LLVM_URL, llvmdir)
    
    clangdir = util.abspath_join(llvmdir, "tools/clang")
    print("Checking for Clang: '%s'" % clangdir)
    if not os.path.isdir(util.abspath_join(clangdir, "lib")):
        util.svn_co(conf.CLANG_URL, clangdir)
    
    compilerrtdir = util.abspath_join(llvmdir, "projects/compiler-rt")
    print("Checking for Compiler RT: '%s'" % compilerrtdir)
    if not os.path.isdir(util.abspath_join(compilerrtdir, "lib")):
        util.svn_co(conf.COMPILER_RT_URL, compilerrtdir)
    
    if not os.path.exists(util.abspath_join(llvmdir, "Makefile.config")):
        util.run_command(["./configure"], cwd=llvmdir)
    
    clang_path = get_clang_path()
    clangpp_path = get_clangpp_path()
    clang_found = util.is_exe(clang_path) and util.is_exe(clangpp_path)
    if not clang_found:
        util.run_command(["make"], cwd=llvmdir)
    clang_found = util.is_exe(clang_path) and util.is_exe(clangpp_path)
    if not clang_found:
        sys.stderr.write("Failed to build LLVM clang/clang++\n")
        sys.exit(1)
    print("Using clang: " + clang_path)
    print("Using clang++: " + clangpp_path)
    
    v8dir = util.abspath_join(BUILD_DIR_ABS, conf.V8_DIR)
    print("Checking for V8: '%s'" % v8dir)
    if not os.path.isdir(util.abspath_join(v8dir, "src")):
        util.svn_co(conf.V8_URL, v8dir)
    v8_path = get_v8_path()
    if not util.is_exe(v8_path):
        util.run_command(["make", "dependencies"], cwd=v8dir)
        util.run_command(["make", "native"], cwd=v8dir)
    if not util.is_exe(v8_path):
        sys.stderr.write("Failed to build v8 d8 executable\n")
        sys.exit(1)
    print("Using d8: " + v8_path)
    
    closure_compiler_dir = util.abspath_join(BUILD_DIR_ABS, conf.CLOSURE_COMPILER_DIR)
    util.mkdir(closure_compiler_dir)
    closure_compiler_zip = util.abspath_join(closure_compiler_dir, "compiler-latest.zip")
    if not os.path.isfile(closure_compiler_zip):
        print("Downloading '%s' -> '%s'" % (conf.CLOSURE_COMPILER_URL, closure_compiler_zip))
        urllib.urlretrieve(conf.CLOSURE_COMPILER_URL, closure_compiler_zip)
    closure_compiler = get_closure_compiler_path()
    if not os.path.isfile(closure_compiler):
        z = zipfile.ZipFile(closure_compiler_zip)
        z.extractall(path=closure_compiler_dir)
    if not os.path.isfile(closure_compiler):
        sys.stderr.write("Failed to get closure compiler\n")
        sys.exit(1)
    print("Using compiler.jar: " + closure_compiler)
    
    nodejs_dir = util.abspath_join(BUILD_DIR_ABS, conf.NODEJS_DIR)
    util.mkdir(nodejs_dir)
    nodejs_tgz = util.abspath_join(nodejs_dir, os.path.basename(conf.NODEJS_URL))
    if not os.path.isfile(nodejs_tgz):
        print("Downloading '%s' -> '%s'" % (conf.NODEJS_URL, nodejs_tgz))
        urllib.urlretrieve(conf.NODEJS_URL, nodejs_tgz)
    nodejs_dir_path = get_nodejs_dir()
    if not os.path.isfile(util.abspath_join(nodejs_dir_path, "./configure")):
        print("Extracting '%s' -> '%s'" % (nodejs_tgz, nodejs_dir))
        t = tarfile.open(nodejs_tgz)
        t.extractall(path=nodejs_dir)
    nodejs_path = get_nodejs_path()
    if not util.is_exe(nodejs_path):
        util.run_command(["./configure"], cwd=nodejs_dir_path)
        util.run_command(["make"], cwd=nodejs_dir_path)
    if not util.is_exe(nodejs_path):
        sys.stderr.write("Failed to build nodejs.\n")
        sys.exit(1)
    print("Using node: " + nodejs_path)
    
    emscripten_dir = get_emscripten_dir()
    print("Checking for emscripten: '%s'" % emscripten_dir)
    if not util.is_exe(util.abspath_join(emscripten_dir, "emscripten.py")):
        sys.stderr.write("Could not find emscripten.py in emscripten directory '%s'.\n" % emscripten_dir)
        sys.stderr.write("Did you forget to run 'git submodule update --init --recursive' after cloning?\n")
        sys.exit(1)
    
    emscripten.write_emscripten_config(
        get_llvm_bindir(), get_v8_path(), get_closure_compiler_path(),
        get_emscripten_dir(), get_nodejs_path(), [
            '-Wno-return-type-c-linkage', '-Wno-extended-offsetof',
            '-Wno-unused-private-field', '-Wno-error', '-Wno-error=return-type'])
    
    print("[DONE] - deps")

def compile(**kwargs):
    print("[START] - compile")
    
    mozdir = util.abspath_join(BUILD_DIR_ABS, conf.MOZILLA_CENTRAL_DIR)
    js_src_dir = util.abspath_join(mozdir, "js/src")
    if not os.path.isdir(util.abspath_join(mozdir, "browser")):
        util.hg_clone(conf.MOZILLA_CENTRAL_URL, mozdir, conf.MOZILLA_CENTRAL_TAG)
    print("Using mozilla-central js/src directory: '%s'" % js_src_dir)
    
    if kwargs.get('clean', False):
        try:
            shutil.rmtree(js_src_dir)
        except OSError:
            pass
        
        util.run_command(["hg", "revert", "js/src"], cwd=mozdir)
    
    if not util.is_exe(util.abspath_join(js_src_dir, "./configure")):
        util.run_command(["autoreconf2.13"], cwd=js_src_dir)
    
    emconfigure = get_emconfigure_path()
    
    configure_line = [emconfigure,
                      "./configure",
                      "--disable-methodjit",
                      "--disable-monoic",
                      "--disable-polyic",
                      "--disable-tracejit",
                      "--disable-methodjit-spew",
                      "--disable-tests",
                      "--disable-debug",
                      "--disable-optimize"
                      ]

    configure_in_path = util.abspath_join(js_src_dir, "configure.in")
    configure_path = util.abspath_join(js_src_dir, "configure")
    makefile_path = util.abspath_join(js_src_dir, "./Makefile")
    if not os.path.isfile(makefile_path):
        filter_file(configure_in_path, compile_filters.configure_filters)
        filter_file(configure_path, compile_filters.configure_filters)
        util.run_command(configure_line, cwd=js_src_dir)
    
    filter_file(makefile_path, compile_filters.makefile_filters)
    
    jsapi_h_path = util.abspath_join(js_src_dir, "./jsapi.h")
    filter_file(jsapi_h_path, compile_filters.jsapi_filters)
    
    MacroAssemblerX86Common_h_path = util.abspath_join(js_src_dir, "./assembler/assembler/MacroAssemblerX86Common.h")
    filter_file(MacroAssemblerX86Common_h_path, compile_filters.MacroAssemblerX86Common_filters)
    
    MacroAssemblerX86Common_cpp_path = util.abspath_join(js_src_dir, "./assembler/assembler/MacroAssemblerX86Common.cpp")
    filter_file(MacroAssemblerX86Common_cpp_path, compile_filters.MacroAssemblerX86Common_cpp_filters)
    
    expandlibs_config_path = util.abspath_join(js_src_dir, "./config/expandlibs_config.py")
    filter_file(expandlibs_config_path, compile_filters.expandlibs_config_filters)

    gcc_hidden_path = util.abspath_join(js_src_dir, "./config/gcc_hidden.h")
    filter_file(gcc_hidden_path, compile_filters.gcc_hidden_filters)

    jsgcchunk_cpp_path = util.abspath_join(js_src_dir, "./jsgcchunk.cpp")
    filter_file(jsgcchunk_cpp_path, compile_filters.jsgchunk_cpp_filters)
    
    jsinfer_cpp_path = util.abspath_join(js_src_dir, "./jsinfer.cpp")
    filter_file(jsinfer_cpp_path, compile_filters.jsinfer_cpp_filters)
    
    platform_h_path = util.abspath_join(js_src_dir, "./assembler/wtf/Platform.h")
    filter_file(platform_h_path, compile_filters.platform_h_filters)
    
    pcre_exec_cpp_path = util.abspath_join(js_src_dir, "./yarr/pcre/pcre_exec.cpp")
    filter_file(pcre_exec_cpp_path, compile_filters.pcre_exec_cpp_filters)
    
    jsval_h_path = util.abspath_join(js_src_dir, "./jsval.h")
    filter_file(jsval_h_path, compile_filters.jsval_h_filters)
    
    jsinterp_cpp_path = util.abspath_join(js_src_dir, "./jsinterp.cpp")
    filter_file(jsinterp_cpp_path, compile_filters.jsinterp_cpp_filters)
    
    js_shell_bc_out = util.abspath_join(js_src_dir, "./shell/js")
    libjs_static_out = util.abspath_join(js_src_dir, "./libjs_static.a")
    make_success = os.path.exists(libjs_static_out) and os.path.exists(js_shell_bc_out)
    
    if not make_success:
        util.run_command(["make", "-C", "config"], cwd=js_src_dir)
        util.run_command(["make", "jsautocfg.h"], cwd=js_src_dir)
        
        jscpucfg_h_path = util.abspath_join(js_src_dir, "./jscpucfg.h")
        filter_file(jscpucfg_h_path, compile_filters.jscpucfg_filters)
        jsautocfg_h_path = util.abspath_join(js_src_dir, "./jsautocfg.h")
        filter_file(jsautocfg_h_path, compile_filters.jscpucfg_filters)
        
        jsconfig_h_path = util.abspath_join(js_src_dir, "./js-config.h")
        filter_file(jsconfig_h_path, compile_filters.jsconfig_filters)
        
        jsconfdefs_h_path = util.abspath_join(js_src_dir, "./js-confdefs.h")
        filter_file(jsconfdefs_h_path, compile_filters.jsconfdefs_filters)
        
        jstypes_h_path = util.abspath_join(js_src_dir, "./jstypes.h")
        filter_file(jstypes_h_path, compile_filters.jstypes_h_filters)
        
        util.run_command(["make"], cwd=js_src_dir, added_env={"EMCC_DEBUG": "1"})
    
    make_success = os.path.exists(libjs_static_out) and os.path.exists(js_shell_bc_out)
    if not make_success:
        sys.stderr.write("Failed to build spidermonkey. Exiting.\n")
        sys.exit(1)
    
    o_files = subprocess.check_output([get_llvm_ar_path(), 't', libjs_static_out]).strip().split("\n")

    js_combined_bc = util.abspath_join(BUILD_DIR_ABS, "./js_combined.bc")
    js_combined_ll = util.abspath_join(BUILD_DIR_ABS, "./js_combined.ll")
    libjs_ll = util.abspath_join(BUILD_DIR_ABS, "./libjs.ll")
    libjs_bc = util.abspath_join(BUILD_DIR_ABS, "./libjs.bc")

    command = [get_llvm_link_path(), '-o', libjs_bc]
    command.extend(o_files)
    util.run_command(command, cwd=js_src_dir)
    util.run_command([get_llvm_dis_path(), '-show-annotations', '-o', libjs_ll, libjs_bc])

    js_shell_o_out = util.abspath_join(js_src_dir, "./shell/js.o")
    jsheaptools_o = util.abspath_join(js_src_dir, "./shell/jsheaptools.o")
    jsoptparse_o = util.abspath_join(js_src_dir, "./shell/jsoptparse.o")
    jsworkers_o = util.abspath_join(js_src_dir, "./shell/jsworkers.o")
    util.run_command([get_llvm_link_path(), '-o', js_combined_bc, libjs_bc, js_shell_o_out, jsheaptools_o, jsoptparse_o, jsworkers_o])
    util.run_command([get_llvm_dis_path(), '-show-annotations', '-o', js_combined_ll, js_combined_bc])
    
    if not os.path.isfile(js_combined_ll):
        sys.stderr.write("Failed to build combined LLVM file.\n")
        sys.exit(1)
    
    print("Built LLVM file:\n -- %s" % js_combined_ll)
    print(" -- %g MB" % (float(os.path.getsize(js_combined_ll)) / 1024 / 1024,))
    
    print("[DONE] - compile")

def translate(**kwargs):
    print("[START] - translate")
    
    js_combined_ll = util.abspath_join(BUILD_DIR_ABS, "./js_combined.ll")
    if not os.path.isfile(js_combined_ll):
        sys.stderr.write("Could not find expected LLVM output file at '%s'.\n" % js_combined_ll)
        sys.stderr.write("Did you forget to run ./build.py compile ?\n")
        sys.exit(1)
        
    libjs_ll = util.abspath_join(BUILD_DIR_ABS, "./libjs.ll")
    if not os.path.isfile(libjs_ll):
        sys.stderr.write("Could not find expected LLVM output file at '%s'.\n" % libjs_ll)
        sys.stderr.write("Did you forget to run ./build.py compile ?\n")
        sys.exit(1)
    
    js_js_path = get_jsjs_out(kwargs['out'])

    added_env = dict(EMCC_DEBUG='1')
    
    opt_level = kwargs['O']
    extra_args = ['-O' + str(opt_level)]
    
    if opt_level == 0:
        added_env['EMCC_LEAVE_INPUTS_RAW']='1'
    
    extra_args.extend(['--typed-arrays', '2'])
    extra_args.extend(['--closure', str(kwargs['closure'])])
    extra_args.extend(['-s', 'LABEL_DEBUG=%d' % kwargs['label_debug']])
    
    extra_args.extend(['-s', 'DISABLE_EXCEPTION_CATCHING=0'])
    
    if kwargs['library_only']:
        extra_args.extend(['-s', 'CLOSURE_ANNOTATIONS=1'])
        extra_args.extend(['-s', 'INCLUDE_FULL_LIBRARY=1'])
    
    args = [get_emcc_path()]
    args.extend(extra_args)
    args.extend(['-o', js_js_path])
    args.append(libjs_ll if kwargs['library_only'] else js_combined_ll)
    
    util.run_command(args, added_env=added_env, cwd=BUILD_DIR_ABS)
       
    #FIXME: we could detect bad return value from emscripten, but it
    # returns 0, even when it fails!
    if not os.path.isfile(js_js_path):
        sys.stderr.write("Translation failed.\n")
        sys.exit(1)
        
    print("js.js at '%s'" % js_js_path)
    
    print("[DONE] - translate")

def build_all(**kwargs):
    deps(**kwargs)
    compile(**kwargs)
    translate(**kwargs)

def multiconfig(**kwargs):
    jsjswrapper = util.abspath_join(ROOTDIR, "./src/jsjs-wrapper.js")
    if not os.path.isfile(jsjswrapper):
        sys.stderr.write("Failed to find wrapper file '%s'." % jsjswrapper)
        sys.exit(1)
    
    for opt_level in [0, 1, 2]:
        for library_only in [True, False]:

            base = "libjs" if library_only else "js"
            base_filename = '%s.O%d' % (base, opt_level)
            uncompressed_filename = base_filename + '.js'
            
            args = {'O': opt_level,
                    'closure': 0,
                    'label_debug': 0,
                    'out': uncompressed_filename,
                    'library_only': library_only}
            
            print("Working on generating '%s'." % uncompressed_filename)
            translate(**args)
            
            compressed_filename = util.abspath_join(BUILD_DIR_ABS, base_filename + ".min.js")
            uncompressed_filename = util.abspath_join(BUILD_DIR_ABS, uncompressed_filename)
            
            closure_path = get_closure_compiler_path()
            
            print("Working on closure compiling '%s' into '%s'." % (uncompressed_filename, compressed_filename))
            
            closure_args = ["java",
                            "-jar", closure_path,
                            "--compilation_level", "ADVANCED_OPTIMIZATIONS",
                            "--js_output_file", compressed_filename,
                            "--js", uncompressed_filename]
            
            if library_only:
                closure_args.append(jsjswrapper)
            
            retcode = util.run_command(closure_args)
            
            if retcode != 0:
                sys.stderr.write("Closure compiling failed.")
                sys.exit(1)            

def main():
    parser = argparse.ArgumentParser(description='Build script for js.js')
    subparsers = parser.add_subparsers(title='available commands')
    
    deps_parser = subparsers.add_parser('deps', help='Checks out, builds, and installs dependencies', add_help=False)
    deps_parser.set_defaults(func=deps)
    
    compile_parser = subparsers.add_parser('compile', help='Compiles SpiderMonkey into LLVM', add_help=False)
    compile_parser.add_argument('--clean', action='store_true', help='Cleans out the js/src directory before compiling. Useful for debugging.')
    compile_parser.set_defaults(func=compile)
    
    translate_parser = subparsers.add_parser('translate', help='Translates output LLVM file into JS', add_help=False)
    translate_parser.add_argument('-O', type=int, help='Specify optimization level (default: %(default)s)', default=0, choices=[0,1,2])
    translate_parser.add_argument('--label-debug', type=int, help='Runs translation with LABEL_DEBUG=1. This prints tracing information when running. (default: %(default)s)', default=0, choices=[0,1])
    translate_parser.add_argument('--closure', type=int, help='Closure compiles the output. (default: %(default)s)', default=0, choices=[0,1])
    translate_parser.add_argument('--out', type=str, help='Output file for the translated JavaScript. (default: %(default)s)', default='js.js')
    translate_parser.add_argument('--library-only', action='store_true', default=False, help='Only build libjs, not including the js shell.')
    translate_parser.set_defaults(func=translate)
    
    all_subparsers = [deps_parser, compile_parser, translate_parser]
    all_parser = subparsers.add_parser('all', help='Runs deps, compile, and translate', parents=all_subparsers)
    all_parser.set_defaults(func=build_all)
    
    for subparser in all_subparsers:
        subparser.add_argument('-h', '--help', action='help', default=argparse.SUPPRESS, help='show this help message and exit')
    
    multiconfig_parser = subparsers.add_parser('multiconfig', help='Calls translate with many combinations of optimizations and saves the files to the build directory.')
    multiconfig_parser.set_defaults(func=multiconfig)
    
    args = parser.parse_args()
    args.func(**vars(args))

if __name__ == '__main__':
    main()
