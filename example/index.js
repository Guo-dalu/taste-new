import { createMqConnection, pubMq, consumeMqAutoAck } from '../src'
import mqModel from '../src/model'

const vhost = 'dform'
const exchange = 'lalala'
const routingKey = 'wawawawa'

async function test() {
  const { channel } = await createMqConnection({ vhost })
  await consumeMqAutoAck({
    channel,
    exchange: { name: 'lalala', type: 'topic' },
    queue: { name: 'bulabula' },
    routingKey,
    consume: {
      consumeHandler: async msg => {
        console.log(msg.content.toString(), '-----msg')
      },
    },
    logConsume: 1,
  })
  setTimeout(() => {
    pubMq({
      channel,
      exchange,
      routingKey,
      exchangeType: 'topic',
      data: 's',
    })
  }, 1500)
}


async function verifyLog() {
  await test()
  const a = await mqModel.findOne({}).sort({ createtime: -1 })
  console.log({ a })
}

verifyLog()


process.on('unhandledRejection', e => {
  console.log(e)
})
