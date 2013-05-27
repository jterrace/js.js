#this path can be relative to this directory or absolute
BUILD_DIR = "./build"

#these paths are relative to the build directory (above) or absolute
MOZILLA_CENTRAL_DIR = "./mozilla-central"
LLVM_DIR = "./llvm32"
V8_DIR = "./v8"
CLOSURE_COMPILER_DIR = "./closure-compiler"
SPIDERMONKEY_DIR = "./spidermonkey"
NODEJS_DIR = "./nodejs"

#the URL and tag used to clone mozilla central
MOZILLA_CENTRAL_URL = "http://hg.mozilla.org/mozilla-central/"
MOZILLA_CENTRAL_TAG = "AURORA_BASE_20110927"

#the URL for LLVM, Clang, and Compiler RT
LLVM_URL = "http://llvm.org/svn/llvm-project/llvm/tags/RELEASE_32/final/"
CLANG_URL = "http://llvm.org/svn/llvm-project/cfe/tags/RELEASE_32/final/"
COMPILER_RT_URL = "http://llvm.org/svn/llvm-project/compiler-rt/tags/RELEASE_32/final/"

#URL for V8 JavaScript engine
V8_URL = "http://v8.googlecode.com/svn/tags/3.8.4/"

#URL for closure compiler
CLOSURE_COMPILER_URL = "http://closure-compiler.googlecode.com/files/compiler-latest.zip"

#the URL and tag used to clone spidermonkey
SPIDERMONKEY_URL = "http://hg.mozilla.org/mozilla-central/"
SPIDERMONKEY_TAG = "AURORA_BASE_20111220"

#the URL for node.js
NODEJS_URL = "http://nodejs.org/dist/v0.10.3/node-v0.10.3.tar.gz"
