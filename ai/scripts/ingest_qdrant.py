import json
import uuid

# In a real environment, you would use:
# from qdrant_client import QdrantClient
# from qdrant_client.models import Distance, VectorParams, PointStruct

class MockQdrantClient:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        print(f"Connected to Mock Qdrant at {host}:{port}")
        
    def recreate_collection(self, collection_name, vectors_config):
        print(f"Recreated collection '{collection_name}' with config: {vectors_config}")
        
    def upsert(self, collection_name, points):
        print(f"Upserted {len(points)} points to collection '{collection_name}'")

def ingest_to_qdrant():
    try:
        # client = QdrantClient(host="localhost", port=6333)
        client = MockQdrantClient(host="localhost", port=6333)
        
        collection_name = "dishes"
        
        # client.recreate_collection(
        #     collection_name=collection_name,
        #     vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        # )
        
        # Mocking the configuration
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config={"size": 384, "distance": "Cosine"}
        )
        
        # Load the generated embeddings
        input_file = "dish_embeddings.json"
        with open(input_file, "r", encoding="utf-8") as f:
            dishes = json.load(f)
            
        points = []
        for dish in dishes:
            # point = PointStruct(
            #     id=str(uuid.uuid5(uuid.NAMESPACE_DNS, dish['id'])),
            #     vector=dish['embedding'],
            #     payload={"name": dish["name"], "restaurant_id": dish["restaurant_id"]}
            # )
            point = {
                "id": dish['id'],
                "vector_len": len(dish['embedding']),
                "payload": {"name": dish["name"], "restaurant_id": dish["restaurant_id"]}
            }
            points.append(point)
            
        # Batch ingest points
        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            client.upsert(collection_name=collection_name, points=batch)
            
        print("Ingestion complete!")
        
    except FileNotFoundError:
        print("Error: dish_embeddings.json not found. Run generate_embeddings.py first.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    print("Starting Qdrant ingestion...")
    ingest_to_qdrant()
