var through = require('through2')
var duplexer = require('reduplexer')

var factory = module.exports = function(opts, fn){

	if(typeof(opts)==='function'){
		fn = opts
		opts = {}
	}

	var id = 0
	var streams = {}

	var output = through(opts)
	var input = through(opts, function(chunk, enc, cb){
		fn(chunk, addStream, cb)
	}, function(){

		console.log('-------------------------------------------');
		console.log('FDINISHG');

		if(Object.keys(streams).length<=0){
			output.push(null)
		}
		else{
			Object.keys(streams).forEach(function(sid){
				var s = streams[sid]
				if(s.end){
					s.end()	
				}
			})
		}
	})

	function removeStream(sid){
		delete(streams[sid])
		if(Object.keys(streams).length<=0){
			output.push(null)
			streams = null
		}
	}

	function addStream(stream){
		var sid = id
		id++

		var wrapper = stream.pipe(through(opts, function(chunk, enc, cb){
			output.push(chunk, enc, cb)
			cb()
		}, function(){
			if(stream.end){
				stream.end()	
			}
			removeStream(sid)
		}))

		streams[sid] = wrapper
		

		return wrapper
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