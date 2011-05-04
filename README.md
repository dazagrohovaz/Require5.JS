# <br><i>Require5.JS</i>
##### almost like NodeJS style require-Function for the browser
# Features:

  * load, compile and run scripts once.<br>
  * support sync and async XHR requests.<br>
  * storage the scripts on HTML5 Storage if available.<br>
  * data transfer only if required, load scripts from storage or cache if available (no transfer), otherwise load scripts via XHR (data transfer).<br>
  * cross-domain requests, don't support data storage or other features, just push the scripts into the document's head tag<br>


# Supported Methods
###### (see the example bellow)

* Synchronic:<br>
<pre>
  var sync = require('./path/to/scripts/file.js');
  console.log(sync.works);       // returns 'yes, it\' works...!!'
</pre>

* Asynchronic:<br>
<pre>
  require('./path/to/scripts/file.js', function(exports){
  &nbsp; var async = exports;
  &nbsp; console.log(async.works);    // returns 'yes, it\' works...!!'
  });
</pre>


#### Example: file.js

* <br>
<pre>
var counter = 0;

// How to overwrite exports with a function
exports = module.exports = function inc(){
&nbsp; return ++counter;
};

exports.reset = function(){
&nbsp; return counter = 0;
};

exports.works = 'yes, it\' works...!!';
</pre>


## Working with the 'unshift' function

The unshift function is more like an alias, with this can be define a short name for fast access to the javascript file
<pre>
  require.paths.unshift('file', 'lib/scripts/file.js');
  var unshift = require('file');
  console.log(unshift.works);    // returns 'yes, it\' works...!!'
</pre>


## The example site:

foo.js is the application, but it depends from other scripts, like jQuery. Normaly, these need to be loaded first.

The structure of the site:

  http://www.example.com/index.html
  http://www.example.com/path/to/scripts/foo.js  // depends from bar.js
  http://www.example.com/path/to/scripts/bar.js

In the index.html file:

The "normal" ways to implement and run these scripts (foo & bar) into the page are

* First 'bar.js' because 'foo.js' depends of this one,
  <script src="path/to/scripts/bar.js"></script> or
  <script src="/path/to/scripts/bar.js"></script> or
  <script src="./path/to/scripts/bar.js"></script>
  <script src="http://www.example.com/path/to/scripts/bar.js"></script>

* than 'foo.js'
  <script src="./path/to/scripts/foo.js"></script>

### Now the same with Require5.JS, with a few changes

The structure of example site with Require5.JS:

  http://www.example.com/index.html
  http://www.example.com/path/to/require/require5.js
  http://www.example.com/path/to/scripts/foo.js  // depends of bar.js
  http://www.example.com/path/to/scripts/bar.js

In the index.html file:

  <script src="./path/to/require/require5.js"></script>
  <script>
    require.paths.unshift('foo', './path/to/scripts/foo.js');
    require('foo');
  </script>

In the top of 'foo.js' file

  require('./bar.js');
  // than your code


4. Other features of Require5.JS

The private Values:

  __dirname:  following the previous example, in 'foo.js' it will be 'http://www.example.com/path/to/scripts/'
  __filename: following the previous example, in 'foo.js' it will be 'foo.js'


The require.paths Attribute

  return a object with all module-paths and their status
  - 'loaded'   : the script is on storage
  - 'fails'    : the script couldn't be loaded or compiled
  - 'unschift' : only an alias name was setted for this script, it is not used any time
  - 'ready'    : the script is loaded and compiled
  - undefined


The require.alias Attribute

  return a object with all alias and their paths


The Unshift-Function: Alias-Names for Script-Files with Path recognition

  var path = require.paths.unshift('foo', './path/to/scripts/foo.js');
  // if the Unshift-Function was call at http://www.example.com/index.html
  // like the Resolve-Function returns the path 'http://www.example.com/path/to/scripts/foo.js'
  
  var path = require.paths.unshift('bar', './bar.js');
  // if the Unshift-Function was call at http://www.example.com/path/to/scripts/foo.js
  // like the Resolve-Function returns the path 'http://www.example.com/path/to/scripts/bar.js'


The Resolve-Function: Path recognition

  var path = require.resolve('./path/to/scripts/foo.js');
  // if the Resolve-Function was called at http://www.example.com/index.html
  // returns a object with 3 elements, the alias (setted with unshift),
  // the path 'http://www.example.com/path/to/scripts/foo.js' and the status
  
  var path = require.resolve('./bar.js');
  // if the Unshift-Function was called at http://www.example.com/path/to/scripts/foo.js
  // returns a object with 3 elements, the alias (setted with unshift),
  // the path 'http://www.example.com/path/to/scripts/bar.js' and the status


The Require-Function's returned Values: exports, module, require, __dirname, __filename

  function requestHandler(exports, module, require, __dirname, __filename){
    // require continue to work as it will be at 'http://www.example.com/path/to/scripts/foo.js'
    require('./bar.js');
    
    // do something
    console.log(__filename);      // returns 'foo.js'
    console.log(__dirname);       // returns 'http://www.example.com/path/to/scripts/'
    console.log(exports.works);   // returns 'yes, it\' works...!!'
  }
  require(./path/to/scripts/foo.js', requestHandler);


The Require-Function's returned getContext-Function:
  
  var async = require('./path/to/scripts/foo.js', function(){
    var context = async();
    context.require('./bar.js');
    
    // do something
    console.log(context.__filename);      // returns 'foo.js'
    console.log(context.__dirname);       // returns 'http://www.example.com/path/to/scripts/'
    console.log(context.exports.works);   // returns 'yes, it\' works...!!'
  });


Cross-Domain Calls

  These are complete asynchronic and don't support storage or other features,
  just push scripts into the document.head.

  For example: We use this to load outside libraries like jQuery or MooTools.

  // with callback
  require('http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js', function(state){
    if(state == 'ready') console.log('great!')
  });

  // without callback
  require.paths.unshift('jquery', 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js')

  var ret = require('jquery');
  
  function sayGreat(){
    if(ret().ready){
      console.log('great!');
    }else{
      setTimeout(sayGreat, 10);
    }
  }
  setTimeout(sayGreat, 10);
