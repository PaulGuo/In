/*
	Author: Guokai
	Email/Gtalk: badkaikai@gmail.com
	Datetime: 2011-04-28
	Namespace: window.In
	Description: this a light framework that can manage dependency of the modules,
	most important,you can load them on-demand,asynchronous and multi-threaded...
	License: Apache License,Version 2.0
	
	Usage:
	In.add('name',{path:'url here',type:'js',charset:'utf-8',rely:['a','b']});
	In.exe('name','a','b',function() {...});
	In('name','a','b',function() {...}); -> recommended usage equivalent to In.exe()
	In.ready('name','a','b',function() {...});
	In.watch(o,'p',function(prop,old,new) {...});
	In.unwatch(o,'p');
	
	Version: 0.12
	Build: 110808
*/

~function() {
	var __head=document.head || document.getElementsByTagName('head')[0];
	var __waterfall={};
	var __loaded={};
	var __loading={};
	var __configure={};
	var __in;
	
	//core - load
	var __load=function(url,type,charset,callback) {
		if(typeof(arguments[0])==='string' && arguments[0]==='bingo') {
			var fn=arguments[1];
			var cb=arguments[2];
			var o=arguments[3];
			if(fn) o.bag.returns.push(fn());
			if(cb) cb();
			return;
		}
		
		if(__loading[url]) {
			if(callback) {
				setTimeout(function() {
					__load(url,type,charset,callback);
				},1);
				return;
			}
			return;
		}
		if(__loaded[url]) {
			if(callback) {
				callback();
				return;
			}
			return;
		}
		
		__loading[url]=true;
		
		var n,t=type||url.toLowerCase().substring(url.lastIndexOf('.')+1);
		
		if(t==='js') {
			n=document.createElement('script');
			n.type='text/javascript';
			n.src=url;
			n.async='true';
			if(charset) {
				n.charset=charset;
			}
		} else if(t==='css') {
			n=document.createElement('link');
			n.type='text/css';
			n.rel='stylesheet';
			n.href=url;
			__loaded[url]=true;
			__loading[url]=false;
			__head.appendChild(n);
			if(callback) callback();
			return;
		}

		n.onload=n.onreadystatechange=function() {
			if (!this.readyState || this.readyState==='loaded' || this.readyState==='complete') {
				__loading[url]=false;
				__loaded[url]=true;
				
				if(callback) {
					callback();
				}
				
				n.onload=n.onreadystatechange=null;
			}
		};
	
		__head.appendChild(n);
	};
	
	//core - analyze
	function __analyze(array) {
		var riverflow=[];
		
		for(var i=array.length-1;i>=0;i--) {
			var cur=array[i];
			if(typeof(cur)==='string') {
				if(!__waterfall[cur]) {
					alert('Please check your model name:'+cur);
					continue;
				}
				var relylist=__waterfall[cur].rely;
				riverflow.push(cur);
				if(relylist) {
					riverflow=riverflow.concat(__analyze(relylist));
				}
			} else if(typeof(cur)==='function') {
				riverflow.push(cur);
			}
		}
		
		return riverflow;
	}
	
	//in - product process line
	function stackline(blahlist) {
		var o=this;
		this.stackline=blahlist;
		this.current=this.stackline[0];
		this.bag={returns:[],complete:false};
		this.start=function() {
			if(typeof(o.current)!='function' && __waterfall[o.current]) {
				__load(__waterfall[o.current].path,__waterfall[o.current].type,__waterfall[o.current].charset,o.next);
			} else {
				__load('bingo',o.current,o.next,o);
			}
		}
		this.next=function() {
			if(o.stackline.length==1 || o.stackline.length<1) {
				o.bag.complete=true;
				return;
			}
			o.stackline.shift();
			o.current=o.stackline[0];
			o.start();
		}
	}
	
	//in - add
	var __add=function(name,config) {
		if(!name || !config || !config.path) return;
		__waterfall[name]=config;
	}
	
	//in - public
	var __in=function() {
		//empty
		var args=[].slice.call(arguments);
		
		//autoload the core files
		if(__configure.core && __configure.autoload && !__loaded[__configure]) {
			__add('__core',{path:__configure.core});
			args=['__core'].concat(args);
		}
		
		var blahlist=__analyze(args).reverse();
		
		var stack=new stackline(blahlist);
		stack.start();
		return stack.bag;
	};
	
	//contentLoaded
	function contentLoaded(win,fn) {
		var done=false,top=true,
		doc=win.document,root=doc.documentElement,
		add=doc.addEventListener ? 'addEventListener':'attachEvent',
		rem=doc.addEventListener ? 'removeEventListener':'detachEvent',
		pre=doc.addEventListener ? '':'on',
		
		init=function(e) {
			if(e.type=='readystatechange' && doc.readyState!='complete') return;
			(e.type=='load' ? win:doc)[rem](pre+e.type,init,false);
			if(!done && (done=true)) fn.call(win,e.type || e);
		},
		
		poll=function() {
			try {root.doScroll('left');} catch(e) {setTimeout(poll,50);return;}
			init('poll');
		};
		
		if (doc.readyState=='complete') {
			fn.call(win,'lazy');
		} else {
			if (doc.createEventObject && root.doScroll) {
				try {top=!win.frameElement;} catch(e) {}
				if(top) poll();
			}
			doc[add](pre+'DOMContentLoaded',init,false);
			doc[add](pre+'readystatechange',init,false);
			win[add](pre+'load',init,false);
		}
	}
	
	//in - ready
	var __ready=function() {
		var args=arguments;
		contentLoaded(window,function() {
			__in.apply(this,args);
		});
	}
	
	//in - watch
	var __watch=function(obj,prop,handler) {
		if(obj.watch) { //Firefox
			obj.watch(prop,function(prop,oldValue,newValue) {
				handler(prop,oldValue,newValue);
				return newValue;
			});
		} else {
			~function() {
				obj._watching=obj._watching||{};
				obj._watching[prop]=obj._watching[prop]||{};
				_this=obj._watching[prop];
				_this.oldValue=obj[prop];
				
				var getter=function() {
					var value=_this.oldValue;
					return value;
				},
				setter=function(newValue) {
					var oldValue=_this.oldValue;
					_this.oldValue=newValue;
					return value=handler.call(obj,prop,oldValue,newValue);
				};
				
				if(!/*@cc_on!@*/0 && Object.defineProperty) { //can't watch constants
					if(Object.defineProperty) { //ECMAScript 5
						Object.defineProperty(obj,prop,{ //Chrome Safari
							get:getter,
							set:setter
						});
					}
				} else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { //legacy Opera
					Object.prototype.__defineGetter__.call(obj,prop,getter);
					Object.prototype.__defineSetter__.call(obj,prop,setter);
				} else { //IE
					__unwatch(obj,prop,true); //avoid duplicate watching
					_this._intervalStamp=setInterval(function() {
						var oldValue=_this.oldValue,o=obj,p=prop;
						return function() {
							var newValue=o[p];
							if(oldValue!=newValue) {
								handler.call(obj,prop,oldValue,newValue);
								oldValue=newValue;
							}
						}
					}(),100);
				}
			}();
		}
	}
	
	//in - unwatch
	var __unwatch=function(obj,prop,skin_deep) {
		if(obj.unwatch) {
			obj.unwatch(prop);
		} else {
			if(obj._watching) {
				var _this=obj._watching[prop];
			}
			try { //fix delete window.prop under ie6
				var value=obj[prop];
				delete obj[prop];
				obj[prop]=value;
			} catch(e) {}
			if(_this && _this._intervalStamp) {
				clearInterval(_this._intervalStamp);
				!skin_deep && delete obj._watching[prop];
			}
		}
	}
	
	//in - initialize
	~function() {
		var myself=(function() {
			var scripts=document.getElementsByTagName('script');
			return scripts[scripts.length-1];
		})();
		var autoload=myself.getAttribute('autoload');
		var core=myself.getAttribute('core');
		
		if(autoload==='true' && core) {
			__configure['autoload']=autoload;
			__configure['core']=core;
		}
		
		//autoload the core files
		if(__configure.autoload && __configure.core) {
			__in();
		}
	}();
	
	//bind the method
	__in.exe=__in;
	__in.load=__load;
	__in.add=__add;
	__in.ready=__ready;
	__in.watch=__watch;
	__in.unwatch=__unwatch;
	this.In=__in;
}();
