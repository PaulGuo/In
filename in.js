/*
	@author: guokai
	@email/gtalk: badkaikai@gmail.com
	@blog/website: http://benben.cc
	@license: apache license,version 2.0
	
	@usage: http://paulguo.github.com/In
	@philosophy: just in time.
	@version: 0.1.7
	@build: 110428111005
*/

~function() {
	var __head=document.head || document.getElementsByTagName('head')[0];
	var __waterfall={};
	var __loaded={};
	var __loading={};
	var __configure={autoload:false,core:'',serial:true};
	var __in;
	
	//in - load
	var __load=function(url,type,charset,callback) {		
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
		
		var pureurl=url.split('?')[0];
		var n,t=type||pureurl.toLowerCase().substring(pureurl.lastIndexOf('.')+1);
		
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

		n.onerror=function() {
			__loading[url]=false;
			
			if(callback) {
				callback();
			}
			
			n.onerror=null;
		}
	
		__head.appendChild(n);
	};
	
	//in - analyze
	var __analyze=function(array) {
		var riverflow=[];
		for(var i=array.length-1;i>=0;i--) {
			var current=array[i];
			if(typeof(current)==='string') {
				if(!__waterfall[current]) {
					console && console.warn('model not found:'+current);
					continue;
				}
				riverflow.push(current);
				var relylist=__waterfall[current].rely;
				if(relylist) riverflow=riverflow.concat(__analyze(relylist));
			} else if(typeof(current)==='function') {
				riverflow.push(current);
			}
		}
		return riverflow;
	}
	
	//in - process
	var __stackline=function(blahlist) {
		var o=this;
		this.stackline=blahlist;
		this.current=this.stackline[0];
		this.bag={returns:[],complete:false};
		this.start=function() {
			if(typeof(o.current)!='function' && __waterfall[o.current]) {
				__load(__waterfall[o.current].path,__waterfall[o.current].type,__waterfall[o.current].charset,o.next);
			} else {
				o.bag.returns.push(o.current());
				o.next();
			}
		}
		this.next=function() {
			if(o.stackline.length==1 || o.stackline.length<1) {
				o.bag.complete=true;
				if(o.bag.oncomplete) {
					o.bag.oncomplete(o.bag.returns);
				}
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
	
	//in - main
	var __in=function() {
		var args=[].slice.call(arguments);
		
		//autoload the core files
		if(__configure.core && __configure.autoload && !__loaded[__configure]) {
			__add('__core',{path:__configure.core});
			args=['__core'].concat(args);
		}
		
		if(__configure.serial) {
			var blahlist=__analyze(args).reverse();
			var stack=new __stackline(blahlist);
			
			stack.start();
			return stack.bag;
		}
		
		if(typeof(args[args.length-1])==='function') {
			var callback=args.pop();
			var len=args.length;
			var bag={returns:null,complete:false};
		}
		
		for(var i=0;i<args.length;i++) {
			var blahlist=__analyze([args[i]]).reverse();
			__waterfall['__core'] && blahlist.unshift('__core');
			callback && blahlist.push(function() {
				if(!--len) {
					bag.returns=callback();
					bag.complete=true;
				}
			});
			new __stackline(blahlist).start();
		}
		
		return bag;
	};
	
	//in - contentLoaded
	var __contentLoaded=function(win,fn) {
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
		
		if(doc.readyState=='complete') {
			fn.call(win,'lazy');
		} else {
			if(doc.createEventObject && root.doScroll) {
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
		__contentLoaded(window,function() {
			__in.apply(this,args);
		});
	}
	
	//in - config
	var __config=function(name,conf) {
		__configure[name]=conf;
	}
	
	//in - inline css
	var __css=function(csstext) {
		var css=document.getElementById('in-inline-css');
		
		if(!css) {
			css=document.createElement('style');
			css.type='text/css';
			css.id='in-inline-css';
			__head.appendChild(css);
		}
		
		if(css.styleSheet) {
			css.styleSheet.cssText=css.styleSheet.cssText+csstext;
		} else {
			css.appendChild(document.createTextNode(csstext));
		}
	};
	
	//in - later
	var __later=function() {
		var args=[].slice.call(arguments);
		var timeout=args.shift();
		window.setTimeout(function() {
			__in.apply(this,args);
		},timeout);
	}
		
	//in - initialize
	void function() {
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
	
	//in - bind the method
	__in.exe=__in;
	__in.load=__load;
	__in.add=__add;
	__in.ready=__ready;
	__in.config=__config;
	__in.css=__css;
	__in.later=__later;
	this.In=__in;
}();
