
[![Build Status](https://travis-ci.org/PocketNinjaDesign/Yo.svg?branch=master)](https://travis-ci.org/PocketNinjaDesign/Yo)

# Yo

## One of the best es5 dependency scripts for use with / without CMS content 

Let's put this simply, if you want to write code that can access other code at any point in the page whether it's a function in a CMS block or in some template then you don't have to worry too much about getting things to communicate **VERY SIMPLY!**

1. [Why](#why)
2. [Quick Yo example](#quick-yo-example)
2. [lets properly look at Yo](#so-lets-properly-look-at-yo)
   * [How to initialise](#how-to-initialise)
   * [Debugging](#debugging)
3. [To Install](#to-install)


## Why?

Okay, try running the code below!

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

Works lovely doesn't it.  Now run the code below with the 2 functions swapped around

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

Doesn't work very well at all.  *I can put them in order or have an init function at the bottom of the page though!* You say!

Well forget you and forget that! :-P

## Quick Yo Example

So exactly the same as above but in Yo at it's bare minimum

```javascript
  var Yo = new Yo();
  Yo.init({});

  Yo.add('widget.tooltip', { tooltip: 'widgets.utils' }, function (dep) {
    dep.utils.output();
  });

  Yo.add('widget.utils', function () {
    return {
      output: function() {
        console.log('Utils are used');
      }
    }
  });
```

As long as it's after the Yo script in the header, these widgets can be added anywhere in a CMS, body, header, widget PHP template anywhere. They will wait to communicate and have full access to their open methods.

That is generally all there is to it!  Download the Yo Script and have a tinker with some simple scripts of your own just to understand there is nothing more than that.



## Lets properly look at Yo

### How to initialise

```javascript
  var CompanyName = {};
  CompanyName.whatever = {};

  var Yo = new Yo();
  Yo.init({
    // defaults to Yo if not set.
    namespace: CompanyName.whatever,
    // defaults to 'module' if not set.  For example
    scriptRoot: 'scriptiesHere',
    // For dependencies you want available for all other scripts
    globalDependencies: {},
    // For outputting scripts Added, Loaded and dependency Connections, default: false
    debugMode: true,
    // For outputting only logs by the scripts / keywords listed, case sensitive
    debugScripts: ['scriptX', 'scriptY']
  });
```


```javascript
  var CompanyName = {};
  CompanyName.whatever.banana = {};

  var Yo = new Yo();
  Yo.init({
    namespace: CompanyName.whatever.banana,
  });

  // adds all scripts to - CompanyName.whatever.banana.module

  Yo.init({
    namespace: CompanyName.whatever,
    scriptRoot: 'scriptiesHere'
  });

  // adds all scripts to - CompanyName.whatever.scriptiesHere
```

Or if you don't add a Company namespace, Yo becomes the host for all of your scripts.

```javascript
  var Yo = new Yo();
  Yo.init({});

  // Default - Yo.modules are where all added scripts go
```

You can make as many instances of Yo if you want to split scripts into their own ecosystems. Though that will rarely happen.

```javascript
  var Egg = new Yo();
  Egg.init({});

  var Cheese = new Yo();
  Cheese.init({});
```



### For new scripts

```javascript
  Yo.add('Lister', { dependencyScript: 'script.name' }, function(dep) {
  });
```

Or

```javascript
  Yo.add('Lister', function() {
  });
```

Or with namespaces

```javascript
  Yo.add('widgets.some.overly.long.namespace.branchLister', function() {
    var output = function(_name) {
      console.log('Hello lister from ' + _name);
    }
    return {
      output: output
    };
  });
```


### Dependency examples

```javascript
  Yo.add('Lister', { something: 'widget.something', different: 'widget.different' }, function(dep) {
    dep.something.show();
    dep.different.show();
  });

  Yo.add('widget.something', { different: 'widget.different' }, function (dep) {
    var show = function () {
      console.log('say HI from something');
    };

    dep.different.show();

    return {
      show: show
    }
  });

  Yo.add('widget.different', function () {
    var show = function () {
      console.log('say HI from different');
    };
    return {
      show: show
    }
  });
```

Let's clean this up just a little and imagine these scripts are anywhere

```javascript

  (function () {
    var dependencies = {
      something: 'widget.Something',
      different: 'widget.Different'
    };

    Yo.add('Lister', dependencies, function(dep) {
      dep.something.show();
      dep.different.show();
    });
  })();

  (function () {
    var dependencies = {
      differentNameSameScript: 'widget.Different'
    };

    Yo.add('Something', dependencies, function (dep) {
      var show = function () {
        console.log('say HI from something');
      };

      dep.differentNameSameScript.show();
      
      return {
        show: show
      }
    });
  })();
  
  Yo.add('Different', function () {
    var show = function () {
      console.log('say HI from different');
    };
    return {
      show: show
    }
  });
```

Woooagh, what's going on there? All we're doing is wrapping self invoking anonymous functions around the Yo scripts and moving the dependencies object into a variable to make it cleaner for listing.

**Also notice a big thing** the script Different is used by 2 scripts and yet the name has been changed, so in one it is called different: `dep.different` and in the other it is differentNameSameScript: `dep.differentNameSameScript`. So if you have a way of naming scripts like Service, Controller or Directives thanks to using AngularJS you may end up with folders like this.

* widgets
  * modal
    * service.js
    * directive.js
  * videoPlayer
    * service.js
    * directive.js

Or however you do it, there could be scripts that have the same name which you are pulling into other scripts.

So like above you could do

```javascript
  var dependencies = {
    modalService: 'widgets.modal.service',
    videoPlayerService: 'widgets.videoPlayer.service'
  };

  Yo.add('CheckDaCone', dependencies, function(dep) {
    dep.modalService.view();
    dep.videoPlayerService.activate();
  });
```

### Global Dependencies

What if you have a script that could be anywhere which is needed by everything?

```javascript

  (function () {
    Yo.add('CheckDaCone', function(dep) {
      $('body').html('lets Get Using Jquer yNow');
    });
  })();

  Yo.add('jQuery');

  // Or a global script which returns a load of helper methods

  (function () {
    Yo.add('CheckDaCone', function(dep) {
      dep.mainStuff.mathsStuff.addBoth(1, 1);
      console.log(dep.mainStuff.websiteVars.email);
    });
  })();

  Yo.add('mainStuff'. function () {
    var mathsStuff = {
      addBoth: function (a, b) {
        return a + b;
      }
    };

    var websiteVars = {
      email: 'checkDaCone@youerd.com',
      country: 'USA'
    }

    return {
      mathsStuff: mathsStuff,
      websiteVars: websiteVars
    };
  });

  // if you want a script to ignore global scripts

  (function () {
    Yo.add('CheckDaCone', false, function() {

    });
  })();
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


# Dev Area

## To install

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


## Testing

Run `./node_modules/karma/bin/karma start`