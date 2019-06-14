import MqModel from './model'

async function logMq(options) {
  const record = new MqModel(options)
  await record.save()
}


export { MqModel, logMq as log }
