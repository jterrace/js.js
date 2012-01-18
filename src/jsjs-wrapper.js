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
    NewCompartmentAndGlobalObject : function NewCompartmentAndGlobalObject(context, globalClass, principals) {
        return _JS_NewCompartmentAndGlobalObject(context, globalClass, principals);
    },
    InitStandardClasses : function InitStandardClasses(context, globalClass) {
        return _JS_InitStandardClasses(context, globalClass);
    },
    EvaluateScript : function EvaluateScript(context, global, source, filename, lineno) {
        var sourcePtr = allocate(intArrayFromString(source), 'i8', ALLOC_STACK);
        filename = allocate(intArrayFromString(filename ? filename : "undefined"), 'i8', ALLOC_STACK);
        lineno = lineno ? lineno : 0;
        var rval = allocate(8, 'i8', ALLOC_NORMAL);
        var ok = _JS_EvaluateScript(context, global, sourcePtr, source.length, filename, lineno, rval);
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
    DefineObject : function DefineObject(context, parent, name, clasp, proto, flags) {
        var nameStr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        return _JS_DefineObject(context, parent, nameStr, clasp, proto, flags);
    },
    DefineFunction : function DefineFunction(context, obj, name, func, nargs, flags) {
        var namePtr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        var funcPosition = FUNCTION_TABLE.push(func) - 1;
        return _JS_DefineFunction(context, obj, namePtr, funcPosition, nargs, flags);
    },
    DefineProperty : function DefineProperty(cx, obj, name, initial, getter, setter, attrs) {
        var namePtr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        return _JS_DefineProperty(cx, obj, namePtr, initial, getter, setter, attrs);
    },
    parseUTF16 : function parseUTF16(ptr) {
        //FIXME: this assumes ascii
        var str = '';
        var index, c;
        for (index = ptr, c = getValue(index, 'i8'); c != 0; index += 2, c = getValue(index, 'i8')) {
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

        /* This creates the "global object" in the interpreter space.
         * _GLOBAL_CLASS is copied from the global class used in js/shell.cpp
         * 
         * It should in theory be this:
         * 
         *   static JSClass global_class = {
         *       NULL, JSCLASS_GLOBAL_FLAGS,
         *       JS_PropertyStub, JS_PropertyStub, JS_PropertyStub, JS_StrictPropertyStub,
         *       JS_EnumerateStub, JS_ResolveStub, JS_ConvertStub, JS_FinalizeStub,
         *       JSCLASS_NO_OPTIONAL_MEMBERS
         *   };
         */
        
        var _GLOBAL_CLASS = allocate([0, 0, 0, 0,
                                 JSJS['JSCLASS_GLOBAL_FLAGS'],
                                 
                                 0, 0, 0, JSJS['PropertyStub'],
                                 0, 0, 0, JSJS['PropertyStub'],
                                 0, 0, 0, JSJS['PropertyStub'],
                                 0, 0, 0, JSJS['StrictPropertyStub'],
                                 0, 0, 0, JSJS['EnumerateStub'],
                                 0, 0, 0, JSJS['ResolveStub'],
                                 0, 0, 0, JSJS['ConvertStub'],
                                 0, 0, 0, JSJS['FinalizeStub'],
                                 
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                 
                                 ["*",0,0,0,
                                  "i32",0,0,0,
                                  
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  "*",0,0,0,
                                  
                                  "*",0,0,0,"*",0,0,0,
                                  "*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,
                                  "*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,
                                  "*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,
                                  "*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,
                                  "*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,
                                  "*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_STATIC);
        
        var global = JSJS.NewCompartmentAndGlobalObject(cx, _GLOBAL_CLASS, 0);
        print("global " + global);

        // Initializes the standard javascript global objects like Array, Date, etc
        JSJS.InitStandardClasses(cx, global);

        return {
            'rt' : rt,
            'cx' : cx,
            'glob' : global
        };
    },
    End : function End(jsObjs) {
        JSJS.DestroyContext(jsObjs['cx']);
        JSJS.DestroyRuntime(jsObjs['rt']);
        JSJS.ShutDown();
    },
    // Give this function a jsval and it will return the real thing back to you
    identifyConvertValue : function identifyConvertValue(cx, val) {
        if(_JSVAL_IS_STRING(val)) { // Strings
           var cp = _JSVAL_TO_STRING(val);
           cp = _JS_GetStringCharsZ(cx, cp); 
           cp = JSJS.parseUTF16(cp);
           return cp;
         }
         else if(_JSVAL_IS_NULL(val) || _JSVAL_IS_VOID(val)) { // Undefs
           return 0;
         }
         else if(_JSVAL_IS_INT(val)) { // Ints
           return (_JSVAL_TO_INT(val));
         } else if(_JSVAL_IS_DOUBLE(val)) { // Doubles 
           return (_JSVAL_TO_DOUBLE(val));
         } else if(_JSVAL_IS_BOOLEAN(val)) { // Boolean
           return (_JSVAL_TO_BOOLEAN(val)) 
         } else if(_JSVAL_IS_OBJECT(val)) { // Objects
           return (_JSVAL_TO_OBJECT(val))
         }
         return false;
    },
    wrapSetter : function(fnName) {
      function wrappedSetter(cx, obj, idval, strict, vp) {
        var idStr = _JSID_TO_STRING(idval);
        idStr = _JS_GetStringCharsZ(cx, idStr); 
        idStrReal = JSJS.parseUTF16(idStr);

        var val = JSJS.identifyConvertValue(cx, vp);
        
        fnName(cx, obj, idStrReal, strict, val);

        return 1;
      }

      return FUNCTION_TABLE.push(wrappedSetter) - 1;
    },   
    wrapGetter : function(fnName) {
      function wrappedSetter(cx, obj, idval, vp) {
        var idStr = _JSID_TO_STRING(idval);
        idStr = _JS_GetStringCharsZ(cx, idStr); 
        idStrReal = JSJS.parseUTF16(idStr);

        var val = JSJS.identifyConvertValue(cx, vp);
        
        fnName(cx, obj, idStrReal, val);

        return 1;
      }

      return FUNCTION_TABLE.push(wrappedSetter) - 1;
      
    },
    wrapFunction : function(params) {
        return function wrappedNativeFunction(context, nargs, jsval) {
            var formatStr = "";
            var allocateLengths = [];
            var allocateTypes = [];
            for (i = 0; i < params['args'].length; i++) {
                formatStr += params['args'][i]['formatStr'];
                allocateLengths.push(1);
                allocateTypes.push(params['args'][i]['type']);
            }
            var formatStr = allocate(intArrayFromString(formatStr), 'i8', ALLOC_NORMAL);
            var outBuf = allocate(allocateLengths, allocateTypes, ALLOC_NORMAL);
            var variadic = allocate(params['args'].length, 'i32');
            var outBufOffset = outBuf;
            for (i = 0; i < params['args'].length; i++) {
                setValue(variadic + i * 4, outBufOffset, 'i32');
                outBufOffset += params['args'][i]['size'];
            }
            var ok = _JS_ConvertArguments(context, params['args'].length, jsval + 16, formatStr, variadic);
            if (!ok) {
                return 0;
            }
            var returnVals = [];
            var outBufOffset = outBuf;
            for (i = 0; i < params['args'].length; i++) {
                returnVals.push(params['args'][i]['fromPtr'](outBufOffset));
                outBufOffset += params['args'][i]['size'];
            }
            var retVal = params['func'].apply(this, returnVals);
            if (params['returns'] == null) {
                _memcpy(jsval, _JSVAL_VOID, 8);
            } else {
                params['returns']['toJSVal'](jsval, retVal);
            }
            return 1;
        };
    },
    // Initialize the document element
    // jsObjs: The object returned from JSJS.Init()
    // initLock: the default state of document objects, either 'locked' or 'unlocked'
    InitDocument : function InitDocument(jsObjs, initLock) {
      var __DEBUG = false;
      var map = new Array(); // Be able to map backwards from the JSObject to the real one
  
      jsjsDocument = JSJS.DefineObject(jsObjs.cx, jsObjs.glob, "document", 0, 0, 0);
      if (!jsjsDocument) {
          return "Creating object failed";
      } 

      // Custom Setter
      function set_customInnerHtml(cx,obj,idval,strict,str) {
        var docObj = document.getElementById(map[obj]);
        //if(docObj.jsjsLock == 'unlocked') {
          docObj.innerHTML = str; 
        /*} else {
          console.log("ALERT: Attempt to access locked object " + docObj.id);
        }*/
      };
      
      //Wrap the setter and define the property
      var setterPtr = JSJS.wrapSetter(set_customInnerHtml);

      function customGetElement(str) {
        if(__DEBUG) console.log("Calling get element for " + str + " (should see me twice)");
        var docObj = document.getElementById(str);
        if(!(docObj.jsjs)) 
        {
          if(__DEBUG) console.log("Creating the element for " + str + " (should only see me once)");
          // create the object
          var elementObject = JSJS.DefineObject(jsObjs.cx, jsjsDocument, str, 0, 0, 0);

          // create innerHTML property and assign setter 
          var ok=JSJS.DefineProperty(jsObjs.cx, elementObject, "innerHTML", 0, 0, setterPtr, 0);
          
          // map the object
          docObj.jsjs = elementObject;
          if(!docObj.jsjsLock) docObj.jsjsLock = initLock;
          var strptr = allocate(intArrayFromString("innerHTML"), 'i8', ALLOC_NORMAL);
          var jsval = _INT_TO_JSVAL(42);
          map[elementObject] = str; 
          //_JS_SetProperty(jsObjs.cx, elementObject, strptr, jsval);
        }

        // return object
        var retVal = _JSVAL_NULL; 
        if(docObj.jsjsLock == 'unlocked') retVal = docObj.jsjs;
        return retVal;
      }

      // Wrap customGetElement
      var wrappedCustomElement = JSJS.wrapFunction({
        func: customGetElement,
        args: [JSJS.Types.charPtr],
        returns: JSJS.Types.objPtr});
      
      JSJS.DefineFunction(jsObjs.cx, jsjsDocument, "getElementById", 
          wrappedCustomElement, 1, 0);      
      
      return true;
    },
    UnlockElement : function(obj) {
      obj.jsjsLock = 'unlocked';
    },
    LockElement : function(obj) {
      obj.jsjsLock = 'locked';
    },

    Types : {
        primitive : function(type, formatStr, jsValFunc) {
            return new function() {
                this['size'] = Runtime.getNativeTypeSize(type);
                this['type'] = type;
                if (formatStr) {
                    this['formatStr'] = formatStr;
                }
                this['fromPtr'] = function(ptr) {
                    return getValue(ptr, type);
                };
                this['toPtr'] = function(val) {
                    var ptr = allocate(1, type, ALLOC_NORMAL);
                    setValue(ptr, val, type);
                    return ptr;
                };
                this['toJSVal'] = function(jsval, val) {
                    return jsValFunc(jsval, val);
                };
                this['setPtr'] = function(val, ptr) {
                    setValue(ptr, val, type);
                };
            }();
        },
        funcPtr : new function() {
            this['size'] = 4;
            this['toPtr'] = function(func) {
                var funcPosition = FUNCTION_TABLE.push(func) - 1;
                var ptr = allocate(1, 'i32', ALLOC_NORMAL);
                setValue(ptr, funcPosition, 'i32');
            };
            this['setPtr'] = function(val, ptr) {
                var funcPosition = FUNCTION_TABLE.push(val) - 1;
                setValue(ptr, funcPosition, 'i32');
            };
        },
        charPtr : new function() {
            this['size'] = 4;
            this['toPtr'] = function(str) {
                return allocate(intArrayFromString(str), 'i8', ALLOC_NORMAL);
            };
            this['setPtr'] = function(val, ptr) {
                var strPtr = allocate(intArrayFromString(val), 'i8', ALLOC_NORMAL);
                setValue(ptr, strPtr, 'i32');
            };
            this['fromPtr'] = function(ptr) {
                var ptrAddr = getValue(ptr, 'i32');
                return JSJS.parseUTF16(ptrAddr);
            };
            this['formatStr'] = 'W';
            this['type'] = 'i32';
        },
        objPtr : new function() {
            this['size'] = 4;
            this['toJSVal'] = function(jsval, val) {
              return _OBJECT_TO_JSVAL(jsval, val)
            }
        },
        struct : function() {
            var typeArgs = arguments;
            return new function() {
                var size = 0;
                for (i = 0; i < typeArgs.length; i++) {
                    size += typeArgs[i]['size'];
                }
                this['size'] = size;
                this['toPtr'] = function() {
                    var valArgs = arguments;
                    var headPtr = allocate(size, 'i8', ALLOC_NORMAL);
                    ptr = headPtr;
                    for (i = 0; i < typeArgs.length; i++) {
                        typeArgs[i].setPtr(valArgs[i], ptr);
                        ptr += typeArgs[i]['size'];
                    }
                    return headPtr;
                };
            }();
        }
    }
};

/* Exports for closure compiler */
window['JSJS'] = JSJS;

JSJS['NewRuntime'] = JSJS.NewRuntime;
JSJS['NewContext'] = JSJS.NewContext;
JSJS['DestroyContext'] = JSJS.DestroyContext;
JSJS['DestroyRuntime'] = JSJS.DestroyRuntime;
JSJS['ShutDown'] = JSJS.ShutDown;
JSJS['SetOptions'] = JSJS.SetOptions;
JSJS['SetVersion'] = JSJS.SetVersion;
JSJS['SetErrorReporter'] = JSJS.SetErrorReporter;
JSJS['NewCompartmentAndGlobalObject'] = JSJS.NewCompartmentAndGlobalObject;
JSJS['InitStandardClasses'] = JSJS.InitStandardClasses;
JSJS['EvaluateScript'] = JSJS.EvaluateScript;
JSJS['ValueToNumber'] = JSJS.ValueToNumber;
JSJS['DefineObject'] = JSJS.DefineObject;
JSJS['DefineFunction'] = JSJS.DefineFunction;
JSJS['parseUTF16'] = JSJS.parseUTF16;
JSJS['Init'] = JSJS.Init;
JSJS['End'] = JSJS.End;
JSJS['wrapFunction'] = JSJS.wrapFunction;

JSJS['JSCLASS_GLOBAL_FLAGS'] = 292613;
JSJS['PropertyStub'] = FUNCTION_TABLE.indexOf(_JS_PropertyStub);
JSJS['StrictPropertyStub'] = FUNCTION_TABLE.indexOf(_JS_StrictPropertyStub);
JSJS['EnumerateStub'] = FUNCTION_TABLE.indexOf(_JS_EnumerateStub);
JSJS['ResolveStub'] = FUNCTION_TABLE.indexOf(_JS_ResolveStub);
JSJS['ConvertStub'] = FUNCTION_TABLE.indexOf(_JS_ConvertStub);
JSJS['FinalizeStub'] = FUNCTION_TABLE.indexOf(_JS_FinalizeStub);

JSJS['Types'] = JSJS.Types;

JSJS.Types['primitive'] = JSJS.Types.primitive;
JSJS.Types['funcPtr'] = JSJS.Types.funcPtr;
JSJS.Types['charPtr'] = JSJS.Types.charPtr;
JSJS.Types['struct'] = JSJS.Types.struct;
    
JSJS.Types['bool'] = JSJS.Types.primitive('i1', 'b', _BOOLEAN_TO_JSVAL);
JSJS.Types['i16'] = JSJS.Types.primitive('i16', 'c', _INT_TO_JSVAL);
JSJS.Types['i32'] = JSJS.Types.primitive('i32', 'i', _INT_TO_JSVAL);
JSJS.Types['double'] = JSJS.Types.primitive('double', 'd', _DOUBLE_TO_JSVAL);
JSJS.Types['JSFunctionSpec'] = JSJS.Types.struct(JSJS.Types['charPtr'],
        JSJS.Types['funcPtr'], JSJS.Types['i16'], JSJS.Types['i16']);
