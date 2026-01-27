from fastapi import APIRouter, HTTPException, Query, Depends, Request, Path
from typing import List, Dict, Any, Optional
import logging
from services.auth import get_current_user
from services.lists import fuzzy_search_problems, get_all_problems_paginated, get_lists_containing_problem
from services.question_fetcher import fetch_question_data
from services.document_formatter import format_question_document
from services.vector_search import get_query_results
from ..models import Question
from ..middleware.rate_limit import limiter, PROBLEMS_LIMIT

router = APIRouter(prefix="/api/py/problems", tags=["problems"])
logger = logging.getLogger(__name__)


@router.get("", response_model=Dict[str, Any])
@limiter.limit(PROBLEMS_LIMIT)
async def get_problems(
    request: Request,
    cursor: Optional[int] = Query(None, description="QID cursor - fetch problems after this QID (null = start from beginning)"),
    limit: int = Query(15, description="Maximum number of problems to return", ge=1, le=50),
    current_user: Any = Depends(get_current_user)
):
    """
    Get all problems with cursor-based pagination, ordered by QID ascending.
    
    Args:
        cursor: QID to start after (null = start from beginning)
        limit: Maximum number of problems to return (default 15, max 50)
        current_user: Authenticated user (from JWT token)
    
    Returns:
        Dictionary with 'problems' list and 'nextPage' (last QID or null if no more)
    """
    try:
        result = await get_all_problems_paginated(cursor_qid=cursor, limit=limit)
        
        # Convert to Question format for consistency with frontend
        questions = [
            Question(
                id=problem["qid"],
                qid=problem["qid"],
                title=problem["title"],
                difficulty=problem["difficulty"],
                tags=problem["tags"],
                url=f"https://leetcode.com/problems/{problem.get('slug', '')}" if problem.get("slug") else f"https://lcid.cc/{str(problem['qid'])}",
                is_premium=problem.get("is_premium", False)
            )
            for problem in result["problems"]
        ]
        
        return {
            "problems": questions,
            "nextPage": result["nextPage"]
        }
    except Exception as e:
        logger.error(f"Error fetching problems (cursor={cursor}): {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch problems. Please try again.")


@router.get("/search", response_model=List[Question])
@limiter.limit(PROBLEMS_LIMIT)
async def search_problems(
    request: Request,
    query: str = Query(..., min_length=1, max_length=200, description="Search query - QID number or problem title (1-200 characters)"),
    limit: int = Query(20, description="Maximum number of results", ge=1, le=50),
    current_user: Any = Depends(get_current_user)
):
    """
    Fuzzy search for problems by QID or title.
    
    If query is a number, searches by exact QID.
    If query is text, searches by title using case-insensitive regex.
    
    Args:
        query: Search query (QID number or problem title)
        limit: Maximum number of results (1-50, default 20)
        current_user: Authenticated user (from JWT token)
    
    Returns:
        List of matching problems with qid, title, difficulty, tags, and is_premium
    """
    try:
        if not query or not query.strip():
            raise HTTPException(status_code=400, detail="Query parameter is required")
        
        # Perform fuzzy search
        results = await fuzzy_search_problems(query.strip(), limit=limit)
        
        # Convert to Question format for consistency with frontend
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
        logger.error(f"Error searching problems for query '{query[:50]}': {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search problems. Please try again.")


@router.get("/{qid}/similar", response_model=List[Question])
@limiter.limit(PROBLEMS_LIMIT)
async def get_similar_problems(
    request: Request,
    qid: int = Path(..., description="Question ID to find similar problems for"),
    limit: int = Query(15, description="Maximum number of similar problems to return", ge=1, le=30),
    current_user: Any = Depends(get_current_user)
):
    try:
        question_data = await fetch_question_data(qid)
        if not question_data:
            raise HTTPException(status_code=404, detail=f"Question with QID {qid} not found")
        
        formatted_doc = format_question_document(question_data)
        
        results = await get_query_results(formatted_doc)
        
        similar_results = [r for r in results if r["qid"] != qid][:limit]
        
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
            for result in similar_results
        ]
        
        return questions
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding similar problems for QID {qid}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to find similar problems. Please try again.")


@router.get("/{qid}/lists", response_model=Dict[str, bool])
@limiter.limit(PROBLEMS_LIMIT)
async def get_problem_lists(
    request: Request,
    qid: int = Path(..., description="Question ID to find which lists contain it"),
    current_user: Any = Depends(get_current_user)
):
    """
    Get which lists (owned by the current user) contain a specific problem.
    
    Args:
        qid: Question ID
        current_user: Authenticated user (from JWT token)
    
    Returns:
        Dictionary mapping list_id to True for lists that contain the problem
        Format: { "list-id-1": True, "list-id-2": True }
    """
    try:
        result = await get_lists_containing_problem(qid, current_user.id)
        return result
    except Exception as e:
        logger.error(f"Error finding lists containing problem QID {qid}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to find lists containing this problem. Please try again.")

