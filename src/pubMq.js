import logger from './logger'

async function pubMq({
  channel,
  exchange,
  exchangeType,
  routingKey,
  data,
  logPub,
  warnPub = true,
  confirmPub,
  persistent,
}) {
  let logMq
  let logOptions
  if (logPub || warnPub || confirmPub) {
    logMq = (await import('./logMq')).default
    logOptions = {
      exchange,
      routingKey,
      type: 'publish',
      data,
      exchangeType,
    }
  }
  if (logPub) {
    await logMq({
      ...logOptions,
      status: 0,
    })
  }
  try {
    channel.addSetup(ch => ch.assertExchange(exchange, exchangeType, { durable: true }))
    if (!warnPub && !confirmPub) {
      await channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), { persistent })
    } else {
      channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), { persistent }, async err => {
        if (err !== null) {
          await logMq({
            ...logOptions,
            status: 1,
          })
        } else {
          logger.info(`msg acked, routingKey is ${routingKey}`)
          if (confirmPub) {
            await logMq({ ...logOptions, status: 2 })
          }
        }
      })
    }
  } catch (e) {
    logger.error(`publish 消息错误, routing key is ${routingKey}`, e)
    if (warnPub) {
      await logMq({
        ...logOptions,
        status: 1,
      })
    }
  }
}

const pubMqWithLog = args => pubMq({ ...args, logPub: true })

const pubMqWithoutWarn = args => pubMq({ ...args, warnPub: false })

const pubMqWithNone = args => pubMq({
  ...args,
  confirmPub: false,
  warnPub: false,
  logPub: false,
})

const pubMqWithConfirm = args => pubMq({ ...args, confirmPub: true })

const pubMqPersistent = args => pubMq({ ...args, persistent: true })

export {
  pubMqWithLog, pubMq, pubMqWithoutWarn, pubMqWithNone, pubMqWithConfirm, pubMqPersistent,
}
