import assert from 'power-assert'
import {
  createMqConnection, pubMq, pubMqWithLog, pubMqWithConfirm,
} from '../dist'
import { MqModel } from '../dist/logMq'

/* eslint-disable  no-underscore-dangle */

const vhost = 'dform'
const exchange = { name: 'lalala' }
const routingKey = 'wawawawa'

describe('test publish message', () => {
  let channel
  const data = Math.random().toFixed(10)

  before(async () => {
    const { channel: ch } = await createMqConnection({ vhost })
    channel = ch
  })
  after(async () => {
    console.log({ data })
    await MqModel.deleteMany({ $or: [{ data }, { extras: data }] })
  })
  beforeEach(async () => {
    await MqModel.deleteMany({ data })
  })

  const createPubOption = () => ({
    channel,
    exchange,
    routingKey,
    data,
    extras: data,
  })

  it('should publish a message successfully', async () => {
    await pubMq(createPubOption())
  })

  it('should log and publish a message successfully', async () => {
    await pubMqWithLog(createPubOption())
    const { status } = await MqModel.findOne({ data })
    assert.equal(status, 0)
  })

  it('should publish and confirm a message successfully', async () => {
    await pubMqWithConfirm(createPubOption())
    const { status } = await MqModel.findOne({ data })
    assert.equal(status, 2)
  })

  it('should not publish a message, and log warn', async () => {
    const extras = data
    await pubMq({
      ...createPubOption(),
      data: () => {},
    })
    const { status } = await MqModel.findOne({ extras })
    assert.equal(status, 1)
  })
})
