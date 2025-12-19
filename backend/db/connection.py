import os
import certifi
from pymongo import AsyncMongoClient
from dotenv import load_dotenv

load_dotenv()

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

async def close_connection():
    global client
    if client:
        client.close()
        client = None
        database = None

