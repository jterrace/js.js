#!/usr/bin/python

"""This script builds js.js"""

import os
import sys
import argparse

import conf
import jsjs.util as util
import jsjs.compile_filters as compile_filters
from jsjs.filtering import filter_file

CURDIR = os.path.abspath(os.path.dirname(__file__))
BUILD_DIR_ABS = util.abspath_join(CURDIR, conf.BUILD_DIR)
NEEDED_COMMANDS = [("hg", "Mercurial"),
                   ("git", "Git"),
                   ("svn", "Subversion"),
                   ("make", "Make"),
                   ("autoreconf2.13", "autoreconf 2.13")]

def ensure_needed_commands():
    for command, name in NEEDED_COMMANDS:
        if util.which(command) is None:
            sys.stderr.write(("Could not find command: '%s'\n" + 
                             "Install %s and be sure that '%s' is on the path.\n")
                             % (command, name, command))
            sys.exit(1)

def get_llvm_dir():
    return util.abspath_join(BUILD_DIR_ABS, conf.LLVM_DIR)
def get_clang_path():
    return util.abspath_join(get_llvm_dir(), "Debug/bin/clang")
def get_clangpp_path():
    return util.abspath_join(get_llvm_dir(), "Debug/bin/clang++")

def deps():
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
        sys.stderr.write("Failed to build LLVM clang/clang++")
        sys.exit(1)
    print("Using clang: " + clang_path)
    print("Using clang++: " + clangpp_path)
    
    print("[DONE] - deps")

def compile():
    print("[START] - compile")
    
    mozdir = util.abspath_join(BUILD_DIR_ABS, conf.MOZILLA_CENTRAL_DIR)
    js_src_dir = util.abspath_join(mozdir, "js/src")
    if not os.path.isdir(js_src_dir):
        util.hg_clone(conf.MOZILLA_CENTRAL_URL, mozdir, conf.MOZILLA_CENTRAL_TAG)
    print("Using mozilla-central js/src directory: '%s'" % js_src_dir)
    
    if not util.is_exe(util.abspath_join(js_src_dir, "./configure")):
        util.run_command(["autoreconf2.13"], cwd=js_src_dir)
    
    clang_path = get_clang_path()
    clangpp_path = get_clangpp_path()
    
    FLAGS = " ".join(["-U__i386__",
                      "-U__amd64__",
                      "-Wno-implicit-int"
                      ])
    
    config_env = dict(os.environ.items() + 
                      dict(CC=clang_path,
                           CXX=clangpp_path,
                           CFLAGS=FLAGS,
                           CXXFLAGS=FLAGS
                           ).items()
                      )
    
    configure_line = ["./configure",
                      "--disable-methodjit",
                      "--disable-monoic",
                      "--disable-polyic",
                      "--disable-tracejit",
                      "--disable-methodjit-spew",
                      "--disable-tests",
                      "--enable-debug",
                      "--disable-optimize"
                      ]
    
    makefile_path = util.abspath_join(js_src_dir, "./Makefile")
    if not os.path.isfile(makefile_path):
        print("Using environment:\n" + "\n".join("  %s=%s" % (k,v) for k,v in config_env.iteritems()))
        util.run_command(configure_line, cwd=js_src_dir, env=config_env, shell=True)
    
    filter_file(makefile_path, compile_filters.makefile_filters)
    
    compile_filters.check_asm()
    
    jsapi_h_path = util.abspath_join(js_src_dir, "./jsapi.h")
    filter_file(jsapi_h_path, compile_filters.jsapi_filters)
    
    util.run_command(["make", "-C", "config"], cwd=js_src_dir)
    #make -C config
    
    util.run_command(["make", "export"], cwd=js_src_dir)
    #make export
    
    util.run_command(["make", "-C", "config", "export"], cwd=js_src_dir)
    #make -C config export
    
    util.run_command(["make", "host_jskwgen"], cwd=js_src_dir)
    #make host_jskwgen
    
    jsautokw_path = util.abspath_join(js_src_dir, "./jsautokw.h")
    util.run_command(["./host_jskwgen", jsautokw_path], cwd=js_src_dir)
    #./host_jskwgen /home/jterrace/jsjs/mozilla-central-743ed92f9332/js/src/jsautokw.h
    
    util.run_command(["make", "host_jsoplengen"], cwd=js_src_dir)
    #make host_jsoplengen
    
    jsautooplen_path = util.abspath_join(js_src_dir, "./jsautooplen.h")
    util.run_command(["./host_jsoplengen", jsautooplen_path], cwd=js_src_dir)
    #./host_jsoplengen /home/jterrace/jsjs/mozilla-central-743ed92f9332/js/src/jsautooplen.h
    
    # TODO: this seems to be missing now? maybe it was removed?
    #util.run_command(["make", "jscpucfg"], cwd=js_src_dir)
    #make jscpucfg
    #./jscpucfg > jsautocfg.h
    
    print("[DONE] - compile")

def main():
    parser = argparse.ArgumentParser(description='Build script for js.js')
    subparsers = parser.add_subparsers()
    
    deps_parser = subparsers.add_parser('deps',
                                        help='Checks out, builds, and installs dependencies')
    deps_parser.set_defaults(func=deps)
    
    compile_parser = subparsers.add_parser('compile',
                                         help='Compiles SpiderMonkey into LLVM')
    compile_parser.set_defaults(func=compile)
    
    args = parser.parse_args()
    args.func()

if __name__ == '__main__':
    main()
