"""
Collection name constants for MongoDB collections.

This module centralizes all MongoDB collection names and index names
used throughout the application for consistency and easy maintenance.
"""

# Collection names
EMBEDDINGS_COLLECTION = "embeddings"
CHUNKS_COLLECTION = "chunks"
METADATA_COLLECTION = "question_metadata"
SUMMARIES_COLLECTION = "question_summaries"

# Vector search index name
VECTOR_INDEX_NAME = "summary_chunk_embeddings"

