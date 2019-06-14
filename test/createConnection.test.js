import assert from 'power-assert'
import { createMqConnection } from '../dist'

const vhost = 'dform'

/* eslint-disable  no-underscore-dangle */

describe('test create connection', () => {
  it('should get a single active connection that can be closed', async () => {
    const { connection, channel } = await createMqConnection({ vhost, hasJsonChannel: false })
    assert(connection)
    assert(!connection._closed)
    assert.equal(channel, null)
    await connection.close()
    assert(connection._closed)
  })

  it('should get a channel as well', async () => {
    const { channel, connection } = await createMqConnection({ vhost })
    assert(channel)
    assert(channel._json)
    await channel.close()
    await connection.close()
  })
})
