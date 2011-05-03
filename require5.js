/**
  Require5.JS just like NodeJS style require function for the browser
  (c) DazaGrohovaz.Net / ProxyJS.com <guidoalfredo@dazagrohovaz.net>

  Features:
  - load and eval javascripts files once
  - support sync and async XHR requests
  - storage the scripts on HTML5 Storage if available
  - data transfer only if required, load scripts from storage or cache
    if available (no transfer), otherwise load scripts via XHR (data transfer)
  
  dependencies:
    utils/ajax.js
    utils/path.js

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

if(!global) var global = window.global = window;

// For development, IMPORTANT..!!! Ignore the cache and storage
if(true /** development??? Set this to true */){
  if(!global.runUnitTest) global.runUnitTest = {}; 
  global.runUnitTest.require = true;
  global.runUnitTest.resolveUri = false;
}
/**
  utils/ajax.js
  (c) DazaGrohovaz.Net <dazagrohovaz.net>
*/
(function(){
  // Ajax / XHR
  xhr = this.xhr = function(){
    var xhr = null;
    try  { xhr = new ActiveXObject("Msxml2.XMLHTTP"); }
    catch(e){
      try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); }
      catch(e){ xhr = null; }
    }
    if(!xhr && typeof XMLHttpRequest != "undefined") xhr = new XMLHttpRequest();
    return xhr;
  }
}).call(global);
/**
  utils/path.js
  (c) DazaGrohovaz.Net <dazagrohovaz.net>
*/
(function(){
  var
  // save global in closure
  global = this,
  
  // parseUri 1.2.2
  // (c) Steven Levithan <stevenlevithan.com>
  // MIT License
  // MOD: (c) DazaGrohovaz.Net <dazagrohovaz.net>
  parseUri = this.parseUri = function(path){
    var  o = parseUri.options,
        // MOD: normalize path
        m = o.parser[o.strictMode ? "strict" : "loose"].exec(normalizeUri(path)),
        // m = o.parser[o.strictMode ? "strict" : "loose"].exec(path),
        uri = {},
        i = 14;
    
    while (i--) uri[o.key[i]] = m[i] || '';
    
    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) uri[o.q.name][$1] = $2;
    });
    
    // MOD:
    // normalized property
    uri.normalized = uri.source;
    uri.source = path;
    
    // MOD:
    // toString, toSource functions
    var url = uri.normalized;
    uri.toString = function(){
      return url;
    };
    var source = uri.source;
    uri.toSource = function(){
      return source;
    };
    
    return uri;
  };
  
  parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
      name:   "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };
  
  // normalizeUri 0.0.1
  // (c) DazaGrohovaz.Net <dazagrohovaz.net>
  normalizeUri = this.normalizeUri = function(path){
    var url = path + ((path.substr(-1)=='.') ? '/' : '');
    
    url = url.replace('/.?', '/./?');
    url = url.replace('/..?', '/../?');

    var slashLocation = url.indexOf("/"); // temp variable to store location of slashmark
    var previousIndex = 0; // temp variable to store location of previous slashmark
    var nextPreviousIndex = 0; // temp variable to store location of next previous slashmark
    
    if (slashLocation > -1) { // check if url has any slashes in it
    
      while (slashLocation < url.length) { // while conditional to iterate from start to finish through all slashes in the url string
        
        if (url.charAt(slashLocation-1)==".") {
          
          if ((url.charAt(slashLocation-2)==".")&&(url.charAt(slashLocation-3)=="~")) { // if two periods before the slash, remove all characters between next previous slash and current slash
            
            var oldLength = url.length;
            var offset = 0;
            
            url = url.substr(0,nextPreviousIndex)+"~"+url.substr(slashLocation+1,url.length-slashLocation-1);
            offset = oldLength-url.length;
            
            var tempurl = url.substr(0,nextPreviousIndex);
            nextPreviousIndex = tempurl.lastIndexOf("~");
            previousIndex = slashLocation - offset;
            
            oldLength = null;
            tempurl = null;
            offset = null;
            
          } else if (url.charAt(slashLocation-2)=="~") { // if only one period before the slash, remove "./"
            
            url = url.substr(0,slashLocation-2)+"~"+url.substr(slashLocation+1,url.length-slashLocation);
            
            var tempurl = url.substr(0,previousIndex);
            nextPreviousIndex = tempurl.lastIndexOf("~");
            tempurl = null;
            
            previousIndex = slashLocation-2;
            
          } else {
            
            url = url.substr(0,slashLocation) + "~" + url.substr(slashLocation+1,url.length-slashLocation);
            nextPreviousIndex = previousIndex;
            previousIndex = slashLocation; 
            
          }
        } else if (url.charAt(slashLocation-1)=="~") { // if have slash mark before the slash, remove one
          
          url = url.substr(0,slashLocation) + url.substr(slashLocation+1,url.length-slashLocation);
          
          var tempurl = url.substr(0,previousIndex);
          nextPreviousIndex = tempurl.lastIndexOf("~");
          tempurl = null;
          
          previousIndex = slashLocation-1;
          
        } else { // otherwise just replace the slash with a random character, a tilda, to keep iterating through the url in the while loop
          url = url.substr(0,slashLocation) + "~" + url.substr(slashLocation+1,url.length-slashLocation);
          nextPreviousIndex = previousIndex;
          previousIndex = slashLocation;
          
        }
        
        slashLocation = url.indexOf("/"); // this iterates to the next slash in the url string
        if (slashLocation == -1) break; // if can't find any more slashes in the url string, then stop iterating
      
      } 
    }
    
    // clear out temp variables to avoid memory leaks
    slashLocation = null;
    previousIndex = null;
    nextPreviousIndex = null;
    
    url = url.replace(/~/g,"/"); // return the url after replacing the inserted tildas with slashes
    
    url = ( url.substr(0,5) == 'http:' )  ? url.replace('http:', 'http:/')  : url;
    url = ( url.substr(0,6) == 'https:' ) ? url.replace('http:', 'https:/') : url;
    
    return url;
  }
  
  // resolveUri 0.0.1
  // (c) DazaGrohovaz.Net <dazagrohovaz.net>
  resolveUri = this.resolveUri = function(basePath, path){
    // handle nulls
    if(!basePath){
      try {
        basePath = window.location.href;
      }catch(e){
        basePath = __dirname;
      }
    }
    if(!path)path='';
    
    // parse basePath
    var baseUri = parseUri(basePath);
    baseUri = parseUri(
              baseUri.protocol + (!!baseUri.protocol ? '://' : '') + 
              baseUri.authority + 
              baseUri.directory + 
              ((baseUri.directory.substr(-1) != '/') ? '/../' : ''));
    
    // parse path
    var uri = parseUri((
              (!path || path.substr(0,2) == '/.' || path.substr(0,3) == '/..' || !(path.substr(0,5) == 'http:' || path.substr(0,6) == 'https:'))
              ? ((path.substr(0,1) == '/')
              ? baseUri.protocol + (!!baseUri.protocol ? '://' : '') + baseUri.authority : baseUri )
              : '' )
              + path );
    
    if(global.runUnitTest && global.runUnitTest.resolveUri)
      console.log('\nbasePath  : ' + basePath + 
                  '\npath      : ' + path + 
                  '\nbaseUri   : ' + baseUri + 
                  '\nuri       : ' + uri + 
                  '\nsource    : ' + uri.toSource());
    
    return uri;
  };
}).call(global);
/**
  require5.js 
  (c) DazaGrohovaz.Net <dazagrohovaz.net>
*/
(function(){
  var
  // main path
  __root = normalizeUri(resolveUri().normalized+'/require5.js'), 
  
  // implements HTML5 Storage Support if available
  storage = (function() {
    try {
      return ('localStorage' in window && window['localStorage'] !== null) ? window['localStorage'] : undefined;
    } catch (e) {
      return undefined;
    }
  })(),
  
  // m:
  // memory cache
  // look at the comments to see the differences between NodeJS require function and Require5.JS
  m = {
    // paths: list of all required or defined (unshift) javascript files.
    // it's an Object because it noted whether the package status is.
    // {'http://www.example.com/lib/scripts/require5.js': 'unshift' || 'fails' || 'ready'}
    paths: {},
    
    // alias (new): used to implement browser optimized unshift method. example:
    // if the browser href is 'http://www.example.com/somepath/somepage.html'
    // or the unshift-method is called from 'http://www.example.com/somepath/somescript.js'
    // like require.paths.unshift('path/to/my/file.js', 'myscript')
    // first resolve the path ('http://www.example.com/somepath/path/to/my/file.js')
    // then set alias['myscript'] = 'http://www.example.com/somepath/path/to/my/file.js';
    // if the path don't exixts on paths
    // then set paths['http://www.example.com/somepath/path/to/my/file.js'] = 'unshift';
    // now it's posible to call require('myscript');
    // it will reffer to 'http://www.example.com/somepath/path/to/my/file.js'
    alias: {},
    
    // cache: collection of all instances of loaded packages, fails too (for debug reasons)
    cache: {},
    
    // implements HTML5 Storage Support if available
    useStorage: !(global.runUnitTest && global.runUnitTest.require) && storage,    
  },
  // END m:
  
  // require: prepare require capabilities on 'this' context
  require = function(request){
    var
    // __resolveUri:
    // resolve relation between 2 paths, from  basePath(__dirname) and request(__filename)
    // accepts querystring(?) and dependencies(#), just like in brower
    __resolveUri = function(basePath, request){
      var
      
      // resolve Uri or Path
      res = resolveUri(basePath, request),
      
      // extend resolveUri for require:
      // check file extention (only '.js' files allow)
      // if not match append '/index.js' to the Url
      url = res.protocol + (!!res.protocol ? '://' : '') + res.authority + 
            res.directory + ((res.directory.substr(-1) != '/' ) ? '/' : '') + 
            res.file + ((!!res.file && res.file.substr(-3) == '.js' ) ? '' : '/index.js')
            
            // no querystring and anchor
            //( !!res.query ? '?' : '' ) + res.query + 
            //( !!res.anchor ? '#' : '' ) + res.anchor;
      
      // normalize the url and return it
      return normalizeUri(url);
    },
    // END resolve:
    
    // __require:
    __require = function(request){
      if(!request || typeof request !== 'string' ) return null;
      if(!(this instanceof __require)) return new __require(request);
      
      var 
      
      // set  __self as the module
      __self = this,
      
      // parse the request
      uri = parseUri(request),
      
      // look if main/root module was defiened 
      __main = ( !!m.paths[0] ? m.cache[m.paths[0]].module : undefined ),
      
      // path and querystring
      __module = __self.__module = uri.protocol + (!!uri.protocol ? '://' : '') + uri.authority + 
                                   uri.directory + ((uri.directory.substr(-1) != '/' ) ? '/' : '') + 
                                   uri.file + ((!!uri.file && uri.file.substr(-3) == '.js' ) ? '' : '/index.js'),
      
      //__query = __self.__query = uri.query,
      
      // querystring as object
      //__query = __self.__query = uri.queryKey,
      
      // directory and file names
      __dirname = __self.__dirname = __module.slice(0, __module.length - uri.file.length),
      __filename = __self.__filename = uri.file,
      
      // anchor
      //__anchor = __self.__anchor = ( !!uri.anchor ? uri.anchor : '' ),
      
      // require
      require = __self.require = function(path, callback){ return _require(path, callback); },
      
      // resolve
      resolve = __self.resolve = function(request){ return _resolve(request); },
      
      // memory cache
      useStorage = __self.useStorage = m.useStorage,
      alias  = __self.alias = m.alias,
      cache  = __self.cache = m.cache,
      paths  = __self.paths = m.paths,
      
      // context
      context  = __self.context = {},
      
      // unshift with require and callback
      unshift = paths.unshift = function(unshift, path){
        // perform alias (new): used to implement browser optimized unshift method. example:
        // if the browser href is 'http://www.example.com/somepath/somepage.html'
        // or the unshift-method is called from 'http://www.example.com/somepath/somescript.js'
        // like require.paths.unshift('path/to/my/file.js', 'myscript')
        if(!unshift || typeof unshift !== 'string') return undefined;
        if(!path || typeof path !== 'string') return undefined;
        
        // first resolve the path ('http://www.example.com/somepath/path/to/my/file.js')
        var request = __resolveUri(__dirname, path)
        
        // then set alias['myscript'] = 'http://www.example.com/somepath/path/to/my/file.js';
        alias[unshift] = request;
        
        // if the path don't exixts on paths
        // then set paths['http://www.example.com/somepath/path/to/my/file.js'] = 'unshift';
        paths[request] = paths[request] || 'unshift';
        
        // now it's posible to call require('myscript');
        // it will reffer to 'http://www.example.com/somepath/path/to/my/file.js'
        
        // return the request path if it done
        return request;
      },
      // END unshift
      
      // module
      module = __self.module = {
        id          :   __filename,
        exports     :   {},
        filename    :   __module,
        loaded      :   0,
        error       :   undefined,
        cached      :   false,
        parent      :   undefined,
        paths       :   paths
      },
      // END module
      
      // main
      main = __self.main = __main,
      
      // exports
      exports = __self.exports = function(){ return __self.module.exports; },
      
      // _resolve
      _resolve = __self._resolve = function(request){
        var apath = alias[request],
            path = apath || __resolveUri(__dirname, request),
            status = paths[path];
        
        // _resolve: resolve paths of all required or defined (unshift) javascript files.
        // it return a object because it noted whether the package alias, path and status is.
        // { alias: 'myscript', path: 'http://www.example.com/require5.js', status: 'unshift' || 'loaded'  || 'fails' || 'ready' || undefined }
        return { alias: ( !!apath ? request : undefined ), path: path, status: status, };
      },
      // END _resolve
      
      // _require:
      // load the required modules, extention '.js' require !!!
      // the path muss be like 'file.js', otherweise require will search 'index.js'
      // it is in this case not like NodeJS, but most appropriate for the browser
      _require = __self._require = function(request, callback){
        
        // resolce request
        var info = _resolve(request),
        
        // if callback is passed run async
        async = (!!callback && typeof callback === 'function'),
        
        // parse
        // run script parse at response and analize the result
        parse = function(response){
          var 
          
          // make new module
          Module = new __require(info.path),
          
          // execute the script
          result = exec.call(Module, response);
          
          // validate the result
          if( Module !== result ){
            // append error object to exports, remove from storage and set status to 'fails'
            Module.module.exports.error = Module.module.error = result;
            if( useStorage ) storage.removeItem('script.' + info.path);
            paths[info.path] = 'fails';
          } else {
            // save the script into storage, set status to ready, increment loaded-counter
            if( useStorage ) storage.setItem('script.' + info.path, response);
            paths[info.path] = 'ready';
            Module.module.loaded++;
            
            // save module into the cache
            cache[info.path] = Module;
            Module.module.cached = true;
          } 
          
          // extend module.parent
          Module.module.parent = function(){ return __self.module };
          
          // wait 1ms to execute callback to ensure that require return the getContext function
          if(async){
            setTimeout(function(){
              callback.call( window, Module.module.exports, Module.module, Module.require, Module.__dirname, Module.__filename );
            },1);
          }
          // if no async return exports
          if(!async) return Module.module.exports;
        },
        // END parse
        
        // fired on Error
        error = function(e){
          console.log("Couldn't resolve path: " +
                      "'" + request + "' with respect to filename '" + __module + "': " +
                      "file can't resolve past base");
          
          if(e)console.log(e);
        },
        
        // fired on Request Ready or State Change
        onReadyStateChange = function(){
          // readyState == 4 : complete, status == 200 || 304 : success
          if(this.readyState == 4){
            if(this.status == 200 || this.status == 304){
              if( async) return parse(this.responseText);
            }else{
              error(this.status + ': ' + this.statusText + '\n' + 
                    '// ===== BEGIN OF FILE ===== //\n\n' +
                    this.responseText +
                    '\n\n// ===== BEGIN OF FILE ===== //\n/n');
            }
          }
        },
        
        // execute the called module

        exec = function(script){
          // create a new global function
          var scriptString =
          'window[\'script.' + this.__module + '\'] = function(){\n' +
          ' try {\n' +
          '  (function(global, require, module, exports, __dirname, __filename ){\n' +  // REMOVED: __module, __query, __queryKey, __anchor
          '   this.global = this;\n' +
          '   "===== BEGIN OF FILE =====";\n' +
              script + '\n' +
          '   "===== END  OF  FILE =====";\n' +
          '   }).call(window, window, this.require, this.module, this.module.exports, this.__dirname, this.__filename);\n' +  // REMOVED: this.__module, this.__query, this.__queryKey, this.__anchor 
          '   return this;\n' +
          ' } catch(e) {\n' +
          '   return { e: e };\n' +
          ' }\n' +
          '}\n';
          
          try{
            // append script into the head (replace the eval function)
            var js = document.createElement('script');
            js.setAttribute('type', 'text/javascript');
            js.text = scriptString;
            document.head.appendChild(js);
            // once compiled remove script from the head 
            document.head.removeChild(js);
            
            // calling the new function
            var result = window['script.' + this.__module].call(this);
            if( result !== this ) result.src = script;
            
            // once executed remove the function from window to prevent unwanted calls
            delete window['script.' + this.__module];
            
            // return result back
            return result;
          } catch(e) {
            return { e: e, src: script };
          }
        };

        // if status ready
        if( info.status == 'ready' ){
          // search the module in the cache
          var Module = cache[info.path];
          // if the module is present
          if( !!Module ){
            // increment the loaded-counter
            Module.module.loaded++;
            if(async){
              // wait 1ms to execute callback to ensure that require return the getContext function
              setTimeout(function(){
                callback.call( window, Module.module.exports, Module.module, Module.require, Module.__dirname, Module.__filename );
              },1);
            }
            // if no async return exports
            if(!async) return Module.module.exports;
          } else {
            // something is wrong
            error();
          }
        } else {
          // implements HTML5 Storage Support if available
          var script = ( useStorage && info.status != 'fails' ) ? storage.getItem('script.' + info.path) : undefined;
          
          if(!!script){
            // if the script was available in storage parse the script
            if(async) parse(script);
            if(!async) return parse(script);
          } else {
            // otherwise request the script with XHR
            var req = new xhr();
            req.open('GET', info.path, async);
            					
            // for unittest modus set request header If-Modified-Since
            if(global.runUnitTest && global.runUnitTest.require) req.setRequestHeader('If-Modified-Since', 'Sat, 1 Jan 2005 00:00:00 GMT');
            req.onreadystatechange = onReadyStateChange;
            req.send();
            
            // return exports
            if(!async) return parse(req.responseText);
          }
        }
        // return getContext function
        if(async) return function(){ // getContext-function
          // exports, module, require, __dirname, __filename
          Module.context.exports = Module.module.exports;
          Module.context.module = Module.module;
          Module.context.require = Module.require;
          Module.context.__dirname = Module.__dirname;
          Module.context.__filename = Module__filename;
          
          return Module.context;
        };
        // END if status ready
      };
      // end _require
      
      // extend require
      __self.require.alias   = alias;
      //__self.require.cache   = cache;
      __self.require.paths   = paths;
      __self.require.resolve = resolve;
      
      return __self;
    }
    // END __require
    
    // make the first module 'require5.js'
    Require = new __require( request ),
    
    // set path
    m.paths[request] = 'ready';
    Require.module.loaded++;
    
    // set cache
    m.cache[request] = Require;
    Require.module.cached = true;
    
    // set alias
    m.alias['require']=__root;
    
    // extend module.parent
    Require.module.parent = undefined;
    
    // extends module.exports.global, require & module
    Require.module.exports.global  = window;
    Require.module.exports.require = Require.require;
    Require.module.exports.module  = Require.module;
    
    // look at storage for saved packages
    if( !!m.useStorage ){
      for(var prop in storage){
        if(prop.slice(0,7)==='script.'){
          var script = prop.slice(7);
          m.paths[script] = 'loaded';
        }
      }
    }
    
    return Require.module.exports;
  }
  // END require: prepare require capabilities on 'this' context

  this.exports   = require( __root );
  
  this.global  = window;
  this.require = this.exports.require;
  this.module  = this.exports.module;
  
  // protect scripts
  Function.prototype.toString = function(){
    return 'function() { [native code] }'
  };
  
}).call(window);
