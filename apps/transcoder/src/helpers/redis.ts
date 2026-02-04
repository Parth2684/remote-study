import { createClient, RedisClientType } from 'redis';

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL 
})

client.on("error", (err: any) => console.error(err));

(async () => {
  if (!client.isOpen) {
    await client.connect()
    console.log("connected to redis");
  }
})();

export default client;