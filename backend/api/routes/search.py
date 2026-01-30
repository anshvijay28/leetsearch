from fastapi import APIRouter, HTTPException, Query, Request
from typing import List, Dict, Any, Optional, Literal
import logging
from services.vector_search import get_query_results
from services.rag_llm import rerank_problems
from ..models import Question
from ..middleware.rate_limit import limiter, SEARCH_LIMIT

router = APIRouter(prefix="/api/py", tags=["search"])
logger = logging.getLogger(__name__)

# Valid difficulty values
DifficultyType = Literal["Easy", "Medium", "Hard"]


@router.get("/search", response_model=List[Question])
@limiter.limit(SEARCH_LIMIT)
async def search_questions(
    request: Request,  # Required for rate limiter
    query: str = Query(..., min_length=1, max_length=500, description="Search query (1-500 characters)"),
    difficulty: Optional[List[DifficultyType]] = Query(None, description="Filter by difficulty (Easy, Medium, Hard)"),
    exclude_premium: Optional[bool] = Query(None, description="Exclude premium problems"),
    include_tags: Optional[List[str]] = Query(None, max_length=50, description="Include only questions with these tags"),
    exclude_sql: Optional[bool] = Query(None, description="Exclude SQL-only questions"),
    exclude_js_ts: Optional[bool] = Query(None, description="Exclude JavaScript/TypeScript-only questions")
):
    """
    Search for LeetCode questions using vector search with optional filters.
    
    Args:
        query: Search query string to find semantically similar questions
        difficulty: Optional list of difficulties to filter by (Easy, Medium, Hard)
        exclude_premium: Optional flag to exclude premium problems
        include_tags: Optional list of tags - only show questions with at least one of these tags
        exclude_sql: Optional flag to exclude SQL-only questions
        exclude_js_ts: Optional flag to exclude JavaScript/TypeScript-only questions
    
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
            include_tags=include_tags,
            exclude_sql=exclude_sql,
            exclude_js_ts=exclude_js_ts
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
                url=f"https://leetcode.com/problems/{result.get('slug', '')}" if result.get("slug") else f"https://lcid.cc/{str(result['qid'])}",
                is_premium=result.get("is_premium", False)
            )
            for result in results
        ]
        
        return questions
    except HTTPException:
        raise
    except Exception as e:
        # Log actual error details, return generic message
        logger.error(f"Search error for query '{query[:50]}': {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your search. Please try again.")

