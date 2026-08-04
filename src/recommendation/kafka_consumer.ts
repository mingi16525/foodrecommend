/* eslint-disable */
// Mock kafkajs import to prevent compilation errors if not installed
// In a real scenario, this would be: import { Kafka, Consumer } from 'kafkajs';
class MockKafkaConsumer {
  consumer({ groupId }: { groupId: string }) {
    return {
      connect: async () => console.log(`Mock Kafka Consumer connected for group: ${groupId}`),
      subscribe: async ({ topic, fromBeginning }: any) => console.log(`Subscribed to topic: ${topic}`),
      run: async ({ eachMessage }: any) => {
        console.log('Mock Kafka Consumer running...');
        // Mock a single message being processed
        setTimeout(() => {
          eachMessage({
            topic: 'user-swipe-events',
            partition: 0,
            message: { value: Buffer.from(JSON.stringify({ mock: true, action: 'like' })) }
          });
        }, 1000);
      },
      disconnect: async () => console.log('Mock Kafka Consumer disconnected')
    };
  }
}

const kafka = new MockKafkaConsumer(); // Replace with actual Kafka instance
const consumer = kafka.consumer({ groupId: 'recommendation-group' });

export const startConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-swipe-events', fromBeginning: true });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString());
        console.log(`[Kafka Consumer] Received event from ${topic}:`, event);
        
        // TODO: In Phase 3.2 (AI Pipeline), push this event to an aggregation store 
        // or trigger vector re-calculation based on user actions.
      },
    });
  } catch (error) {
    console.error('Error starting Kafka consumer', error);
  }
};
