from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from db.connection import get_collection

# Create FastAPI instance with custom docs
app = FastAPI(docs_url="/api/py/docs")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for Question (MongoDB search results)
class Question(BaseModel):
    id: int
    qid: int
    title: str
    difficulty: str
    tags: List[str]


@app.get("/api/py/search", response_model=List[Question])
async def search_questions(query: Optional[str] = None):
    """
    Search for LeetCode questions from MongoDB.
    Query parameter is optional and ignored for now.
    """
    try:
        collection = await get_collection()
        cursor = collection.find({}).limit(20)
        questions = []
        
        async for doc in cursor:
            questions.append({
                "id": doc.get("qid", 0),
                "qid": doc.get("qid", 0),
                "title": doc.get("title", ""),
                "difficulty": doc.get("difficulty", ""),
                "tags": doc.get("topics", [])
            })
        
        return questions
    except Exception as e:
        print(f"Error fetching questions from MongoDB: {e}")
        return []
