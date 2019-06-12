import amqp from 'amqp-connection-manager'
import config from './config'
import logger from './logger'

export default async ({ vhost, onConnect, onDisConnect }) => {
  const url = `${config.amqpDomain}/${vhost}`
  try {
    const connection = await amqp.connect(url)
    const channel = connection.createChannel()

    const connectHandler = typeof onConnect === 'function' ? onConnect.bind(onConnect, { connection, channel, url })
      : () => logger.info(`Connected!-------rabbit mq in vhost ${vhost}`)
    connection.on('connect', connectHandler)

    const disconnectHandler = typeof onDisConnect === 'function'
      ? onDisConnect.bind(onDisConnect, { connection, channel, url })
      : params => logger.info(`Disconnected-----rabbit mq in vhost ${vhost}`, params.err.stack)

    connection.on('disconnect', disconnectHandler)
    return { connection, channel }
  } catch (e) {
    logger.error(`consume 消息错误, ${vhost}, ${e.stack}`)
  }
}
