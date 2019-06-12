import mongoose from 'mongoose'
import bluebird from 'bluebird'
import config from './config'
import logger from './logger'

logger.info(`mongodb Connection in xsl-amqp is:=====> ${config.mongodb}`)

mongoose.connect(
  config.mongodb,
  {
    poolSize: 10,
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 2000,
    useNewUrlParser: true,
  },
  err => {
    if (err) logger.error(`mongodb in xsl-amqp error ${err.stack}`)
  }
)

mongoose.Promise = bluebird

export default mongoose
