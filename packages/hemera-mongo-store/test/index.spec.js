'use strict'

const Hemera = require('./../../hemera')
const HemeraMongoStore = require('./../index')
const Nats = require('nats')
const Code = require('code')
const HemeraTestsuite = require('hemera-testsuite')

const expect = Code.expect

describe('Hemera-mongo-store', function () {
  let PORT = 6243
  let noAuthUrl = 'nats://localhost:' + PORT
  const topic = 'mongo-store'
  const testCollection = 'test'
  let server
  let hemera

  before(function (done) {
    server = HemeraTestsuite.start_server(PORT, {}, () => {
      const nats = Nats.connect(noAuthUrl)
      hemera = new Hemera(nats, {
        logLevel: 'info'
      })
      hemera.use(HemeraMongoStore, {
        mongo: {
          url: 'mongodb://localhost:27017/test'
        }
      })
      hemera.ready(() => {
        hemera.act({
          topic,
          cmd: 'dropCollection',
          collection: testCollection
        }, function (err, resp) {
          done()
        })
      })
    })
  })

  after(function (done) {
    hemera.close()
    server.kill()
    done()
  })

  it('create', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'peter'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()
      expect(resp._id).to.be.exists()

      done()
    })
  })

  it('update', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'peter'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()

      hemera.act({
        topic,
        cmd: 'update',
        collection: testCollection,
        data: {
          $set: {
            name: 'nadja'
          }
        },
        query: {
          name: 'peter'
        }
      }, function (err, resp) {
        expect(err).to.be.not.exists()
        expect(resp).to.be.an.object()
        expect(resp._id).to.be.exists()
        expect(resp.name).to.be.exists()

        done()
      })
    })
  })

  it('updatebyId', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'peter'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()

      hemera.act({
        topic,
        cmd: 'updateById',
        collection: testCollection,
        data: {
          $set: {
            name: 'nadja'
          }
        },
        id: resp._id
      }, function (err, resp) {
        expect(err).to.be.not.exists()
        expect(resp).to.be.an.object()
        expect(resp._id).to.be.exists()
        expect(resp.name).to.be.exists()

        done()
      })
    })
  })

  it('remove', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'olaf'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()

      hemera.act({
        topic,
        cmd: 'remove',
        collection: testCollection,
        query: {
          name: 'olaf'
        }
      }, function (err, resp) {
        expect(err).to.be.not.exists()
        expect(resp).to.be.an.object()
        expect(resp.deletedCount).to.be.equals(1)

        done()
      })
    })
  })

  it('removeById', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'olaf'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()

      hemera.act({
        topic,
        cmd: 'removeById',
        collection: testCollection,
        id: resp._id
      }, function (err, resp) {
        expect(err).to.be.not.exists()
        expect(resp._id).to.be.exists()
        expect(resp.name).to.be.exists()

        done()
      })
    })
  })

  it('findById', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'jens'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()

      hemera.act({
        topic,
        cmd: 'findById',
        collection: testCollection,
        id: resp._id
      }, function (err, resp) {
        expect(err).to.be.not.exists()
        expect(resp._id).to.be.exists()
        expect(resp.name).to.be.exists()

        done()
      })
    })
  })

  it('find', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'jens'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()

      hemera.act({
        topic,
        cmd: 'find',
        collection: testCollection,
        query: {}
      }, function (err, resp) {
        expect(err).to.be.not.exists()
        expect(resp.result).to.be.an.array()
        expect(resp.result[0]._id).to.be.exists()
        expect(resp.result[0].name).to.be.exists()
        done()
      })
    })
  })

  it('find with pagination', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'jens'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()

      hemera.act({
        topic,
        cmd: 'find',
        collection: testCollection,
        query: {},
        options: {
          limit: 10,
          offset: 2
        }
      }, function (err, resp) {
        expect(err).to.be.not.exists()
        expect(resp.result).to.be.an.array()
        expect(resp.result[0]._id).to.be.exists()
        expect(resp.result[0].name).to.be.exists()
        expect(resp.limit).to.be.equals(10)
        expect(resp.offset).to.be.equals(2)
        done()
      })
    })
  })

  it('replace', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'nadine'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()

      hemera.act({
        topic,
        cmd: 'replace',
        collection: testCollection,
        data: {
          $set: {
            name: 'nadja'
          }
        },
        query: {}
      }, function (err, resp) {
        expect(err).to.be.not.exists()
        expect(resp).to.be.an.object()
        expect(resp.matchedCount).to.be.exists()
        expect(resp.modifiedCount).to.be.exists()
        expect(resp.upsertedCount).to.be.exists()

        done()
      })
    })
  })

  it('replaceById', function (done) {
    hemera.act({
      topic,
      cmd: 'create',
      collection: testCollection,
      data: {
        name: 'nadja'
      }
    }, function (err, resp) {
      expect(err).to.be.not.exists()
      expect(resp).to.be.an.object()

      hemera.act({
        topic,
        cmd: 'replaceById',
        collection: testCollection,
        data: {
          name: 'nadja'
        },
        id: resp._id
      }, function (err, resp) {
        expect(err).to.be.not.exists()
        expect(resp._id).to.be.exists()
        expect(resp.name).to.be.exists()
        done()
      })
    })
  })
})
