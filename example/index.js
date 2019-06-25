import { createMqConnection, pubMq, consumeMqAutoAck } from '../src'
import mqModel from '../src/model'

const vhost = 'dform'
const exchange = { name: 'lalala', type: 'topic' }
const routingKey = 'wawawawa'

async function test() {
  const { channel } = await createMqConnection({ vhost })
  await consumeMqAutoAck({
    channel,
    exchange,
    queue: { name: 'bulabula' },
    routingKey,
    consume: {
      consumeHandler: async msg => {
        console.log(msg.content.toString(), '-----msg')
      },
    },
  })
  setInterval(() => {
    pubMq({
      channel,
      exchange,
      routingKey,
      data: 's',
    })
  }, 1000)
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
