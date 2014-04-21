cascade-stream
==============

[![NPM](https://nodei.co/npm/cascade-stream.png?global=true)](https://nodei.co/npm/cascade-stream/)

[![Travis](http://img.shields.io/travis/binocarlos/cascade-stream.svg?style=flat)](https://travis-ci.org/binocarlos/cascade-stream)

A duplex stream that can lazily create child streams from a chunk and merge all outputs into one

## example

```js
var from = require('from2-array')
var through = require('through2')
var cascade = require('cascade-stream')

// create a stream for a single letter
function createLetterStream(letter){
	return from.obj([1,2,3].map(function(num){
		return letter + ':' + num
	}))
}

var source = from.obj(['a', 'b', 'c'])

var pipeline = cascade(function(chunk, add, next){
	add(createLetterStream(chunk))
	next()
})

var sink = through.obj(function(chunk, enc, cb){
	console.log(chunk);
	cb()
})

/*

	a1
	a2
	a3
	b1
	b2
	b3
	c1
	c2
	c3
	
*/
```

## license

MIT