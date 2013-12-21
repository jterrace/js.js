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
    CompileScript : function CompileScript(context, global, source, filename, lineno) {
        var sourcePtr = allocate(intArrayFromString(source), 'i8', ALLOC_STACK);
        filename = allocate(intArrayFromString(filename ? filename : "undefined"), 'i8', ALLOC_STACK);
        lineno = lineno ? lineno : 0;
        var rval = _JS_CompileScript(context, global, sourcePtr, source.length, filename, lineno);
        return rval;
    },
    ExecuteScript : function ExecuteScript(context, global, compiledScript) {
        var rval = allocate(8, 'i8', ALLOC_NORMAL);
        var ok = _JS_ExecuteScript(context, global, compiledScript, rval);
        if (ok == 0) {
            return null;
        }
        return rval;
    },
    ValueToNumber : function ValueToNumber(context, jsval) {
        var rval = allocate(8, 'double', ALLOC_NORMAL);
        ok = _JS_ValueToNumber(context, jsval, rval);
        if (ok == 0) {
            return null;
        }
        return getValue(rval, 'double');
    },
    CreateJSVal : function CreateJSVal(cx, val, type) {
        var jsvalout = allocate(8, 'i32', ALLOC_NORMAL);
        type['toJSVal'](jsvalout, val, cx);
        return jsvalout;
    },
    DefineObject : function DefineObject(context, parent, name, clasp, proto, flags) {
        var nameStr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        return _JS_DefineObject(context, parent, nameStr, clasp, proto, flags);
    },
    NewObject: function NewObject(cx, clasp, proto, parent) {
        return _JS_NewObject(cx, clasp, proto, parent);
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
    SetProperty: function SetProperty(cx, obj, name, vp) {
        var namePtr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        return _JS_SetProperty(cx, obj, namePtr, vp);
    },
    GetProperty: function GetProperty(cx, obj, name) {
        var namePtr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        var rval = allocate(1, 'i8', ALLOC_NORMAL);
        _JS_GetProperty(cx, obj, namePtr, rval);
        return rval;
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
    CreateClass: function(flags, addProperty, delProperty, getProperty, setProperty, enumerate, resolve, convert, finalize) {
        var cls = allocate([0, 0, 0, 0,
                          flags,
                          
                          0, 0, 0, addProperty,
                          0, 0, 0, delProperty,
                          0, 0, 0, getProperty,
                          0, 0, 0, setProperty,
                          0, 0, 0, enumerate,
                          0, 0, 0, resolve,
                          0, 0, 0, convert,
                          0, 0, 0, finalize,
                          
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
                           "*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NORMAL);
        return cls;
    },
    Init : function Init(params) {
        // Creates a new runtime with 8MB of memory
        var rt = JSJS.NewRuntime(8 * 1024 * 1024);
        console.log("rt " + rt);
        var cx = JSJS.NewContext(rt, 8192);
        console.log("cx " + cx);

        // See documentation for explanation -- needed for most scripts
        var JSOPTION_VAROBJFIX = 1 << 2;
        JSJS.SetOptions(cx, JSOPTION_VAROBJFIX);

        // Set the version of JavaScript to 1.85
        var JSVERSION_LATEST = 185;
        JSJS.SetVersion(cx, JSVERSION_LATEST);

        // Set a function that gets called when an error happens
        function errorReporter(cx, message, report) {
            console.log("js.js Script Error (line: " + getValue(report + 4, 'i32') + "): " + Pointer_stringify(message));
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
        
        var global_getter = JSJS['PropertyStub'];
        if (params && 'global_getter' in params) {
            global_getter = params['global_getter'];
        }
        var global_resolver = JSJS['ResolveStub'];
        if (params && 'global_resolver' in params) {
            global_resolver = params['global_resolver'];
        }
        
        var _GLOBAL_CLASS = JSJS.CreateClass(JSJS['JSCLASS_GLOBAL_FLAGS'],
                                                JSJS['PropertyStub'],
                                                JSJS['PropertyStub'],
                                                global_getter,
                                                JSJS['StrictPropertyStub'],
                                                JSJS['EnumerateStub'],
                                                global_resolver,
                                                JSJS['ConvertStub'],
                                                JSJS['FinalizeStub']);
        
        var global = JSJS.NewCompartmentAndGlobalObject(cx, _GLOBAL_CLASS, 0);
        console.log("global " + global);

        // Initializes the standard javascript global objects like Array, Date, etc
        var init_standard = JSJS.InitStandardClasses(cx, global);
        console.log("init standard classes " + init_standard);

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
        if(_JSVAL_IS_STRING(JSJS._0(val), JSJS._1(val))) { // Strings
           var cp = _JSVAL_TO_STRING(JSJS._0(val), JSJS._1(val));
           cp = _JS_GetStringCharsZ(cx, cp); 
           cp = JSJS.parseUTF16(cp);
           return cp;
         }
         else if(_JSVAL_IS_NULL(JSJS._0(val), JSJS._1(val)) || _JSVAL_IS_VOID(JSJS._0(val), JSJS._1(val))) { // Undefs
           return 0;
         }
         else if(_JSVAL_IS_INT(JSJS._0(val), JSJS._1(val))) { // Ints
           return (_JSVAL_TO_INT(JSJS._0(val), JSJS._1(val)));
         } else if(_JSVAL_IS_DOUBLE(JSJS._0(val), JSJS._1(val))) { // Doubles
           return (_JSVAL_TO_DOUBLE(JSJS._0(val), JSJS._1(val)));
         } else if(_JSVAL_IS_BOOLEAN(JSJS._0(val), JSJS._1(val))) { // Boolean
           return _JSVAL_TO_BOOLEAN(JSJS._0(val), JSJS._1(val)) == 1 ? true : false; 
         } else if(_JSVAL_IS_OBJECT(JSJS._0(val), JSJS._1(val))) { // Objects
           return (_JSVAL_TO_OBJECT(JSJS._0(val), JSJS._1(val)));
         }
         return false;
    },
    wrapSetter : function(fnName) {
      function wrappedSetter(cx, obj, idval, strict, vp) {
        var idStr = _JSID_TO_STRING(idval);
        idStr = _JS_GetStringCharsZ(cx, idStr); 
        idStrReal = JSJS.parseUTF16(idStr);

        var val = JSJS.identifyConvertValue(cx, vp);
        
        fnName(cx, obj, idStrReal, strict, val, vp);

        return 1;
      }

      return FUNCTION_TABLE.push(wrappedSetter) - 1;
    },   
    wrapGetter : function(jsFunc, retType) {
      function wrappedGetter(cx, obj, idval, vp) {
        var idStr = _JSID_TO_STRING(idval);
        idStr = _JS_GetStringCharsZ(cx, idStr); 
        idStrReal = JSJS.parseUTF16(idStr);
        var ret = jsFunc(idStrReal);
        if (typeof ret == 'object' && 'type' in ret) {
            if (ret['type'] == null) {
                _memcpy(vp, ret['val'], 8);
            } else {
                ret['type']['toJSVal'](vp, ret['val'], cx);
            }
        } else if (ret != undefined) {
            retType['toJSVal'](vp, ret, cx);
        }
        return 1;
      }

      return FUNCTION_TABLE.push(wrappedGetter) - 1;
    },
    wrapResolver : function(jsFunc) {
        function wrappedResolver(cx, obj, idval) {
          var idStr = _JSID_TO_STRING(idval);
          idStr = _JS_GetStringCharsZ(cx, idStr); 
          idStrReal = JSJS.parseUTF16(idStr);
          return jsFunc(idStrReal);
        }

        return FUNCTION_TABLE.push(wrappedResolver) - 1;
    },
    wrapFunction : function(params) {
        return function wrappedNativeFunction(context, nargs, jsval) {
            var formatStr = "";
            var allocateLengths = [];
            var allocateTypes = [];
            for (i = 0; i < params['args'].length; i++) {
                formatStr += params['args'][i]['formatStr'];
                if ('numRequired' in params && params['numRequired'] == i+1) {
                    formatStr += "/";
                }
                allocateLengths.push(0);
                allocateTypes.push(params['args'][i]['type']);
            }
            var formatStr = allocate(intArrayFromString(formatStr), 'i8', ALLOC_NORMAL);
            var outBuf = allocate(allocateLengths, allocateTypes, ALLOC_NORMAL);
            var variadic = allocate(params['args'].length * 4, 'i32', ALLOC_NORMAL);
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
                returnVals.push(params['args'][i]['fromPtr'](outBufOffset, jsval + 16 + i * 8));
                outBufOffset += params['args'][i]['size'];
            }
            var retVal = params['func'].apply(this, returnVals);
            if (typeof(retVal) == 'object' && retVal != null && 'type' in retVal) {
                retVal['type']['toJSVal'](jsval, retVal['val'], context);
            } else if (params['returns'] == null) {
                _memcpy(jsval, _JSVAL_VOID, 8);
            } else {
                params['returns']['toJSVal'](jsval, retVal, context);
            }
            return 1;
        };
    },
    NewFunction: function NewFunction(cx, wrappedFunc, nargs, name) {
        var namePtr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        var funcPosition = FUNCTION_TABLE.push(wrappedFunc) - 1;
        return _JS_NewFunction(cx, funcPosition, nargs, 0, 0, name);
    },
    CallFunctionName: function CallFunctionName(cx, thisobj, name, argTypes, argVals, returnType) {
        var jsvalArray = 0;
        var numArgs = 0;
        if (argTypes != undefined || argVals != undefined) {
            numArgs = argTypes.length;
            var jsvalArray = allocate(numArgs * 8, 'i32', ALLOC_NORMAL);
            for (i=0; i<numArgs; i++) {
                argTypes[i]['toJSVal'](jsvalArray + i * 8, argVals[i], cx);
            }
        }
        var rval = allocate(8, 'i32', ALLOC_NORMAL);
        var namePtr = allocate(intArrayFromString(name), 'i8', ALLOC_NORMAL);
        var success = _JS_CallFunctionName(cx, thisobj, namePtr, numArgs, jsvalArray, rval);
        if (!success) {
            return null;
        }
        return returnType['fromPtr'](rval);
    },
    CallFunctionValue: function CallFunctionValue(cx, thisobj, fval, argTypes, argVals) {
        var jsvalArray = 0;
        var numArgs = 0;
        if (argTypes != undefined || argVals != undefined) {
            numArgs = argTypes.length;
            var jsvalArray = allocate(numArgs * 8, 'i32', ALLOC_NORMAL);
            for (i=0; i<numArgs; i++) {
                argTypes[i]['toJSVal'](jsvalArray + i * 8, argVals[i], cx);
            }
        }
        var rval = allocate(8, 'i32', ALLOC_NORMAL);
        return _JS_CallFunctionValue(cx, thisobj, fval, numArgs, jsvalArray, rval);
    },
    // Initialize the document element
    // jsObjs: The object returned from JSJS.Init()
    // initLock: the default state of document objects, either 'locked' or 'unlocked'
    InitDocument : function InitDocument(jsObjs, initLock) {
      var __DEBUG = false;
      var docmap = new Array(); // Be able to map backwards from JSObjects to their native counterparts 
  
      var jsjsDocument = JSJS.DefineObject(jsObjs.cx, jsObjs.glob, "document", 0, 0, 0);
      if (!jsjsDocument) {
          return "Creating object failed";
      } 

      // Cookie stuff, the thrower should probably be pulled out as a class variable
      // so that all locked properties can use it
      function thrower(cx,obj,idval,strict,str) {
        throw idval + " is locked, not allowed to access.";        
      }
      var tsn = JSJS.wrapSetter(thrower);

      var cookieLock;
      // Create the cookie property
      if(document.cookieObj) cookieLock = document.cookieObj.jsjsLock;
      else cookieLock = initLock;

      if(cookieLock = 'locked') {
        JSJS.DefineProperty(jsObjs.cx, jsjsDocument, "cookie", 0, tsn, tsn, 0);
      } else {
        // TODO add code to allow cookie to be accessed        
      }

      // Custom Setter
      function set_customInnerHtml(cx,obj,idval,strict,str) {
        var docObj = document.getElementById(docmap[obj]);
          docObj.innerHTML = str; 
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
          docmap[elementObject] = str; 
          //_JS_SetProperty(jsObjs.cx, elementObject, strptr, jsval);
        }

        // return object
        var retVal = 0; 
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
      
      if(__DEBUG) console.log("    Document has been initialized");
      return true;
    },
    // Initialize the window element
    // jsObjs: The object returned from JSJS.Init()
    // initLock: the default state of document objects, either 'locked' or 'unlocked'
    InitWindow: function InitWindow(jsObjs, initLock) {
      var __DEBUG = false;
  
      // Create the window object
      var jsjsWindow= JSJS.DefineObject(jsObjs.cx, jsObjs.glob, "window", 0, 0, 0);
      if (!jsjsWindow) {
          return "Creating object failed";
      } 

      // Create the top object and set as a property of window 
      if(initLock == 'unlocked' || window.top == 'unlocked') 
      {
        var topObj = JSJS.DefineObject(jsObjs.cx, jsjsWindow, "top", 0, 0, 0);

        // Custom Setter for top
        function set_location(cx,obj,idval,strict,str) {
            window.top.location = str; 
        };
        var setterPtr = JSJS.wrapSetter(set_location);

        JSJS.DefineProperty(jsObjs.cx, topObj, "location", 0, 0, setterPtr, 0);
      }
      // else don't even create top and they can't touch it
    
      // Create window.alert
      function customAlert(str) {
        window.alert(str);
      }
            
      var wrappedCustomAlert = JSJS.wrapFunction({
        func: customAlert,
        args: [JSJS.Types.charPtr],
        returns: null
        });
      
      JSJS.DefineFunction(jsObjs.cx, jsjsWindow, "alert", wrappedCustomAlert, 1, 0);      

       // Create window.prompt
      function customPrompt(prom, defText) {
        var ret = window.prompt(prom,defText);
        console.log(Object.prototype.toString.call(ret));
        return ret;
      }
            
      var wrappedCustomPrompt= JSJS.wrapFunction({
        func: customPrompt,
        args: [JSJS.Types.charPtr, JSJS.Types.charPtr],
        returns: JSJS.Types.charPtr 
        });
      
      JSJS.DefineFunction(jsObjs.cx, jsjsWindow, "prompt", wrappedCustomPrompt, 2, 0);

      return true;
    },
    SetLock : function(obj, lck) {
      if(obj instanceof Object) {
        console.log("Changing lock status of object");
        obj.jsjsLock = lck;
      } else if(obj.constructor === String) {
        console.log("Changing lock status of string");
        var str = obj + "Obj = new Object; " + obj + "Obj.jsjsLock = " + lck;
        console.log(str);
        eval(str);
      }

    },
    UnlockElement : function(obj) {
      JSJS.SetLock(obj, 'unlocked');
    },
    LockElement : function(obj) {
      JSJS.SetLock(obj, 'locked');
    },
    _0: function(val) {
        return HEAP32[val >> 2];
    },
    _1: function(val) {
        return HEAP32[val + 4 >> 2];
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
                    var v = getValue(ptr, type);
                    if (type == 'i1') {
                        return (v == 1) ? true : false;
                    }
                    return v;
                };
                this['toPtr'] = function(val) {
                    var ptr = allocate(0, type, ALLOC_NORMAL);
                    setValue(ptr, val, type);
                    return ptr;
                };
                this['toJSVal'] = function(jsval, val) {
                    //console.log('toJSVal');
                    //console.log(jsValFunc);
                    return jsValFunc(jsval, val);
                };
                this['setPtr'] = function(val, ptr) {
                    setValue(ptr, val, type);
                };
            }();
        },
        funcPtr : new function() {
            this['size'] = 4;
            this['formatStr'] = 'f';
            this['toPtr'] = function(func) {
                var funcPosition = FUNCTION_TABLE.push(func) - 1;
                var ptr = allocate(4, 'i32', ALLOC_NORMAL);
                setValue(ptr, funcPosition, 'i32');
            };
            this['setPtr'] = function(val, ptr) {
                var funcPosition = FUNCTION_TABLE.push(val) - 1;
                setValue(ptr, funcPosition, 'i32');
            };
            this['fromPtr'] = function(ptr) {
                return ptr;
            };
            this['toJSVal'] = function(jsval, val, cx) {
                return _OBJECT_TO_JSVAL(jsval, val);
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
            this['toJSVal'] = function(jsval, val, cx) {
                var charStar = allocate(intArrayFromString(val), 'i8', ALLOC_NORMAL);
                var JSStringStar = _JS_NewStringCopyZ(cx, charStar);
                return _STRING_TO_JSVAL(jsval, JSStringStar);
            };
            this['formatStr'] = 'W';
            this['type'] = 'i32';
        },
        objPtr : new function() {
            this['size'] = 4;
            this['formatStr'] = 'o';
            this['toJSVal'] = function(jsval, val) {
              return _OBJECT_TO_JSVAL(jsval, val)
            };
            this['fromPtr'] = function(ptr) {
                return _JSVAL_TO_OBJECT(JSJS._0(ptr), JSJS._1(ptr));
            };
            this['setPtr'] = function(val, ptr) {
                setValue(ptr, val, 'i32');
            };
            this['type'] = 'i32';
        },
        dynamicPtr : new function() {
            this['size'] = 4;
            this['formatStr'] = '*';
            this['type'] = 'i32';
            this['fromPtr'] = function(ptr, origPtr) {
                return origPtr;
            };
        },
        arrayPtr: new function() {
            this['size'] = 4;
            this['toJSVal'] = function(jsval, val, cx) {
                var jsvalArray = 0;
                var numArgs = 0;
                if (val.length > 0) {
                    jsvalArray = allocate(val.length * 8, 'i32', ALLOC_NORMAL);
                }
                for (i=0; i<val.length; i++) {
                    argType = val[i][0];
                    argVal = val[i][1];
                    numArgs++;
                    argType['toJSVal'](jsvalArray + i * 8, argVal, cx);
                }
                var jsObjPtr = _JS_NewArrayObject(cx, numArgs, jsvalArray);
                return _OBJECT_TO_JSVAL(jsval, jsObjPtr);
            };
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
JSJS['CompileScript'] = JSJS.CompileScript;
JSJS['EvaluateScript'] = JSJS.EvaluateScript;
JSJS['ExecuteScript'] = JSJS.ExecuteScript;
JSJS['ValueToNumber'] = JSJS.ValueToNumber;
JSJS['CreateJSVal'] = JSJS.CreateJSVal;
JSJS['DefineObject'] = JSJS.DefineObject;
JSJS['NewObject'] = JSJS.NewObject;
JSJS['DefineFunction'] = JSJS.DefineFunction;
JSJS['DefineProperty'] = JSJS.DefineProperty;
JSJS['SetProperty'] = JSJS.SetProperty;
JSJS['GetProperty'] = JSJS.GetProperty;
JSJS['parseUTF16'] = JSJS.parseUTF16;
JSJS['CreateClass'] = JSJS.CreateClass
JSJS['Init'] = JSJS.Init;
JSJS['End'] = JSJS.End;
JSJS['identifyConvertValue'] = JSJS.identifyConvertValue;
JSJS['wrapFunction'] = JSJS.wrapFunction;
JSJS['wrapGetter'] = JSJS.wrapGetter;
JSJS['wrapSetter'] = JSJS.wrapSetter;
JSJS['wrapResolver'] = JSJS.wrapResolver;
JSJS['NewFunction'] = JSJS.NewFunction;
JSJS['CallFunctionValue'] = JSJS.CallFunctionValue;
JSJS['CallFunctionName'] = JSJS.CallFunctionName;
JSJS['InitDocument'] = JSJS.InitDocument;
JSJS['InitWindow'] = JSJS.InitWindow;
JSJS['SetLock'] = JSJS.SetLock;
JSJS['UnlockElement'] = JSJS.UnlockElement;
JSJS['LockElement'] = JSJS.LockElement;
JSJS['_0'] = JSJS._0;
JSJS['_1'] = JSJS._1;

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
JSJS.Types['objPtr'] = JSJS.Types.objPtr;
JSJS.Types['dynamicPtr'] = JSJS.Types.dynamicPtr;
JSJS.Types['arrayPtr'] = JSJS.Types.arrayPtr;
    
JSJS.Types['bool'] = JSJS.Types.primitive('i1', 'b', __Z16BOOLEAN_TO_JSVALi);
JSJS.Types['i16'] = JSJS.Types.primitive('i16', 'c', __Z12INT_TO_JSVALi);
JSJS.Types['i32'] = JSJS.Types.primitive('i32', 'i', __Z12INT_TO_JSVALi);
JSJS.Types['double'] = JSJS.Types.primitive('double', 'd', __Z15DOUBLE_TO_JSVALd);
JSJS.Types['JSFunctionSpec'] = JSJS.Types.struct(JSJS.Types['charPtr'],
JSJS.Types['funcPtr'], JSJS.Types['i16'], JSJS.Types['i16']);

