"""
Script to create/update MongoDB Atlas Vector Search index with filterable fields.

This script creates a vector search index on the embeddings collection that includes:
- Vector search on the 'embedding' field
- Filterable fields: difficulty, is_premium, topics

Note: MongoDB Atlas Vector Search indexes are typically created via:
1. Atlas UI (recommended for first-time setup)
2. Atlas Admin API (for programmatic creation)
3. This script provides the index definition JSON that can be used in Atlas UI

For programmatic creation via Atlas Admin API, you'll need:
- Atlas API public key
- Atlas API private key
- Project ID
- Cluster name
"""

import asyncio
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Add parent directory to path to import modules
import sys
sys.path.append(str(Path(__file__).parent.parent))

from db.connection import get_database, close_mongodb_connection
from db.collections import EMBEDDINGS_COLLECTION, VECTOR_INDEX_NAME

load_dotenv()

# Index definition for MongoDB Atlas Vector Search
VECTOR_INDEX_DEFINITION = {
    "name": VECTOR_INDEX_NAME,
    "type": "vectorSearch",
    "definition": {
        "fields": [
            {
                "type": "vector",
                "path": "embedding",
                "numDimensions": 1024,  # text-embedding-3-large uses 1024 dimensions
                "similarity": "cosine"
            },
            {
                "type": "string",
                "path": "difficulty",
                "filterable": True
            },
            {
                "type": "bool",
                "path": "is_premium",
                "filterable": True
            },
            {
                "type": "stringFacet",  # For array of strings
                "path": "topics",
                "filterable": True
            }
        ]
    }
}


def print_index_definition():
    """
    Print the index definition JSON that can be used in MongoDB Atlas UI.
    """
    print("=" * 80)
    print("MongoDB Atlas Vector Search Index Definition")
    print("=" * 80)
    print("\nUse this JSON definition in MongoDB Atlas UI:")
    print("\n1. Go to your Atlas cluster")
    print("2. Navigate to 'Search' tab")
    print("3. Click 'Create Search Index'")
    print("4. Select 'JSON Editor'")
    print("5. Paste the following JSON:\n")
    print(json.dumps(VECTOR_INDEX_DEFINITION, indent=2))
    print("\n" + "=" * 80)
    print("\nIndex Configuration Details:")
    print(f"  - Index Name: {VECTOR_INDEX_DEFINITION['name']}")
    print(f"  - Collection: {EMBEDDINGS_COLLECTION}")
    print(f"  - Vector Field: embedding (1024 dimensions, cosine similarity)")
    print(f"  - Filterable Fields:")
    print(f"    * difficulty (string)")
    print(f"    * is_premium (bool)")
    print(f"    * topics (stringFacet - array of strings)")
    print("=" * 80)


async def check_existing_index():
    """
    Check if the index already exists in the database.
    Note: This checks regular indexes, not Atlas Search indexes.
    Atlas Search indexes are managed separately and may not appear in regular index lists.
    """
    try:
        db = await get_database()
        collection = db[EMBEDDINGS_COLLECTION]
        
        # List regular indexes
        indexes = await collection.list_indexes().to_list(length=None)
        
        print("\nExisting regular indexes on embeddings collection:")
        if indexes:
            for idx in indexes:
                print(f"  - {idx.get('name', 'unnamed')}: {idx.get('key', {})}")
        else:
            print("  No regular indexes found")
        
        print("\nNote: Atlas Vector Search indexes are managed separately")
        print("      and won't appear in the regular index list.")
        print("      Check the Atlas UI Search tab to see vector search indexes.")
        
    except Exception as e:
        print(f"Error checking indexes: {str(e)}")


async def verify_collection_fields():
    """
    Verify that the embeddings collection has the required fields.
    """
    try:
        db = await get_database()
        collection = db[EMBEDDINGS_COLLECTION]
        
        # Sample a few documents to check field structure
        sample = await collection.find_one({})
        
        if not sample:
            print("⚠️  WARNING: Embeddings collection is empty or doesn't exist")
            return False
        
        print("\nSample document structure from embeddings collection:")
        print(f"  Fields present: {list(sample.keys())}")
        
        # Check for required fields
        required_fields = {
            "embedding": "vector field for search",
            "difficulty": "filterable field",
            "is_premium": "filterable field",
            "topics": "filterable field (array)"
        }
        
        missing_fields = []
        for field, description in required_fields.items():
            if field not in sample:
                missing_fields.append(f"{field} ({description})")
            else:
                field_type = type(sample[field]).__name__
                if field == "embedding":
                    print(f"  ✓ {field}: {field_type} (length: {len(sample[field]) if isinstance(sample[field], list) else 'N/A'})")
                elif field == "topics":
                    print(f"  ✓ {field}: {field_type} (array: {isinstance(sample[field], list)})")
                else:
                    print(f"  ✓ {field}: {field_type} = {sample[field]}")
        
        if missing_fields:
            print(f"\n⚠️  WARNING: Missing required fields:")
            for field in missing_fields:
                print(f"    - {field}")
            print("\nYou may need to update your embeddings collection to include these fields.")
            return False
        
        print("\n✓ All required fields are present in the collection")
        return True
        
    except Exception as e:
        print(f"Error verifying collection: {str(e)}")
        return False


async def main():
    """
    Main function to run the index creation script.
    """
    print("MongoDB Atlas Vector Search Index Setup")
    print("=" * 80)
    
    # Verify collection structure
    fields_ok = await verify_collection_fields()
    
    # Check existing indexes
    await check_existing_index()
    
    # Print index definition
    print_index_definition()
    
    print("\n" + "=" * 80)
    print("Next Steps:")
    print("=" * 80)
    print("\n1. Copy the JSON definition above")
    print("2. Go to MongoDB Atlas → Your Cluster → Search tab")
    print("3. Click 'Create Search Index'")
    print("4. Select 'JSON Editor'")
    print("5. Paste the JSON and configure:")
    print("   - Database: leetcode_questions")
    print("   - Collection: embeddings")
    print("6. Click 'Next' and 'Create Search Index'")
    print("\nThe index will take a few minutes to build.")
    print("Once complete, your vector search filters will work!")
    print("=" * 80)
    
    await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(main())

