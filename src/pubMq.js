import logger from './logger'

async function pubMq({
  channel,
  exchange,
  routingKey,
  data,
  logPub,
  warnPub = true,
  confirmPub,
  publishOptions,
  extras,
}) {
  const { name: exchangeName, type: exchangeType = 'topic', options } = exchange

  let logMq
  let logOptions
  if (logPub || warnPub || confirmPub) {
    logMq = (await import('./logMq')).log
    logOptions = {
      exchange: exchangeName,
      routingKey,
      type: 'publish',
      data,
      exchangeType,
      extras,
    }
  }
  const logPubIfNeeded = async () => {
    logPub && (await logMq({ ...logOptions, status: 0 }))
  }
  const warnPubIfNeeded = async () => {
    warnPub && (await logMq({ ...logOptions, status: 1 }))
  }
  const confirmPubIfNeeded = async () => {
    confirmPub && (await logMq({ ...logOptions, status: 2 }))
  }
  try {
    channel.addSetup(ch => {
      ch.assertExchange(exchangeName, exchangeType, { durable: true, ...options })
    })
    await logPubIfNeeded()
    if (!warnPub && !confirmPub) {
      await channel.publish(exchangeName, routingKey, data, publishOptions)
    } else {
      const publishPromise = () => new Promise(resolve => {
        channel.publish(exchangeName, routingKey, data, publishOptions, err => {
          if (err !== null) {
            logger.error(`msg nacked in publish, routingKey is ${routingKey}, ${err.stack}`)
            warnPubIfNeeded()
            resolve()
          } else {
            logger.info(`msg acked in publish, routingKey is ${routingKey}`)
            confirmPubIfNeeded()
            resolve()
          }
        })
      })
      await publishPromise()
    }
  } catch (e) {
    logger.error(`publish 消息错误, routing key is ${routingKey}`, e)
    warnPubIfNeeded()
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

const pubMqPersistent = args => pubMq({ ...args, publishOptions: { persistent: true } })

export {
  pubMqWithLog, pubMq, pubMqWithoutWarn, pubMqWithNone, pubMqWithConfirm, pubMqPersistent,
}
