


/**
 * Yo, the single page dependency management script created by pocketninja for his own amusement
 * version 2.0.1
 *
 * @module Yo
 * @returns {object} public functions
 */
function Yo() {
  "use strict";

  const version = '2.0.1';

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
  let ns;
  let scriptRoot = 'modules';

  /**
   * Counter for items added for debugging output
   * @private
   * @var {number} totalScriptsAdded
   */
  let totalScriptsAdded = 0;

  /**
   * Counter for items loaded for debugging output
   * @private
   * @var {number} totalScriptsLoaded
   */
  let totalScriptsLoaded = 0;

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
  const init = function(data){
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

  const isDebugScriptsEmpty = function() {
    return isTypeOf('Array', ns.debugScripts) && ns.debugScripts.length < 1;
  };

  const renderLogOrDebugScript = function(str, fn) {
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

  const log = function(str) {
    renderLogOrDebugScript(str, function() {
      console.log(str);
    });
  };

  const isTypeOf = function(str, obj) {
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
  const argumentChecker = function(args, argSequence) {
    if(args.length === argSequence.length) {
      let i, val;
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

  const arrayClone = function(arr) {
    return arr.slice(0);
  };

  const extend = function() {
    for(let i=1; i < arguments.length; i++) {
      for(let key in arguments[i]) {
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
  const nsGet = function(_nsStr, _nsObject, _getObjectRoot) {
    let keyArr;

    if (isTypeOf('Array', _nsStr)) {
      keyArr = _nsStr[1].split('.');
    }
    else {
      keyArr = _nsStr.split('.');
    }

    let currentObj = _nsObject;
    _getObjectRoot = _getObjectRoot || false;

    for(let i = 0; i < keyArr.length; i++) {
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
  const nsSet = function(_nsStr, _nsObject, _getObjectRoot) {
    let keyArr;

    if (isTypeOf('Array', _nsStr)) {
      keyArr = _nsStr[1].split('.');
    }
    else {
      keyArr = _nsStr.split('.');
    }

    let currentObj = _nsObject;
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
      for(let i = 0; i < keyArr.length; i++) {
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



  const load = function(resource) {
    // resource can be:
    // - .js file → loads as <script>
    // - .css file → loads as <link rel="stylesheet">
    // - any other URL → loads as <script> by default

    const isCss = /\.css$/i.test(resource);

    // Shared cache (prevents double loading)
    load.cache = load.cache || new Map();

    if (load.cache.has(resource)) {
      const entry = load.cache.get(resource);
      if (entry.loaded) {
        return Promise.resolve();
      }
      // Still loading → wait for it
      return new Promise(resolve => {
        entry.callbacks.push(resolve);
      });
    }

    // New load
    const entry = {
      loaded: false,
      callbacks: []
    };
    load.cache.set(resource, entry);

    return new Promise((resolve, reject) => {
      let el;

      if (isCss) {
        el = document.createElement('link');
        el.rel = 'stylesheet';
        el.href = resource;
      } else {
        el = document.createElement('script');
        el.src = resource;
        el.async = true;
      }

      el.onload = () => {
        entry.loaded = true;
        resolve();
        // Run all waiting callbacks
        entry.callbacks.forEach(cb => cb());
        entry.callbacks = []; // clean up
        if (ns?.debugMode) {
          log(`YO.LOAD success: ${resource} (${isCss ? 'CSS' : 'JS'})`);
        }
      };

      el.onerror = (err) => {
        load.cache.delete(resource);
        reject(err);
        if (ns?.debugMode) {
          log(`YO.LOAD failed: ${resource}`);
        }
      };

      document.head.appendChild(el);

      if (ns?.debugMode) {
        log(`YO.LOAD started: ${resource}`);
      }
    });
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
  const add = function() {

    let scriptName;
    let scriptDependencies = [];
    let scriptCallback;
    let hasNoDependencies = true;

    const getLoadedState = function(_script) {
      return nsGet(_script, Yo.loadedState);
    };

    const setLoadedState = function(_script, _data) {
      extend(nsSet(_script, Yo.loadedState), _data);
    };

    const activateScript = function(_script) {
      const nsLocation = nsSet(_script, ns[scriptRoot], true);
      let lastNameSpace = _script.split('.');
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

    const getScript = function(_script) {
      return nsSet(_script, ns[scriptRoot]);
    };

    const createOrEditLoadedState = function(_data, _script) {
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
    const pushFunction = function() {
      createOrEditLoadedState({
        loaded: true,
        loadedFunc: function() {
          log(scriptName + ' called and already loaded');
        }
      });

      const obj = {};

      objectToArray(scriptDependencies).map(function(_scriptName) {
        obj[_scriptName[0]] = getScript(_scriptName[1]);
      });

      return scriptCallback.apply(null, [obj]);

      // return scriptCallback.apply(null, scriptDependencies.map(function(_scriptName) {
      //   return getScript(_scriptName);
      // }));
    };


    const checkDependedBy = function() {
      const dependedBy = getLoadedState(scriptName).dependedBy;
      let otherScript;

      // Loop through dependedBy list
      for(let i = 0; i < dependedBy.length; i++) {
        otherScript = dependedBy[i];

        // Each dependedBy has a dependency list, so this removes
        // the current script from it's array and then removes the
        // dependency from the current script dependedBy
        for(let a = 0; a < getLoadedState(otherScript).dependencies.length; a++) {
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


    const checkDependencies = function() {
      let allDependenciesLoaded = true;
      const scriptDependents = getLoadedState(scriptName).dependencies;
      let dependencyScript;
      let dependencyScriptName;

      log('SCRIPTS: ' + scriptName + ' dependent on [' + JSON.toString(scriptDependents) + ']');
      log(scriptDependents);

      for(let i = 0; i < scriptDependents.length; i++) {
        dependencyScript = scriptDependents[i];
        dependencyScriptName = dependencyScript[1];

        // If script name loadState doesn't
        // exist then create one
        if(!nsGet(dependencyScriptName, Yo.loadedState)) {
          createOrEditLoadedState({}, dependencyScriptName);
        }

        if(!getLoadedState(dependencyScriptName).loaded) {
          log('QUICK TEST');
          log(dependencyScriptName);
          log(getLoadedState(dependencyScriptName));
          log('-------------------');
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

    let hasFunction = true;

    const objectHasValue = function (obj, value) {
      const keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i += 1) {
        if (obj[keys[i]] === value) {
          return true;
        }
      }

      return false;
    };

    const objectIsEmpty = function (obj) {
      return Object.keys(obj).length < 1;
    };

    const objectToArray = function (obj) {
      const keys = Object.keys(obj);
      const returnList = [];

      for (let i = 0; i < keys.length; i += 1) {
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
      // For window global variables to activate other scripts
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
    load: load,
    version: version
  }
}
