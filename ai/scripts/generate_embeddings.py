import json
import random

def generate_mock_embeddings():
    """
    Mock function to generate vector embeddings.
    In a real scenario, this would use a model like sentence-transformers:
    
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(texts)
    """
    
    # Mocking data for 500 dishes
    dishes = []
    for i in range(1, 501):
        dish = {
            "id": f"dish-{i}",
            "name": f"Mock Dish {i}",
            "restaurant_id": f"restaurant-{random.randint(1, 100)}",
            # Generate a 384-dimensional vector (like MiniLM)
            "embedding": [random.uniform(-1, 1) for _ in range(384)]
        }
        dishes.append(dish)
        
    print(f"Generated embeddings for {len(dishes)} dishes.")
    
    # Save to a temporary JSON file to be used by ingest_qdrant.py
    output_file = "dish_embeddings.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(dishes, f)
        
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    print("Starting vector generation...")
    generate_mock_embeddings()
