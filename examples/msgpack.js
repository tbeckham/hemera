'use strict'

const Hemera = require('./../packages/hemera')
const nats = require('nats').connect({
  preserveBuffers: true
})
const HemeraMsgpack = require('./../packages/hemera-msgpack')

const hemera = new Hemera(nats, {
  logLevel: 'info'
})

hemera.use(HemeraMsgpack)

hemera.ready(() => {
  /**
   * Your Implementations
   */
  hemera.add({
    topic: 'math',
    cmd: 'add'
  }, (req, cb) => {
    cb(null, req.a + req.b)
  })

  hemera.act({
    topic: 'math',
    cmd: 'add',
    a: 1,
    b: 20
  }, function (err, resp) {
    this.log.info(resp, 'Result')
  })
})
