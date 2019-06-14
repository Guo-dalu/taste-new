import logger from './logger'

// 如果autoAck为true且没有明确指定noAck: true，则会自动处理ack
async function consumeMq({
  channel,
  exchange,
  queue,
  consume,
  routingKey,
  prefetch = 200,
  logConsume,
  warnConsume = true,
  confirmConsume,
  autoAck,
}) {
  const { name: exchangeName, type, options } = exchange
  const { name: queueName, assertOptions, bindOptions } = queue
  const { consumeHandler, options: consumeOptions } = consume

  let logMq
  let logOptions
  if (logConsume || warnConsume || confirmConsume) {
    // eslint-disable-next-line
    logMq = (await import('./logMq')).log
    logOptions = {
      exchange: exchangeName,
      routingKey,
      queue: queueName,
      type: 'consume',
      exchangeType: type,
    }
  }
  const logConsumeIfNeeded = async (data) => {
    logConsume && (await logMq({ ...logOptions, data, status: 3 }))
  }
  const warnConsumeIfNeeded = async (data) => {
    warnConsume && (await logMq({ ...logOptions, data, status: 4 }))
  }
  const confirmConsumeIfNeeded = async (data) => {
    confirmConsume && (await logMq({ ...logOptions, data, status: 5 }))
  }
  try {
    channel.addSetup(async ch => {
      await Promise.all([
        ch.prefetch(prefetch),
        ch.assertExchange(exchangeName, type, { durable: true, ...options }),
        ch.assertQueue(queueName, { durable: true, ...assertOptions }),
      ])
      await ch.bindQueue(queueName, exchangeName, routingKey, { ...bindOptions })
      await ch.consume(
        queueName,
        async msg => {
          await logConsumeIfNeeded(msg)
          const shouldAck = autoAck && !consumeOptions?.noAck
          // 自动处理ack
          try {
            await consumeHandler.apply(consume, [msg, { channel: ch, exchange, queue }])
            shouldAck && await ch.ack(msg)
            logger.info(`msg consumed and acked in queue  ${queueName}`)
            await confirmConsumeIfNeeded(msg)
          } catch (err) {
            logger.info(`msg consumed with error and nacked in queue  ${queueName} ${err.stack}`)
            shouldAck && await ch.nack(msg, false, false)
            await warnConsumeIfNeeded(msg)
          }
        },
        { noAck: false, ...consumeOptions }
      )
    })

    await channel.waitForConnect()
    logger.info('----- mq Listening for messages')
  } catch (e) {
    logger.error(`consume 消息错误, ${queueName}, ${e.stack}`)
    await warnConsumeIfNeeded(e)
  }
}

const consumeMqAutoAck = args => consumeMq({ ...args, autoAck: true })

const consumeMqWithNone = args => consumeMq({
  ...args,
  autoAck: false,
  logConsume: false,
  warnConsume: false,
  confirmConsume: false,
})

const consumeMqAutoAckWithConfirm = args => consumeMq({ ...args, confirmConsume: true, autoAck: true })

export {
  consumeMq, consumeMqAutoAck, consumeMqWithNone, consumeMqAutoAckWithConfirm,
}
