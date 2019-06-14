import assert from 'power-assert'
import { clearInterval } from 'timers'
import {
  createMqConnection, pubMq, pubMqWithLog, pubMqWithConfirm,
} from '../dist'
import { MqModel } from '../dist/logMq'

/* eslint-disable  no-underscore-dangle */

const vhost = 'dform'
const exchange = 'lalala'
const routingKey = 'wawawawa'

describe('test publish message', () => {
  let channel
  const data = Math.random().toFixed(10)
  let isConnect = false
  const connectHandler = () => {
    isConnect = true
  }
  before(async () => {
    const { channel: ch } = await createMqConnection({ vhost, onConnect: connectHandler })
    channel = ch
  })
  after(async () => {
    await MqModel.deleteMany({ data })
  })
  beforeEach(async () => {
    await MqModel.deleteMany({ data })
  })

  const retryInterval = (done, pubFunc, beforeDone) => {
    let timer
    const retry = () => {
      if (isConnect) {
        pubFunc({
          channel,
          exchange,
          routingKey,
          exchangeType: 'topic',
          data,
        })
          .then(async () => {
            clearInterval(timer)
            beforeDone && (await beforeDone())
            done()
          })
          .catch(e => {
            console.log('--------!!!!!!!', data)
            console.error(e)
            assert(!e)
          })
      }
    }
    timer = setInterval(retry, 400)
  }

  it('should publish a message successfully', done => {
    retryInterval(done, pubMq)
  })

  it('should log and publish a message successfully', done => {
    const beforeDone = async () => {
      const { status } = await MqModel.findOne({ data })
      assert.equal(status, 0)
    }
    retryInterval(done, pubMqWithLog, beforeDone)
  })

  it.only('should publish and confirm a message successfully', done => {
    let timer
    const beforeDone = () => new Promise(resolve => {
      MqModel.findOne({ data }).then(a => {
        if (a) {
          console.log(a)
          resolve(a)
        }
      })
    })
    const retry = () => {
      if (isConnect) {
        pubMqWithConfirm({
          channel,
          exchange,
          routingKey,
          exchangeType: 'topic',
          data,
        })
          .then(async () => {
            clearInterval(timer)
            beforeDone && (await beforeDone())
            done()
          })
          .catch(e => {
            console.log('--------!!!!!!!', data)
            console.error(e)
            assert(!e)
          })
      }
    }
    timer = setInterval(retry, 400)
  })
})
