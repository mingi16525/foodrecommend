import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'foodrecommend-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

export const startConsumer = async (): Promise<void> => {
  const consumer = kafka.consumer({ groupId: 'recommendation-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'swipe-events', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString()) as {
        userId?: string;
        dishId?: string;
        action?: 'like' | 'skip';
      };

      if (!event.userId || !event.dishId || !['like', 'skip'].includes(event.action || '')) {
        console.warn('[Kafka Consumer] Ignoring invalid swipe event');
        return;
      }

      console.log('[Kafka Consumer] Received valid swipe event', {
        userId: event.userId,
        dishId: event.dishId,
        action: event.action
      });
    }
  });
};
