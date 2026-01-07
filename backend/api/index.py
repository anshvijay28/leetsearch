from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from services.vector_search import get_query_results
from services.rag_llm import rerank_problems

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
    url: str
    is_premium: bool


@app.get("/api/py/search", response_model=List[Question])
async def search_questions(
    query: str,
    difficulty: Optional[List[str]] = Query(None, description="Filter by difficulty (Easy, Medium, Hard)"),
    exclude_premium: Optional[bool] = Query(None, description="Exclude premium problems"),
    include_tags: Optional[List[str]] = Query(None, description="Include only questions with these tags")
):
    """
    Search for LeetCode questions using vector search with optional filters.
    
    Args:
        query: Search query string to find semantically similar questions
        difficulty: Optional list of difficulties to filter by (Easy, Medium, Hard)
        exclude_premium: Optional flag to exclude premium problems
        include_tags: Optional list of tags - only show questions with at least one of these tags
    
    Returns:
        List of matching questions with qid, title, difficulty, and tags
    """
    try:
        if not query or not query.strip():
            raise HTTPException(status_code=400, detail="Query parameter is required")
        
        trimmed_query = query.strip()
        
        # Get vector search results with filters
        results = await get_query_results(
            trimmed_query,
            difficulty=difficulty,
            exclude_premium=exclude_premium,
            include_tags=include_tags
        )
        
        # Re-rank results using semantic understanding
        if results:
            try:
                ranked_qids = await rerank_problems(trimmed_query, results)
                
                # Create a map of qid to result for efficient lookup
                results_map: Dict[int, Dict[str, Any]] = {result["qid"]: result for result in results}
                
                # Reorder results based on ranked_qids
                reordered_results = []
                for qid in ranked_qids:
                    if qid in results_map:
                        reordered_results.append(results_map[qid])
                
                # Use reordered results
                results = reordered_results
            except Exception as e:
                # If re-ranking fails, log error but continue with original results
                print(f"Warning: Re-ranking failed, using original vector search results: {str(e)}")
        
        # Map results to Question model format (add id field)
        questions = [
            Question(
                id=result["qid"],
                qid=result["qid"],
                title=result["title"],
                difficulty=result["difficulty"],
                tags=result["tags"],
                url=f"https://lcid.cc/{str(result['qid'])}",
                is_premium=result.get("is_premium", False)
            )
            for result in results
        ]
        
        return questions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during search: {str(e)}")
