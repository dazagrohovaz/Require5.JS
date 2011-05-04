# <br><i>Require5.JS</i>
##### almost like NodeJS style require-Function for the browser
# Features:

  * load, compile and run scripts once.<br>
  * support sync and async XHR requests.<br>
  * storage the scripts on HTML5 Storage if available.<br>
  * data transfer only if required, load scripts from storage or cache if available (no transfer), otherwise load scripts via XHR (data transfer).<br>
  * cross-domain requests (don't support data storage or other features, just push the scripts into the document's head tag)<br>


# Supported Methods
###### (see the example bellow)

* Synchronic<br>
<pre>
  var sync = require('./path/to/scripts/file.js');
  console.log(sync.works);       // returns 'yes, it\' works...!!'
</pre>

* Asynchronic<br>
<pre>
  require('./path/to/scripts/file.js', function(exports){
  &nbsp; var async = exports;
  &nbsp; console.log(async.works);    // returns 'yes, it\' works...!!'
  });
</pre>


#### Example

* file.js<br>
<pre>
var counter = 0;<br>
// How to overwrite exports with a function
exports = module.exports = function inc(){
&nbsp; return ++counter;
};<br>
exports.reset = function(){
&nbsp; return counter = 0;
};<br>
exports.works = 'yes, it\' works...!!';
</pre>


## Working with the 'unshift' function

The unshift function is more like an alias, define a shortname for access quickly to the javascript files

* Example<br>
<pre>
  require.paths.unshift('file', 'lib/scripts/file.js');
  var unshift = require('file');<br>
  console.log(unshift.works);    // returns 'yes, it\' works...!!'
</pre>


## The Example Site

#### Concept / Idea<br>
<pre>
  foo.js is the application, but it depends from other scripts, like jQuery. Normaly, these need to be loaded first.
  Well in this case 'foo.js' depends from 'bar.js'.
</pre>

#### The structure of the site<br>
<pre>
  http://www.example.com/index.html
  http://www.example.com/path/to/scripts/foo.js  // depends from bar.js
  http://www.example.com/path/to/scripts/bar.js
</pre>

#### Into the index.html file<br>
<pre>
The "normal" ways to implement and run these scripts (foo & bar) into the page are<br>
* first 'bar.js' because 'foo.js' depends of this one<br>
  &lt;script src="path/to/scripts/bar.js"&gt;&lt;/script&gt; or
  &lt;script src="/path/to/scripts/bar.js"&gt;&lt;/script&gt; or
  &lt;script src="./path/to/scripts/bar.js"&gt;&lt;/script&gt;
  &lt;script src="http://www.example.com/path/to/scripts/bar.js"&gt;&lt;/script&gt;<br>
* then 'foo.js'<br>
  &lt;script src="./path/to/scripts/foo.js"&gt;&lt;/script&gt;
<br>
</pre>

### Now the same with <i>Require5.JS</i>, with a few changes

#### The structure of example site with <i>Require5.JS</i><br>
<pre>
  http://www.example.com/index.html
  http://www.example.com/path/to/require/require5.js
  http://www.example.com/path/to/scripts/foo.js  // depends of bar.js
  http://www.example.com/path/to/scripts/bar.js
</pre>

#### Into the index.html file<br>
<pre>
  &lt;script src="./path/to/require/require5.js"&gt;&lt;/script&gt;
  &lt;script&gt;
    require.paths.unshift('foo', './path/to/scripts/foo.js');
    require('foo');
  &lt;/script&gt;
</pre>

#### at the top of the 'foo.js' file<br>
<pre>
  require('./bar.js');
  // then the code
</pre>


## Other Features and Properties of <i>Require5.JS</i>

#### Private Values<br>
<pre>
  __dirname  : following the previous example, into 'foo.js' it will return 'http://www.example.com/path/to/scripts/'
  __filename : following the previous example, into 'foo.js' it will return 'foo.js'
</pre>

