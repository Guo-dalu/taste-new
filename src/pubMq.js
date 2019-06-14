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
    logMq = (await import('./logMq')).log
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
    channel.addSetup(ch => {
      ch.assertExchange(exchange, exchangeType, { durable: true })
    })
    if (!warnPub && !confirmPub) {
      await channel.publish(exchange, routingKey, data, { persistent })
    } else {
      const publishPromise = () => new Promise((resolve) => {
        channel.publish(exchange, routingKey, data, { persistent }, err => {
          if (err !== null) {
            logger.error(`msg nacked in publish, routingKey is ${routingKey}, ${err.stack}`)
            logMq({
              ...logOptions,
              status: 1,
            }).then(resolve)
          } else {
            logger.info(`msg acked in publish, routingKey is ${routingKey}`)
            if (confirmPub) {
              logMq({ ...logOptions, status: 2 }).then(resolve)
            }
          }
        })
      })
      await publishPromise()
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
