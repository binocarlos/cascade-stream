var test = require('tape')

var through = require('through2')
var from = require('from2-array')
var fnfrom = require('from2')
var cascade = require('../')


test('cascade streams from single input in object mode', function(t) {

  // create a stream for a single letter
  function createLetterStream(letter){
    return from.obj([1,2,3].map(function(num){
      return letter + ':' + num
    }))
  }

  var source = from.obj(['a', 'b', 'c'])

  var trigger = cascade.obj(function(chunk, add, next){
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


test('cascade streams from single input in normal mode', function(t) {

  // create a stream for a single letter
  function createLetterStream(letter){
    return from.obj([1,2,3].map(function(num){
      return letter + ':' + num
    }))
  }

  var source = from(['a', 'b', 'c'])

  var trigger = cascade(function(chunk, add, next){
    add(createLetterStream(chunk))
    next()
  })

  var arr = []
  var sink = through(function(chunk, enc, cb){
    arr.push(chunk)
    cb()
  }, function(){
    t.equal(arr.length, 9)
    arr = arr.map(function(a){
      return a.toString()
    })

    t.equal(arr[0], 'a:1')
    t.equal(arr[3], 'b:1')
    t.equal(arr[4], 'b:2')
    t.equal(arr[5], 'b:3')

    t.end()
  })

  source.pipe(trigger).pipe(sink)
})


test('finish even with no output', function(t) {

  // create a stream for a single letter
  function createLetterStream(letter){
    return from.obj([].map(function(num){
      return letter + ':' + num
    }))
  }

  var source = from(['a', 'b', 'c'])

  var trigger = cascade(function(chunk, add, next){
    add(createLetterStream(chunk))
    next()
  })

  var arr = []
  var sink = through(function(chunk, enc, cb){
    arr.push(chunk)
    cb()
  }, function(){
    t.equal(arr.length, 0)
    

    t.end()
  })

  source.pipe(trigger).pipe(sink)
})


test('finish even with no streams', function(t) {

  var source = from(['a', 'b', 'c'])

  var trigger = cascade(function(chunk, add, next){
    next()
  })

  var arr = []
  var sink = through(function(chunk, enc, cb){
    arr.push(chunk)
    cb()
  }, function(){
    t.equal(arr.length, 0)
    

    t.end()
  })

  source.pipe(trigger).pipe(sink)
})


test('allow arbritrary stream to be added outside the scope', function(t) {

  // create a stream for a single letter
  function createLetterStream(letter){
    return from.obj([1,2,3].map(function(num){
      return letter + ':' + num
    }))
  }

  var source = from(['a', 'b', 'c'])

  var trigger = cascade(function(chunk, add, next){
    add(createLetterStream(chunk))
    next()
  })

  var arr = []
  var sink = through(function(chunk, enc, cb){
    arr.push(chunk)
    if(chunk.toString()=='b:1'){
      trigger.add(createLetterStream('d'))
    }
    cb()
  }, function(){
    t.equal(arr.length, 12)
    arr = arr.map(function(a){
      return a.toString()
    })
    t.equal(arr[2], 'a:3')
    t.equal(arr[6], 'd:1')


    t.end()
  })

  source.pipe(trigger).pipe(sink)
})


test('wait for inner streams to finish before triggering the end', function(t) {

  function createDelayStream(letter){
    var counter = 0;
    return fnfrom(function(size, next){
      setTimeout(function(){
        counter++
        if(counter<=3){
          next(null, letter + counter)
        }
        else{
          next()
        }  
      },100)
      
    })
  }

  var source = from(['a', 'b', 'c'])

  var trigger = cascade(function(chunk, add, next){
    add(createDelayStream(chunk))
    next()
  })

  var arr = []
  var sink = through(function(chunk, enc, cb){
    arr.push(chunk)
    cb()
  }, function(){
    
    arr = arr.map(function(a){
      return a.toString()
    })

    arr.sort()

    t.equal(arr.length, 9)

    t.deepEqual(arr, [
      'a1',
      'a2',
      'a3',
      'b1',
      'b2',
      'b3',
      'c1',
      'c2',
      'c3'
    ])
    

    t.end()
  })

  source.pipe(trigger).pipe(sink)
})