#### <br>The <i>'require.paths'</i> Attribute<br>
<pre>
  return a object with all module-paths and their status<br>
  - 'loaded'   : the script is on storage
  - 'fails'    : the script couldn't be loaded or compiled
  - 'unschift' : only an alias name was setted for this script, it is not used any time
  - 'ready'    : the script is loaded and compiled
  - undefined  : the script isn't used, defined or called<br>
  { 'http://www.example.com/path/to/scripts/foo.js': 'unschift', 'http://www.example.com/path/to/scripts/bar.js': 'loaded' }
<br>
</pre>

#### <br>The <i>'require.alias'</i> Attribute<br>
<pre>
  return a object with all alias and their paths<br>
  { 'foo': 'http://www.example.com/path/to/scripts/foo.js' }
  <br>
</pre>


#### <br>The Unshift-Function's returned Value:<br>
###### <i>Alias-Names for Script-Files with Path recognition</i>
<pre>
  var path = require.paths.unshift('foo', './path/to/scripts/foo.js');
  // if the Unshift-Function was called at http://www.example.com/index.html
  // returns 'http://www.example.com/path/to/scripts/foo.js'<br>
  var path = require.paths.unshift('bar', './bar.js');
  // if the Unshift-Function was called at http://www.example.com/path/to/scripts/foo.js
  // returns 'http://www.example.com/path/to/scripts/bar.js'
</pre>

#### <br>The Resolve-Function's returned Object:<br>
###### <i>Path, Alias and Status recognition</i>
<pre>
  var res = require.resolve('foo');
  // returns a object with 3 elements, the alias (setted with unshift), the path and the status<br>
  { alias: 'foo', path: 'http://www.example.com/path/to/scripts/foo.js', status: 'unshift' }<br><br>
  var res = require.resolve('./bar.js');
  // if the Unshift-Function was called at http://www.example.com/path/to/scripts/foo.js
  // returns a object with 3 elements, the alias, the path, and the status<br>
  { alias: undefined, path: 'http://www.example.com/path/to/scripts/bar.js', status: 'loaded' }
  <br>
</pre>


#### <br>The Require-Function's returned Arguments:<br>
###### <i>exports, module, require, __dirname, __filename<i>
<pre>
  function requestHandler(exports, module, require, __dirname, __filename){
    // require continue to work as it will be at 'http://www.example.com/path/to/scripts/foo.js'
    require('./bar.js');<br>
    // do something
    console.log(__filename);      // returns 'foo.js'
    console.log(__dirname);       // returns 'http://www.example.com/path/to/scripts/'
    console.log(exports.works);   // returns 'yes, it\' works...!!'
  }
  require(./path/to/scripts/foo.js', requestHandler);
</pre>

#### <br>The Require-Function's returned getContext-Function:<br>
###### <i>Access to the Module-Context of Asynchronic Calls<i>
<pre>
  var async = require('./path/to/scripts/foo.js', function(){
    var context = async();
    context.require('./bar.js');<br>
    // do something
    console.log(context.__filename);      // returns 'foo.js'
    console.log(context.__dirname);       // returns 'http://www.example.com/path/to/scripts/'
    console.log(context.exports.works);   // returns 'yes, it\' works...!!'
  });
</pre>

#### <br>Cross-Domain Calls<br>
  These are complete asynchronic and don't support storage or other features,
  just push scripts into the documen'st head tag,<br>
  for example: We use this to load outside libraries like jQuery or MooTools
  from googleapis.com to get allways the last one.<br>
<pre>
  // with callback
  require('http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js', function(state){
    if(state == 'ready') console.log('great!')
  });<br>
  // without callback
  require.paths.unshift('jquery', 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js')
  var ret = require('jquery');<br>
  function sayGreat(){
    if(ret().ready){
      console.log('great!');
    }else{
      setTimeout(sayGreat, 10);
    }
  }
  setTimeout(sayGreat, 10);
</pre>
<br>
### <br><i>Require5.JS</i><br>
###### almost like NodeJS style require-Function for the browser<br>
(c) DazaGrohovaz.Net <guidoalfredo@dazagrohovaz.net> / ProxyJS.com <support@proxyjs.com><br>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
