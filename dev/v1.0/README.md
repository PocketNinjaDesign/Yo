
[![Build Status](https://travis-ci.org/PocketNinjaDesign/Yo.svg?branch=master)](https://travis-ci.org/PocketNinjaDesign/Yo)

# Yo

## Dependency on a single page script

Using gulp to import javascript files into 1 file and provide clean dependencies.
Basically this is just a pet project to do this and learn at the same time :-)
Currently it seems to work well with raw Javascript.  For importing 3rd party plugins that run on page ready there is a little more work :-S

1. [To Install](#to-install)
2. [Why](#why)
3. [So lets look at Yo](#so-lets-look-at-yo)
   * [How To Use](#how-to-use)
   * [Debugging](#debugging)


### To install

Download the repo and run

```
$ npm install
$ npm install gulp -g
```

The main gulp command is to simply run

```
$ gulp
```

This imports javascript into 1 file and copies it to a public folder along with the index html page.

You can also just grab the full or minified versions from the dev folder and just get on coding one off.

### Why?

Try running the code below!

```javascript
  var namespace = {};
  namespace.widget = {};

  namespace.widget.utils = function() {
    return {
      output: function() {
        console.log('Utils are used');
      }
    }
  }();

  namespace.widget.tooltip = function(utils){
    utils.output();
  }(namespace.widget.utils);
```

Works lovely does'nt it.  Now run the code below with the 2 functions swapped around

```javascript
  var namespace = {};
    namespace.widget = {};

    namespace.widget.tooltip = function(utils){
      utils.output();
    }(namespace.widget.utils);

    namespace.widget.utils = function() {
      return {
        output: function() {
          console.log('Utils are used');
        }
      }
    }();
```

Does'nt work very well at all.  *I can put them in order or have an init function at the bottom of the page though!* You say!
Well forget you and forget that! :-P

## So lets look at Yo

### How To Use

```javascript
  var CompanyName = {};
  CompanyName.whatever = {};

  Yo.init({
    // defaults to Yo if not set.
    namespace: CompanyName.whatever,
    // defaults to 'module' if not set.  For example
    scriptRoot: 'scriptiesHere',
    // For outputting scripts Added, Loaded and dependency Connections
    debugMode: true,
    // For outputing only logs by the scripts / keywords listed, case sensitive
    debugScripts: ['scriptX', 'scriptY']
  });
```


```javascript
  var CompanyName = {};
  CompanyName.whatever = {};

  Yo.init({
    namespace: CompanyName.whatever,
  });

  // returns CompanyName.whatever.module

  Yo.init({
    namespace: CompanyName.whatever,
    scriptRoot: 'scriptiesHere'
  });

  // returns CompanyName.whatever.scriptiesHere
```




#### For new scripts

```javascript
  Yo.add('Lister', ['dependencyScript'], function(depScript) {
  });
```

Or

```javascript
  Yo.add('Lister', function() {
  });
```

Or with namespaces

```javascript
  Yo.add('widgets.some.overly.long.namespace.branch.Lister', function() {
    var output = function(_name) {
      console.log('Hello lister from ' + _name);
    }
    return {
      output: output
    };
  });

  Yo.add('Utilities',['widgets.some.overly.long.namespace.branch.Lister'], function(lister) {
    lister.output('eyeamaman');
    return {};
  });
```

#### and add the following line to main.js

```javascript
  //= require widgets/lister.js
```


#### with dependencies

```javascript
  Yo.add('Lister', ['something', 'different'], function(something, different) {
    something.show();
    different.show();
  });

  Yo.add('Something', function() {
    var show = function() {
      console.log('say HI from something');
    };
    return {
      show: show
    }
  });

  Yo.add('Different', function() {
    var show = function() {
      console.log('say HI from different');
    };
    return {
      show: show
    }
  });
```

### Debugging

You have a few small tools to help you debug.  Simply activate debug mode in Yo.init and either leave debugScripts empty to render all logs, or, enter any script names or strings.

```javascript
  Yo.init({
      debugMode: true,
      debugScripts: ['scriptX', 'scriptY', 'any string']
    });
```

For strings just enter if you just want to render added script logs

```javascript
  {
    debugScripts: ['YO.ADD:']
  }
```

You can also view the render order of the scripts in the console which outputs an array

```javascript
  Yo.loadOrder
```

If you include the debugScripts option with loadOrder you can see the render order of just the scripts you're focusing on

```javascript
  Yo.init({
    debugMode: true,
    debugScripts: ['script1', 'script2', 'script3']
  });

  Yo.loadOrder
```
