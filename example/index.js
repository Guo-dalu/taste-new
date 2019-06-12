import {
  createMqConnection,
  // pubMq,
  pubMqWithConfirm,
} from '../dist'

const vhost = 'dform'
const exchange = 'lalala'
const routingKey = 'wawawawa'

async function test() {
  const { channel } = await createMqConnection({ vhost })

  await pubMqWithConfirm({
    channel,
    exchange,
    routingKey,
    exchangeType: 'topic',
    data: 0,
  })
}

test()

process.on('unhandledRejection', e => {
  console.log(e)
})
