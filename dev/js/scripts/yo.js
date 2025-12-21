


/**
 * Yo, the single page dependency management script created by pocketninja for his own amusement
 * version 2.0.0
 *
 * @module Yo
 * @returns {object} public functions
 */
function Yo() {
  "use strict";

  var version = '2.0.0';

  // Yo.loadedState.tooltip.{
  //    loaded: boolean
  //    loadedFunc: function
  //    dependedBy: [string],
  //    dependencies: [string]
  // }



  /**
   * container of the namespace object provided by the user with Yo.init()
   * @private
   * @var {object} ns
   */
  var ns;
  var scriptRoot = 'modules';



  /**
   * Counter for items added for debugging output
   * @private
   * @var {number} totalScriptsAdded
   */
  var totalScriptsAdded = 0;



  /**
   * Counter for items loaded for debugging output
   * @private
   * @var {number} totalScriptsLoaded
   */
  var totalScriptsLoaded = 0;

  /**
   * After creating Yo you need to provide it with your main namespace to any level within it. Like "company" or "company.cool.scripts"
   *
   * @method init
   * @param {Object} data - initial organisation data object
   * @param {String} data.namespace - where all of your scripts go in the organisation data object
   * @param {Boolean} data.debugMode - for outputting scripts and connection when they happen
   * @param {Array} data.debugScripts - choose which scripts you want to output data on
   *
   * @example
   * Yo.init({
   *   namespace: your.script.name.space,
   *   scriptRoot: 'cheese'
   *   debugMode: true,
   *   debugScripts: ['scriptOne', 'scriptTwo']
   * });
   */
  var init = function(data){
    ns = data.namespace || Yo;
    Yo.loadedState = {};
    if(data.scriptRoot) {
      scriptRoot = data.scriptRoot;
    }
    ns[scriptRoot] = ns[scriptRoot] || {};
    ns.debugMode = data.debugMode || false;
    ns.debugScripts = data.debugScripts || undefined;

    if(ns.debugMode) {
      Yo.loadOrder = [];
    }

    // global dependencies will be added to all
    // scripts by default unless specified
    ns.globalDependencies = data.globalDependencies || undefined;
  };

  var isDebugScriptsEmpty = function() {
    return isTypeOf('Array', ns.debugScripts) && ns.debugScripts.length < 1;
  };

  var renderLogOrDebugScript = function(str, fn) {
    if(ns.debugMode) {
      if(ns.debugScripts === undefined || isDebugScriptsEmpty()) {
        fn(str);
      }
      else if(!isDebugScriptsEmpty()) {
        ns.debugScripts.forEach(function(scriptItem) {
          if(str.search(scriptItem) > -1) {
            fn(str);
          }
        });
      }
    }
  };

  var log = function(str) {
    renderLogOrDebugScript(str, function() {
      console.log(str);
    });
  };

  var isTypeOf = function(str, obj) {
    return '[object ' + str + ']' === Object.prototype.toString.call(obj);
  };



  /**
   * Arguments checker
   *
   * Take an array of arguments and compare it's type with an array sequence of
   * strings type values.
   *
   * @method argumentChecker
   * @param {Array} args List of arguments
   * @param {Array} argSequence List of String argument types
   *
   * @returns {boolean} based on the arguments list being correct
   *
   */
  var argumentChecker = function(args, argSequence) {
    if(args.length === argSequence.length) {
      var i, val;
      for (i = 0; i < args.length; i++) {
        val = args[i];
        if (!isTypeOf(argSequence[i], val)) {
          log('Error with value comparison: ' + val + ', EXPECTED: ' + argSequence[i]);
          return false;
        }
      }

      return true;
    }
    else {
      return false;
    }
  };

  var arrayClone = function(arr) {
    return arr.slice(0);
  };

  var extend = function() {
    for(var i=1; i < arguments.length; i++) {
      for(var key in arguments[i]) {
        if(arguments[i].hasOwnProperty(key)) {
          arguments[0][key] = arguments[i][key];
        }
      }
    }
    return arguments[0];
  };

  /**
   * Gets either an object or false
   *
   * @method nsGet
   * @param {string} _nsStr Script namespace or name
   * @param {object} _nsObject Namespace object
   * @param {boolean} _getObjectRoot What does this mean !!!?
   *
   * @returns {Boolean} if the object namespace does'nt exist
   * @returns {Object} of the namespace requested
   *
   */
  var nsGet = function(_nsStr, _nsObject, _getObjectRoot) {
    var keyArr;

    if (isTypeOf('Array', _nsStr)) {
      keyArr = _nsStr[1].split('.');
    } else {
      keyArr = _nsStr.split('.');
    }

    var currentObj = _nsObject;
    _getObjectRoot = _getObjectRoot || false;

    for(var i = 0; i < keyArr.length; i++) {
      if (!currentObj[keyArr[i]]) {
        return false;
      }
      if(_getObjectRoot && (i === keyArr.length - 1)) {
        return currentObj;
      }
      currentObj = currentObj[keyArr[i]];
    }

    return currentObj;
  };



  /**
   * Set new branches to your namespace tree
   * WIll run through the object tree creating
   * everything that doesn't exist.
   *
   * @method nsSet
   * @param {string} _nsStr Script namespace or name
   * @param {object} _nsObject Namespace object
   * @param {boolean} _getObjectRoot What does this mean, find out?!?!?
   *
   * @returns {object} Section of the object param
   *
   */
  var nsSet = function(_nsStr, _nsObject, _getObjectRoot) {
    var keyArr;

    if (isTypeOf('Array', _nsStr)) {
      keyArr = _nsStr[1].split('.');
    } else {
      keyArr = _nsStr.split('.');
    }

    var currentObj = _nsObject;
    _getObjectRoot = _getObjectRoot || false;

    if (keyArr.length < 2) {
      if(!currentObj[_nsStr]) {
        currentObj[_nsStr] = {};
      }
      if(_getObjectRoot) {
        return _nsObject;
      }
      return currentObj[_nsStr];
    }
    else {
      for(var i = 0; i < keyArr.length; i++) {
        if (!currentObj[keyArr[i]]) {
          currentObj[keyArr[i]] = {};
        }
        if(_getObjectRoot && (i === keyArr.length - 1)) {
          return currentObj;
        }
        currentObj = currentObj[keyArr[i]];
      }
    }

    return currentObj;
  };



  /**
   * For adding new scripts with their own dependencies
   *
   * @method add
   * @param {string} scriptName Script name
   * @param {Array} [scriptDependencies=undefined] Script list of dependencies
   * @param {function} scriptCallback Script module callback
   *
   * @example
   * Yo.add('WidgetName', ['dependency1', 'dependency2', 'etc'], function() {
   *   // your code in here
   *   return {}
   * });
   */
  var add = function() {

    var scriptName;
    var scriptDependencies = [];
    var scriptCallback;
    var hasNoDependencies = true;

    var getLoadedState = function(_script) {
      return nsGet(_script, Yo.loadedState);
    };

    var setLoadedState = function(_script, _data) {
      extend(nsSet(_script, Yo.loadedState), _data);
    };

    var activateScript = function(_script) {
      var nsLocation = nsSet(_script, ns[scriptRoot], true);
      var lastNameSpace = _script.split('.');
      lastNameSpace = lastNameSpace[lastNameSpace.length - 1];

      if(getLoadedState(_script).loaded) {
        nsLocation[lastNameSpace] = getLoadedState(_script).loadedFunc();

        // Debugging Section
        totalScriptsLoaded += 1;
        log('YO.LOADED: ' + _script);
        renderLogOrDebugScript(_script, function() {
          Yo.loadOrder.push(_script);
        });
        log('scripts ADDED: ' + totalScriptsAdded + ', LOADED: ' + totalScriptsLoaded);

        // After script activation, run the final
        // function activating any dependedBy scripts
        // if this is the last script in its list.
        getLoadedState(_script).runAfterActivation();
      }
    };

    var getScript = function(_script) {
      return nsSet(_script, ns[scriptRoot]);
    };

    var createOrEditLoadedState = function(_data, _script) {
      _script = _script || scriptName;

      setLoadedState(_script, extend({
        loaded: false,
        loadedFunc: function(){},
        runAfterActivation: function(){},
        dependedBy: [],
        dependencies: []
      }, nsSet(_script, Yo.loadedState) || {}, _data));
    };

    /**
     * Callback added to loadState[scriptName].loadedFunc which is run once all of it's dependencies have loaded
     *
     * @function pushFunction
     * @private
     */
    var pushFunction = function() {
      createOrEditLoadedState({
        loaded: true,
        loadedFunc: function() {
          log(scriptName + ' called and already loaded');
        }
      });

      var obj = {};

      objectToArray(scriptDependencies).map(function(_scriptName) {
        obj[_scriptName[0]] = getScript(_scriptName[1]);
      });

      return scriptCallback.apply(null, [obj]);

      // return scriptCallback.apply(null, scriptDependencies.map(function(_scriptName) {
      //   return getScript(_scriptName);
      // }));
    };


    var checkDependedBy = function() {
      var dependedBy = getLoadedState(scriptName).dependedBy;
      var otherScript;

      // Loop through dependedBy list
      for(var i = 0; i < dependedBy.length; i++) {
        otherScript = dependedBy[i];

        // Each dependedBy has a dependency list, so this removes
        // the current script from it's array and then removes the
        // dependency from the current script dependedBy
        for(var a = 0; a < getLoadedState(otherScript).dependencies.length; a++) {
          if (getLoadedState(otherScript).dependencies[a][1] === scriptName) {
            getLoadedState(otherScript).dependencies.splice(a, 1);
            dependedBy.splice(i, 1);
            i--;
            log('DEPENDENCY: ' + otherScript + ' dependent on ' + scriptName);
            break;
          }
        }

        if (getLoadedState(otherScript).dependencies.length < 1) {
          getLoadedState(otherScript).loaded = true;
          activateScript(otherScript);
        }
      }
    };


    var checkDependencies = function() {
      var allDependenciesLoaded = true;
      var scriptDependents = getLoadedState(scriptName).dependencies;
      var dependencyScript;
      var dependencyScriptName;

      log('SCRIPTS: ' + scriptName + ' dependent on [' + scriptDependents.toString() + ']');

      for(var i = 0; i < scriptDependents.length; i++) {
        dependencyScript = scriptDependents[i];
        dependencyScriptName = dependencyScript[1];

        // If script name loadState doesn't
        // exist then create one
        if(!nsGet(dependencyScriptName, Yo.loadedState)) {
          createOrEditLoadedState({}, dependencyScriptName);
        }

        if(!getLoadedState(dependencyScriptName).loaded) {
          getLoadedState(dependencyScriptName).dependedBy.push(scriptName);
          allDependenciesLoaded = false;
        }
        else {
          scriptDependents.splice(i, 1);
          i--;
        }
      }

      if(allDependenciesLoaded) {
        getLoadedState(scriptName).loaded = true;
      }
    };

    var hasFunction = true;

    var objectHasValue = function (obj, value) {
      var keys = Object.keys(obj);

      for (var i = 0; i < keys.length; i += 1) {
        if (obj[keys[i]] === value) {
          return true;
        }
      }

      return false;
    };

    var objectIsEmpty = function (obj) {
      return Object.keys(obj).length < 1;
    };

    var objectToArray = function (obj) {
      var keys = Object.keys(obj);
      var returnList = [];

      for (var i = 0; i < keys.length; i += 1) {
        returnList.push([keys[i], obj[keys[i]]]);
      }

      return returnList;
    };

    if(argumentChecker(arguments, ['String', 'Object', 'Function'])) {
      scriptName = arguments[0];
      scriptDependencies = arguments[1];

      if (ns.globalDependencies) {
        scriptDependencies = extend({}, scriptDependencies, ns.globalDependencies);
      }
      // scriptDependencies = arguments[1];
      scriptCallback = arguments[2];
      hasNoDependencies = objectIsEmpty(scriptDependencies);
    }
    else if(argumentChecker(arguments, ['String', 'Function'])) {
      scriptName = arguments[0];
      scriptCallback = arguments[1];
      // This uses global dependencies now
      if (ns.globalDependencies !== undefined && !objectHasValue(ns.globalDependencies, scriptName)) {
        scriptDependencies = extend({}, ns.globalDependencies);
        hasNoDependencies = objectIsEmpty(scriptDependencies);
      }
    }
    else if(argumentChecker(arguments, ['String'])) {
      // For window global vars to activate other scripts
      scriptName = arguments[0];
      hasFunction = false;
    }
    else {
      log('incorrect params added', arguments);
      return false;
    }

    log('YO.ADD: ' + scriptName);
    totalScriptsAdded += 1;

    if (hasNoDependencies) {
      createOrEditLoadedState({
        loaded: true,
        loadedFunc: scriptCallback
      });

      if (hasFunction) {
        activateScript(scriptName);
      }

      checkDependedBy();
    }
    else {
      createOrEditLoadedState({
        loadedFunc: pushFunction,
        dependencies: objectToArray(scriptDependencies),
        runAfterActivation: function() {
          checkDependedBy();
        }
      });
      checkDependencies();
      activateScript(scriptName);
    }
  };



  return {
    add: add,
    argumentChecker: argumentChecker,
    arrayClone: arrayClone,
    extend: extend,
    init: init,
    isTypeOf: isTypeOf,
    version: version
  }
}
