import { EventCollector } from '../src/recommendation/eventCollector';
import { featureStore } from '../src/recommendation/featureStore';

describe('EventCollector', () => {
  afterEach(() => jest.restoreAllMocks());

  it('falls back to FeatureStore when Kafka is disconnected', async () => {
    const collector = new EventCollector();
    const update = jest.spyOn(featureStore, 'updateUserFeatures').mockResolvedValue(undefined);

    await collector.trackSwipe('u1', 'd1', 'like');

    expect(update).toHaveBeenCalledWith('u1', 'd1', 'like');
  });

  it('sends events to Kafka when connected', async () => {
    const collector = new EventCollector();
    const producer = (collector as unknown as { producer: { send: jest.Mock } }).producer;
    const update = jest.spyOn(featureStore, 'updateUserFeatures').mockResolvedValue(undefined);
    (collector as unknown as { isConnected: boolean }).isConnected = true;

    await collector.trackSwipe('u1', 'd1', 'skip');

    expect(producer.send).toHaveBeenCalledWith(expect.objectContaining({
      topic: 'swipe-events',
      messages: [expect.objectContaining({ value: expect.stringContaining('"action":"skip"') })]
    }));
    expect(update).not.toHaveBeenCalled();
  });
});
