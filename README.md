<pre>
 _____       
|_   _|      
  | |  _ __  
  | | | '_ \ 
 _| |_| | | |
|_____|_| |_|  v0.12 build 110723
</pre>

About the author
---------------------

<pre>
Guokai,1988-08-08
Beijing - Chaoyang
[Benben Blog](http://benben.cc/)
</pre>

Overview the In.js
-----------------------

<pre>
Author: Guokai
Email/Gtalk: badkaikai@gmail.com
Create Datetime: 2011-04-28
Namespace: window.In
Description: this a light framework that can manage dependency of the modules,
most important,you can load them on-demand,asynchronous and multi-threaded...
License: Apache License,Version 2.0
</pre>

Usage:
-----------

<pre><code>
In.add('name',{path:'url here',type:'js',charset:'utf-8',rely:['a','b']});
In.exe('name','a','b',function() {...});
In('name','a','b',function() {...}); -> recommended usage equivalent to In.exe()
In.ready('name','a','b',function() {...});
In.watch(o,'p',function(prop,old,new) {...});
In.unwatch(o,'p');
</code></pre>

Release:
-------------

<pre>
Version: 0.12
Build: 110723
</pre>

Examples：
--------------

*1、import In.js to your webpage*

例如：底层框架为jQuery 1.5.2-min.js，并引用in时自动加载。

<pre>
&lt;script type="text/javascript" src="in.js" autoload="true" core="jquery 1.5.2-min.js"&gt;&lt;/script&gt;
</pre>

*2、In.add()*

加载三个待执行的javascript模块，分别为mod1、mod2、mod3，其中mod2依赖于mod3.

<pre>
&lt;script type="text/javascript"&gt;
	In.add('mod1',{path:'mod1.js',type:'js',charset:'utf-8'});
	In.add('mod2',{path:'mod2.js',type:'js',charset:'utf-8',rely:['mod3']});
	In.add('mod3',{path:'mod3.js',type:'js',charset:'utf-8'});
&lt;/script&gt;
</pre>

*3、In() or In.exe()*

顺序执行mod1,mod2,function，立即执行

<pre>
&lt;script type="text/javascript"&gt;
	//真正的加载顺序为 mod1 -> mod2 -> mod3 -> function -> function
	var demo=In('mod1','mod2',function() {
		alert('no return value');
	},function() {
		alert($);
		return 'hello';
	});
	//demo={returns:[undefined,'hello'],complete:true}
&lt;/script&gt;
</pre>

*4、In.ready()*

domReady之后加载队列

<pre>
&lt;script type="text/javascript"&gt;
	In.ready('mod1','mod2',function() {
		alert($);
	});
&lt;/script&gt;
</pre>

*5、In.watch()*

监视某一变量值

<pre>
&lt;script type="text/javascript"&gt;
	var o={p:1};
	In.watch(o,'p',function(prop,old,new) {
		console.log(prop);
		console.log(old);
		console.log(new);
	});
	o.p=2;
	-----console-----
	>'p'
	>1
	>2
&lt;/script&gt;
</pre>

*6、In.unwatch()*

取消对某一变量的监视

<pre>
&lt;script type="text/javascript"&gt;
	In.watch(o,'p');
&lt;/script&gt;
</pre>