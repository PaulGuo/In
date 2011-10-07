<pre>
 _____       
|_   _|      
  | |  _ __  
  | | | '_ \ 
 _| |_| | | |
|_____|_| |_|  v0.1.8 build 110428111007
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
Last Update: 2011-10-07
Namespace: window.In
Description: this a light framework that can manage dependency of the modules,
most important,you can load them on-demand,asynchronous and multi-threaded...
License: Apache License,Version 2.0
</pre>

Usage:
-----------

<pre><code>
In.add('mod1',{path:'url',type:'js',charset:'utf-8',rely:['mod2','mod3']});
In.use('mod1','mod2','mod3',function() {});
In('mod1','mod2','mod3',function() {}); -> short for In.use()
In.ready('mod1','mod2','mod3',function() {});
In.later(3000,'mod1','mod2','mod3',function() {});
In.css(inline-css);
In.config(name,value);
</code></pre>

Release:
-------------

<pre>
Version: 0.1.8
Build: 110428111007
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

*3、In() or In.use()*

旧版本队列内为顺序加载，如需向后兼容，请事先配置In.config('serial',true)更换为默认串行加载，新版本的队列默认为并行执行，队列中最后一个函数被视为回调函数，下面的代码会并行加载mod1,mod2,function，并立即执行，三者均加载完毕后执行回调函数。

<pre>
&lt;script type="text/javascript"&gt;
	//真正的加载顺序为 mod1 || mod2 || function -> function[callback]
	var demo=In('mod1','mod2',function() {
		console.log('我跟mod1和mod2是并行的关系');
	},function() {
		console.log('我是回调函数，他们都加载完毕才会触发我');
	});
&lt;/script&gt;
</pre>

*4、In.ready()*

domReady之后加载队列

<pre>
&lt;script type="text/javascript"&gt;
	In.ready('mod1','mod2',function() {
		console.log($);
	});
&lt;/script&gt;
</pre>

*5、In.later()*

延迟加载队列

<pre>
&lt;script type="text/javascript"&gt;
	//延迟3秒加载队列
	In.later(3000,'mod1','mod2',function() {
		console.log($);
	});
&lt;/script&gt;
</pre>

*6、In.css()*

动态注入CSS

<pre>
&lt;script type="text/javascript"&gt;
	In.css('body {background:yellow}');
&lt;/script&gt;
</pre>

*7、In.config()*

配置函数

<pre>
&lt;script type="text/javascript"&gt;
	//设置为串行加载模式，兼容旧的写法
	In.config('serial',true);
	//设置核心库，核心库会被所有模块依赖
	In.config('core','jquery 1.5.2-min.js');
&lt;/script&gt;
</pre>
