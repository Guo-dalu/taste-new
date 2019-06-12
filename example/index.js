import { createMqConnection } from '../dist'

createMqConnection({ vhost: 'dform', onConnect: ({ connection, url }) => { console.log(url, connection) } })
