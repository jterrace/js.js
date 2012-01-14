var JSJS = {
    NewRuntime : function NewRuntime(maxbytes) {
        return _JS_Init(maxbytes);
    },
    NewContext : function NewContext(runtime, stackChunkSize) {
        return _JS_NewContext(runtime, stackChunkSize)
    },
    DestroyContext : function DestroyContext(context) {
        return _JS_DestroyContext(context);
    },
    DestroyRuntime : function DestroyRuntime(runtime) {
        return _JS_Finish(runtime);
    },
    ShutDown : function ShutDown() {
        return _JS_ShutDown();
    },
    SetOptions : function SetOptions(context, options) {
        return _JS_SetOptions(context, options);
    },
    SetVersion : function SetVersion(context, version) {
        return _JS_SetVersion(context, version);
    },
    SetErrorReporter : function SetErrorReporter(context, errorReporter) {
        var funcPosition = FUNCTION_TABLE.push(errorReporter) - 1;
        return _JS_SetErrorReporter(context, funcPosition);
    },
    NewCompartmentAndGlobalObject : function NewCompartmentAndGlobalObject(
            context, globalClass, principals) {
        return _JS_NewCompartmentAndGlobalObject(context, globalClass,
                principals);
    },
    InitStandardClasses : function InitStandardClasses(context, globalClass) {
        return _JS_InitStandardClasses(context, globalClass);
    },
    EvaluateScript : function EvaluateScript(context, global, source, filename,
            lineno) {
        var sourcePtr = allocate(intArrayFromString(source), 'i8', ALLOC_STACK);
        filename = allocate(intArrayFromString(filename ? filename
                : "undefined"), 'i8', ALLOC_STACK);
        lineno = lineno ? lineno : 0;
        var rval = allocate(8, 'i8', ALLOC_NORMAL);
        var ok = _JS_EvaluateScript(context, global, sourcePtr, source.length,
                filename, lineno, rval);
        if (ok == 0) {
            return null;
        }
        return rval;
    },
    ValueToNumber : function ValueToNumber(context, jsval) {
        var rval = allocate(1, 'double', ALLOC_NORMAL);
        ok = _JS_ValueToNumber(context, jsval, rval);
        if (ok == 0) {
            return null;
        }
        return getValue(rval, 'double');
    },
    DefineObject : function DefineObject(context, parent, name, clasp, proto,
            flags) {
        var nameStr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        return _JS_DefineObject(context, parent, nameStr, clasp, proto, flags);
    },
    DefineFunction : function DefineFunction(context, obj, name, func, nargs,
            flags) {
        var namePtr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        var funcPosition = FUNCTION_TABLE.push(func) - 1;
        return _JS_DefineFunction(context, obj, namePtr, funcPosition, nargs,
                flags);
    },
    parseUTF16 : function parseUTF16(ptr) {
        //FIXME: this assumes ascii
        var str = '';
        var index, c;
        for (index = ptr, c = getValue(index, 'i8'); c != 0; index += 2, c = getValue(
                index, 'i8')) {
            str = str + String.fromCharCode(c);
        }
        return str;
    },
    Init : function Init() {
        // Creates a new runtime with 8MB of memory
        var rt = JSJS.NewRuntime(8 * 1024 * 1024);
        print("rt " + rt);

        var cx = JSJS.NewContext(rt, 8192);
        print("cx " + cx);

        // See documentation for explanation -- needed for most scripts
        var JSOPTION_VAROBJFIX = 1 << 2;
        JSJS.SetOptions(cx, JSOPTION_VAROBJFIX);

        // Set the version of JavaScript to 1.85
        var JSVERSION_LATEST = 185;
        JSJS.SetVersion(cx, JSVERSION_LATEST);

        // Set a function that gets called when an error happens
        function errorReporter(cx, message, report) {
            print("ERROR: " + Pointer_stringify(message));
        }
        JSJS.SetErrorReporter(cx, errorReporter);

        // This creates the "global object" in the interpreter space.
        // __global_class is defined by js/shell.cpp to be a nice, sane default
        var global = JSJS.NewCompartmentAndGlobalObject(cx, _global_class, 0);
        print("global " + global);

        // Initializes the standard javascript global objects like Array, Date, etc
        JSJS.InitStandardClasses(cx, global);

        return {
            rt : rt,
            cx : cx,
            glob : global
        };
    },
    End : function End(jsObjs) {
        JSJS.DestroyContext(jsObjs.cx);
        JSJS.DestroyRuntime(jsObjs.rt);
        JSJS.ShutDown();
    },
    wrapFunction : function(params) {
        return function wrappedNativeFunction(context, nargs, jsval) {
            var formatStr = "";
            var allocateLengths = [];
            var allocateTypes = [];
            for (i = 0; i < params.args.length; i++) {
                formatStr += params.args[i].formatStr;
                allocateLengths.push(1);
                allocateTypes.push(params.args[i].type);
            }
            var formatStr = allocate(intArrayFromString(formatStr), 'i8',
                    ALLOC_NORMAL);
            var outBuf = allocate(allocateLengths, allocateTypes, ALLOC_NORMAL);
            var variadic = allocate(params.args.length, 'i32');
            var outBufOffset = outBuf;
            for (i = 0; i < params.args.length; i++) {
                setValue(variadic + i * 4, outBufOffset, 'i32');
                outBufOffset += params.args[i].size;
            }
            var ok = _JS_ConvertArguments(context, params.args.length,
                    jsval + 16, formatStr, variadic);
            if (!ok) {
                return 0;
            }
            var returnVals = [];
            var outBufOffset = outBuf;
            for (i = 0; i < params.args.length; i++) {
                returnVals.push(params.args[i].fromPtr(outBufOffset));
                outBufOffset += params.args[i].size;
            }
            var retVal = params.func.apply(this, returnVals);
            if (params.returns == null) {
                _memcpy(jsval, _JSVAL_VOID, 8);
            } else {
                params.returns.toJSVal(jsval, retVal);
            }
            return 1;
        };
    },
    Types : {
        primitive : function(type, formatStr, jsValFunc) {
            return new function() {
                this.size = Runtime.getNativeTypeSize(type);
                this.type = type;
                if (formatStr) {
                    this.formatStr = formatStr;
                }
                this.fromPtr = function(ptr) {
                    return getValue(ptr, this.type);
                };
                this.toPtr = function(val) {
                    var ptr = allocate(1, type, ALLOC_NORMAL);
                    setValue(ptr, val, type);
                    return ptr;
                };
                this.toJSVal = function(jsval, val) {
                    return jsValFunc(jsval, val);
                };
                this.setPtr = function(val, ptr) {
                    setValue(ptr, val, type);
                };
            }();
        },
        funcPtr : {
            size : 4,
            toPtr : function(func) {
                var funcPosition = FUNCTION_TABLE.push(func) - 1;
                var ptr = allocate(1, 'i32', ALLOC_NORMAL);
                setValue(ptr, funcPosition, 'i32');
            },
            setPtr : function(val, ptr) {
                var funcPosition = FUNCTION_TABLE.push(val) - 1;
                setValue(ptr, funcPosition, 'i32');
            }
        },
        charPtr : {
            size : 4,
            toPtr : function(str) {
                return allocate(intArrayFromString(str), 'i8', ALLOC_NORMAL);
            },
            setPtr : function(val, ptr) {
                var strPtr = allocate(intArrayFromString(val), 'i8',
                        ALLOC_NORMAL);
                setValue(ptr, strPtr, 'i32');
            },
            fromPtr : function(ptr) {
                var ptrAddr = getValue(ptr, 'i32');
                return JSJS.parseUTF16(ptrAddr);
            },
            formatStr : 'W',
            type : 'i32'
        },
        struct : function() {
            var typeArgs = arguments;
            return new function() {
                this.size = 0;
                for (i = 0; i < typeArgs.length; i++) {
                    this.size += typeArgs[i].size;
                }
                this.toPtr = function() {
                    var valArgs = arguments;
                    var headPtr = allocate(this.size, 'i8', ALLOC_NORMAL);
                    ptr = headPtr;
                    for (i = 0; i < typeArgs.length; i++) {
                        typeArgs[i].setPtr(valArgs[i], ptr);
                        ptr += typeArgs[i].size;
                    }
                    return headPtr;
                };
            }();
        },
    },
};

JSJS.Types.bool = JSJS.Types.primitive('i1', 'b', _BOOLEAN_TO_JSVAL);
JSJS.Types.i16 = JSJS.Types.primitive('i16', 'c', _INT_TO_JSVAL);
JSJS.Types.i32 = JSJS.Types.primitive('i32', 'i', _INT_TO_JSVAL);
JSJS.Types['double'] = JSJS.Types.primitive('double', 'd', _DOUBLE_TO_JSVAL);
JSJS.Types.JSFunctionSpec = JSJS.Types.struct(JSJS.Types.charPtr,
        JSJS.Types.funcPtr, JSJS.Types.i16, JSJS.Types.i16);
