const config = {
  development: {
    amqpDomain: 'amqp://guest:guest@192.168.84.76:5672',
    mongodb: 'mongodb://platform2:12345678@192.168.64.65:27017/platform',
  },
  test: {
    amqpDomain: 'amqp://guest:guest@192.168.84.76:5672',
    mongodb: 'mongodb://platform2:12345678@192.168.64.65:27017/platform',
  },
  production: {
    amqpDomain: 'amqp://guest:guest@192.168.20.159:5672',
    mongodb: 'mongodb://platform:43&lGsa@192.168.20.163:27017/platform',
  },
}

config.unittest = config.test

let env
if (process.env.EGG_SERVER_ENV === 'prod' || process.env.EGG_SERVER_ENV === 'production') {
  env = 'production'
} else {
  env = process.env.EGG_SERVER_ENV || process.env.NODE_ENV || 'development'
}
export default config[env]
