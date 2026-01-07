"""
Vector search service for MongoDB.

This module handles semantic vector search queries against the MongoDB
vector database to find similar question chunks.
"""

from typing import List, Dict, Any, Set, Optional
from db.connection import get_database
from db.collections import (
    EMBEDDINGS_COLLECTION,
    METADATA_COLLECTION,
    VECTOR_INDEX_NAME,
)
from services.embeddings import get_embedding


async def get_query_results(
    query: str,
    difficulty: Optional[List[str]] = None,
    exclude_premium: Optional[bool] = None,
    include_tags: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Get vector search results for a query string with optional filters.
    
    Performs vector search to find similar chunks, extracts unique qids,
    and fetches metadata (qid, title, difficulty, tags) from the metadata collection.
    
    Args:
        query: Query string to search for
        difficulty: Optional list of difficulties to filter by (Easy, Medium, Hard)
        exclude_premium: Optional flag to exclude premium problems
        include_tags: Optional list of tags - only show questions with at least one of these tags
    
    Returns:
        List of matching documents with qid, title, difficulty, and tags
    
    Raises:
        Exception: If vector search fails
    """
    try:
        # Get embedding for the query
        query_embedding = await get_embedding(query)
        
        # Build MongoDB filter conditions for $vectorSearch
        # Note: MongoDB Atlas Vector Search filter requires fields to be in the index definition
        # Multiple conditions in a dict are implicitly ANDed together
        filter_conditions: Dict[str, Any] = {}
        
        # Difficulty filter
        if difficulty and len(difficulty) > 0:
            filter_conditions["difficulty"] = {"$in": difficulty}
        
        # Premium filter
        if exclude_premium:
            filter_conditions["is_premium"] = False
        
        # Tags filter (at least one tag must match)
        if include_tags and len(include_tags) > 0:
            filter_conditions["topics"] = {"$in": include_tags}
        
        # Access database and collections
        db = await get_database()
        embeddings_collection = db[EMBEDDINGS_COLLECTION]
        metadata_collection = db[METADATA_COLLECTION]
        
        # Build vector search stage with optional filter
        vector_search_stage: Dict[str, Any] = {
            "index": VECTOR_INDEX_NAME,
            "queryVector": query_embedding,
            "path": "embedding",
            "exact": True,
            "limit": 20  # Get more results to account for duplicate qids
        }
        
        # Add filter if any conditions exist
        if filter_conditions:
            vector_search_stage["filter"] = filter_conditions
        
        # Simple vector search pipeline to get qids and scores
        pipeline = [
            {
                "$vectorSearch": vector_search_stage
            },
            {
                "$project": {
                    "_id": 0,
                    "qid": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        # Execute vector search
        try:
            cursor = await embeddings_collection.aggregate(pipeline)
            vector_results = []
            seen_qids: Set[int] = set()
            
            # Collect unique qids (keep first occurrence which has highest score)
            async for doc in cursor:
                qid = doc.get("qid")
                if qid and qid not in seen_qids:
                    seen_qids.add(qid)
                    vector_results.append({
                        "qid": qid,
                        "score": doc.get("score", 0.0)
                    })
            
            if not seen_qids:
                return []
            
            # Fetch metadata for all unique qids
            qid_list = list(seen_qids)
            metadata_cursor = metadata_collection.find(
                {"qid": {"$in": qid_list}},
                {"_id": 0, "qid": 1, "title": 1, "difficulty": 1, "topics": 1, "is_premium_question": 1}
            )
            
            # Build a map of qid to metadata
            metadata_map: Dict[int, Dict[str, Any]] = {}
            async for doc in metadata_cursor:
                qid = doc.get("qid")
                if qid:
                    metadata_map[qid] = {
                        "qid": qid,
                        "title": doc.get("title", ""),
                        "difficulty": doc.get("difficulty", ""),
                        "tags": doc.get("topics", []),
                        "is_premium": doc.get("is_premium_question", False)
                    }
            
            # Combine vector search results with metadata, preserving score order
            results = []
            for vector_result in vector_results:
                qid = vector_result["qid"]
                if qid in metadata_map:
                    results.append(metadata_map[qid])
            
            return results
        except Exception as agg_error:
            raise
        
    except Exception as e:
        # Re-raise exception with context for better error handling
        raise Exception(f"Error during vector search: {str(e)}") from e

