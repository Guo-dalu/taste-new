import assert from 'power-assert'
import { setInterval } from 'timers'
import {
  createMqConnection, pubMq, consumeMqAutoAck, consumeMqAutoAckWithConfirm, consumeMqWithLog,
} from '../dist'
import { MqModel } from '../dist/logMq'

/* eslint-disable  no-underscore-dangle */

const vhost = 'dform'
const routingKeys = ['wawawawa', 'xmgtest1', 'xmgtest2', 'xmgtest3']
const exchange = { name: 'lalala', type: 'topic' }
const queues = ['bulabula', 'bulabula1', 'bulabula2', 'bulabula3']

describe('test consume message', async () => {
  let channel
  const extras = Math.random().toFixed(10)
  let flag = 0

  const pubTest = async n => {
    await pubMq({
      channel,
      exchange,
      routingKey: routingKeys[n],
      data: extras,
      extras,
    })
  }

  before(async () => {
    const { channel: ch } = await createMqConnection({ vhost })
    channel = ch
  })
  after(async () => {
    console.log({ extras })
    await MqModel.deleteMany({ extras })
  })

  beforeEach(async () => {
    flag = 0
    await MqModel.deleteMany({ extras })
  })

  const retry = (callback, redo) => {
    let timer = null

    const timertest = async () => {
      const result = await redo()
      if (result) {
        clearInterval(timer)
        callback()
      }
    }
    timer = setInterval(timertest, 500)
  }

  const consumeTestOptions = [0, 1, 2, 3].map(n => ({
    exchange,
    queue: { name: queues[n] },
    routingKey: routingKeys[n],
    consume: {
      consumeHandler: async msg => {
        console.log('consume------', n)
        flag = msg.content.toString()
        if (n === 3) {
          throw new Error('faild in 3 test')
        }
      },
    },
    extras,
  }))

  const queryConfirm = status => async () => {
    const r = await MqModel.findOne({ extras })
    r && assert(r.status === status)
    return r?.status === status && JSON.parse(flag) === extras
  }

  it('should consume a message successfully', done => {
    consumeMqAutoAck({ channel, ...consumeTestOptions[0] })
    pubTest(0)
    retry(done, () => JSON.parse(flag) === extras)
  })

  it('should consume a message with confirm successfully', done => {
    consumeMqAutoAckWithConfirm({ channel, ...consumeTestOptions[1] })
    pubTest(1)
    retry(done, queryConfirm(5))
  })

  it('should consume a message with log successfully', done => {
    consumeMqWithLog({ channel, ...consumeTestOptions[2], autoAck: true })
    pubTest(2)
    retry(done, queryConfirm(3))
  })

  it('should not consume a message successfully and log a warn', done => {
    consumeMqAutoAck({ channel, ...consumeTestOptions[3] })
    pubTest(3)
    retry(done, queryConfirm(4))
  })
})
