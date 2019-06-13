import { createMqConnection, pubMq, consumeMqAutoAck } from '../dist'

const vhost = 'dform'
const exchange = 'lalala'
const routingKey = 'wawawawa'

async function test() {
  const { channel } = await createMqConnection({ vhost })
  await consumeMqAutoAck({
    channel,
    exchange: { name: 'lalala', type: 'topic' },
    queue: { name: 'bulabula', assertOptions: { exclusive: true } },
    routingKey,
    consume: {
      consumeHandler: async msg => {
        console.log(msg.content.toString(), '-----msg')
      },
    },
    confirmConsume: 1,
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

test()

process.on('unhandledRejection', e => {
  console.log(e)
})
