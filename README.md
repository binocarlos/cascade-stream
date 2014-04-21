cascade-stream
==============

A duplex stream that can lazily create child streams from a chunk and merge all outputs into one

## example

```js
var from = require('from2')
var through = require('through2')
var cascade = require('cascade-stream')

var source = from.obj(function(size, next){

})

var cs = cascade(function(chunk, add, next){

})
```