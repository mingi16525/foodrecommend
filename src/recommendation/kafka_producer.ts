import { Kafka, Producer } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'foodrecommend-producer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer: Producer = kafka.producer();
let connected = false;

export const connectProducer = async (): Promise<void> => {
  if (connected) return;
  await producer.connect();
  connected = true;
};

export const disconnectProducer = async (): Promise<void> => {
  if (!connected) return;
  await producer.disconnect();
  connected = false;
};

export const emitSwipeEvent = async (
  userId: string,
  restaurantId: string,
  dishId: string,
  action: 'like' | 'skip'
): Promise<void> => {
  await connectProducer();
  await producer.send({
    topic: 'swipe-events',
    messages: [{
      key: userId,
      value: JSON.stringify({
        userId,
        restaurantId,
        dishId,
        action,
        timestamp: new Date().toISOString()
      })
    }]
  });
};
