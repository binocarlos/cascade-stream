var test = require('tape')

var through = require('through2')
var from = require('from2-array')
var cascade = require('../')


test('cascade streams from single input', function(t) {

  // create a stream for a single letter
  function createLetterStream(letter){
    return from.obj([1,2,3].map(function(num){
      return letter + ':' + num
    }))
  }

  var source = from.obj(['a', 'b', 'c'])

  var trigger = cascade(function(chunk, add, next){
    add(createLetterStream(chunk))
    next()
  })

  var arr = []
  var sink = through.obj(function(chunk, enc, cb){
    arr.push(chunk)
    cb()
  }, function(){
    t.equal(arr.length, 9)

    t.equal(arr[0], 'a:1')
    t.equal(arr[3], 'b:1')
    t.equal(arr[4], 'b:2')
    t.equal(arr[5], 'b:3')

    t.end()
  })

  source.pipe(trigger).pipe(sink)
})
