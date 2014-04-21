var through = require('through2')
var duplexer = require('reduplexer')

var factory = module.exports = function(fn){

	var streamsOpen = 0

	var input = through.obj(function(chunk, enc, cb){
		fn(chunk, addStream, cb)
	})

	var output = through.obj()

	function addStream(stream){
		streamsOpen++

		stream.pipe(through.obj(function(chunk, enc, cb){
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