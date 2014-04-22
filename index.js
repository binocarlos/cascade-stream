var through = require('through2')
var duplexer = require('reduplexer')

var factory = module.exports = function(opts, fn, finishfn){

	if(typeof(opts)==='function'){
		finishfn = fn
		fn = opts
		opts = {}
	}

	var id = 0
	var streams = {}

	var output = through(opts)
	var input = through(opts, function(chunk, enc, cb){
		fn(chunk, addStream, cb)
	}, function(){

		finishfn && finishfn()
		removeStream(1)
		
	})

	id++
	streams[id] = input

	function removeStream(sid){
		delete(streams[sid])
		if(Object.keys(streams).length<=0){
			output.end()
			streams = null
		}
	}

	function addStream(stream){
		id++
		var sid = id
		
		var wrapper = stream.pipe(through(opts, function(chunk, enc, cb){
			output.write(chunk)
			cb()
		}, function(){
			if(stream.end){
				stream.end()
			}
			removeStream(sid)
		}))

		streams[sid] = stream
		

		return wrapper
	}

	var cascade = duplexer(input, output, {
		objectMode:true
	})

	cascade.add = addStream

	return cascade
}

factory.obj = function(fn, finishfn){
	return factory({
		objectMode:true
	}, fn)
}