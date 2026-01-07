"""
OpenAI embedding generation service.

This module handles generating text embeddings using OpenAI's embedding API.
"""

import os
from typing import List
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIMENSIONS = 1024

# Global OpenAI client (singleton pattern)
openai_client: AsyncOpenAI | None = None


def get_openai_client() -> AsyncOpenAI:
    """
    Get or create OpenAI async client instance.
    Returns a singleton OpenAI client for embedding generation.
    """
    global openai_client
    if openai_client is None:
        if not OPENAI_API_KEY:
            raise ValueError(
                "OPENAI_API_KEY must be set in environment variables"
            )
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return openai_client


async def get_embedding(text: str) -> List[float]:
    """
    Generate embedding for a text string using OpenAI.
    
    Args:
        text: Input text to embed
    
    Returns:
        List of floats representing the embedding vector
    """
    client = get_openai_client()
    response = await client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
        dimensions=EMBEDDING_DIMENSIONS,
    )
    return response.data[0].embedding