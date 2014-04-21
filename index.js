var through = require('through2')
var duplexer = require('reduplexer')

var factory = module.exports = function(opts, fn){

	if(typeof(opts)==='function'){
		fn = opts
		opts = {}
	}

	var streamsOpen = 0

	var output = through(opts)
	var input = through(opts, function(chunk, enc, cb){
		fn(chunk, addStream, cb)
	}, function(){
		if(streamsOpen<=0){
			output.push(null)
		}
	})

	function removeStream(){
		streamsOpen--
		if(streamsOpen<=0){
			output.push(null)
		}
	}

	function addStream(stream){
		streamsOpen++
		stream.pipe(through(opts, function(chunk, enc, cb){
			output.push(chunk, enc, cb)
			cb()
		}, function(){
			removeStream()
		}))

		return stream
	}

	return duplexer(input, output, {
		objectMode:true
	})
}

factory.obj = function(fn){
	return factory({
		objectMode:true
	}, fn)
}