import os
import certifi
from pymongo import AsyncMongoClient
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# ============================================
# MongoDB Connection (for LeetCode questions)
# ============================================
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = "leetcode_questions"
COLLECTION_NAME = "question_metadata"

client = None
database = None

async def get_database():
    global client, database
    if client is None:
        client = AsyncMongoClient(
            MONGODB_URL,
            tlsCAFile=certifi.where()
        )
        database = client[DATABASE_NAME]
    return database

async def get_collection():
    db = await get_database()
    return db[COLLECTION_NAME]

async def close_mongodb_connection():
    global client
    if client:
        client.close()
        client = None
        database = None

# ============================================
# Supabase Connection (for user authentication)
# ============================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase_client: Client | None = None

def get_supabase_client() -> Client:
    """
    Get or create Supabase client instance.
    Returns a singleton Supabase client for authentication and database operations.
    """
    global supabase_client
    if supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY must be set in environment variables"
            )
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return supabase_client

