import mongodb from './mongodb'

const { Schema } = mongodb

const MqSchema = new Schema({
  type: { type: String, require: true },
  exchange: { type: String, require: true },
  exchangeType: { type: String, require: true },
  routingKey: { type: String, require: true },
  queue: { type: String, require: true },
  data: { },
  // 0 logPub 记录做了发消息的动作 1 warnpub 2 confirmPub 发的消息rabbitmq收到了 3 logConsume 4 warnConsume 5 confirmConsume
  status: { type: Number, default: -1, require: true },
  createtime: { type: Date, default: Date.now, require: true },
  updatetime: { type: Date, default: Date.now, require: true },
}, { timestamps: { createdAt: 'createtime', updatedAt: 'updatetime' } })

const MqModel = mongodb.model('mq_log', MqSchema)

async function logMq(options) {
  const record = new MqModel(options)
  await record.save()
}

export default logMq
