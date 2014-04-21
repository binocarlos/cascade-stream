var through = require('through2')
var duplexer = require('reduplexer')

var factory = module.exports = function(opts, fn){

	if(typeof(opts)==='function'){
		fn = opts
		opts = {}
	}

	var streamsOpen = 0

	var input = through(opts, function(chunk, enc, cb){
		fn(chunk, addStream, cb)
	})

	var output = through(opts)

	function addStream(stream){
		streamsOpen++

		stream.pipe(through(opts, function(chunk, enc, cb){
			output.push(chunk)
			cb()
		}, function(){
			streamsOpen--
			if(streamsOpen<=0){
				output.push(null)
			}
		}))
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