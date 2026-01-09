from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from services.vector_search import get_query_results
from services.rag_llm import rerank_problems
from services.auth import get_current_user
from services.lists import (
    get_all_lists, 
    create_list as create_list_service, 
    delete_list as delete_list_service,
    get_list_by_id as get_list_by_id_service,
    get_list_problems,
    add_problem_to_list,
    remove_problem_from_list,
    fuzzy_search_problems,
    get_all_problems_paginated
)
from .models import Question, ListCreate, ListUpdate, ListResponse, AddProblemRequest, ListProblemResponse

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


# Lists endpoints
@app.get("/api/py/lists", response_model=List[ListResponse])
async def get_lists(
    current_user: Any = Depends(get_current_user)
):
    """
    Get all lists owned by the authenticated user.
    
    Users can only see their own lists. Filtered by user_id only.
    
    Args:
        current_user: Authenticated user (from JWT token)
    
    Returns:
        List of lists with problem counts owned by the current user
    """
    try:
        # Only return lists owned by the current user (filtered by user_id)
        lists = await get_all_lists(
            current_user_id=current_user.id
        )
        
        # Convert to response model
        list_responses = [
            ListResponse(
                id=list_["id"],
                user_id=list_["user_id"],
                name=list_["name"],
                description=list_.get("description", ""),
                is_public=list_["is_public"],
                created_at=list_["created_at"],
                updated_at=list_["updated_at"],
                problem_count=list_.get("problem_count", 0)
            )
            for list_ in lists
        ]
        
        return list_responses
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching lists: {str(e)}")


@app.post("/api/py/lists", response_model=ListResponse, status_code=201)
async def create_list(
    list_data: ListCreate,
    current_user: Any = Depends(get_current_user)
):
    """
    Create a new list. Requires authentication.
    
    Args:
        list_data: List creation data (name, description)
        current_user: Authenticated user (from JWT token)
    
    Returns:
        Created list object
    """
    try:
        # Validate input
        if not list_data.name or not list_data.name.strip():
            raise HTTPException(status_code=400, detail="List name is required")
        
        # Create list using authenticated user's ID
        # is_public is always set to False (field reserved for future URL sharing)
        created_list = await create_list_service(
            user_id=current_user.id,
            name=list_data.name.strip(),
            description=list_data.description.strip() if list_data.description else None
        )
        
        # Convert to response model
        return ListResponse(
            id=created_list["id"],
            user_id=created_list["user_id"],
            name=created_list["name"],
            description=created_list.get("description"),
            is_public=created_list["is_public"],
            created_at=created_list["created_at"],
            updated_at=created_list["updated_at"],
            problem_count=created_list.get("problem_count", 0)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating list: {str(e)}")


@app.delete("/api/py/lists/{list_id}")
async def delete_list(
    list_id: str,
    current_user: Any = Depends(get_current_user)
):
    """
    Delete a list. Requires authentication and ownership.
    
    Args:
        list_id: UUID of the list to delete
        current_user: Authenticated user (from JWT token)
    
    Returns:
        Success message
    """
    try:
        # Delete list (verifies ownership internally)
        deleted = await delete_list_service(
            list_id=list_id,
            user_id=current_user.id
        )
        
        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="List not found or you don't have permission to delete it"
            )
        
        return {"message": "List deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting list: {str(e)}")


# List problems endpoints
@app.get("/api/py/lists/{list_id}/problems")
async def get_list_problems_endpoint(
    list_id: str,
    current_user: Any = Depends(get_current_user)
):
    """
    Get all problems in a list. Requires authentication and ownership.
    
    Args:
        list_id: UUID of the list
        current_user: Authenticated user (from JWT token)
    
    Returns:
        List of problems with qid and position
    """
    try:
        # Get problems in list (verifies ownership internally)
        problems = await get_list_problems(
            list_id=list_id,
            user_id=current_user.id
        )
        
        return {"problems": problems}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching list problems: {str(e)}")


@app.post("/api/py/lists/{list_id}/problems")
async def add_problem_to_list_endpoint(
    list_id: str,
    request: AddProblemRequest,
    current_user: Any = Depends(get_current_user)
):
    """
    Add a problem to a list. Requires authentication and ownership.
    
    Args:
        list_id: UUID of the list
        request: Request body with problem_qid
        current_user: Authenticated user (from JWT token)
    
    Returns:
        Created list_problem entry
    """
    try:
        # Add problem to list (verifies ownership internally)
        added_problem = await add_problem_to_list(
            list_id=list_id,
            user_id=current_user.id,
            problem_qid=request.problem_qid
        )
        
        return added_problem
    except Exception as e:
        error_message = str(e)
        if "not found" in error_message.lower() or "permission" in error_message.lower():
            raise HTTPException(status_code=404, detail=error_message)
        elif "already exists" in error_message.lower():
            raise HTTPException(status_code=400, detail=error_message)
        else:
            raise HTTPException(status_code=500, detail=f"Error adding problem to list: {error_message}")


@app.delete("/api/py/lists/{list_id}/problems/{problem_qid}")
async def remove_problem_from_list_endpoint(
    list_id: str,
    problem_qid: int,
    current_user: Any = Depends(get_current_user)
):
    """
    Remove a problem from a list. Requires authentication and ownership.
    
    Args:
        list_id: UUID of the list
        problem_qid: LeetCode question ID to remove
        current_user: Authenticated user (from JWT token)
    
    Returns:
        Success message
    """
    try:
        # Remove problem from list (verifies ownership internally)
        await remove_problem_from_list(
            list_id=list_id,
            user_id=current_user.id,
            problem_qid=problem_qid
        )
        
        return {"message": "Problem removed from list successfully"}
    except Exception as e:
        error_message = str(e)
        if "not found" in error_message.lower() or "permission" in error_message.lower():
            raise HTTPException(status_code=404, detail=error_message)
        else:
            raise HTTPException(status_code=500, detail=f"Error removing problem from list: {error_message}")


@app.get("/api/py/problems", response_model=Dict[str, Any])
async def get_problems(
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
                url=f"https://lcid.cc/{str(problem['qid'])}",
                is_premium=problem.get("is_premium", False)
            )
            for problem in result["problems"]
        ]
        
        return {
            "problems": questions,
            "nextPage": result["nextPage"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching problems: {str(e)}")


@app.get("/api/py/problems/search", response_model=List[Question])
async def search_problems(
    query: str = Query(..., description="Search query - QID number or problem title"),
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
                url=f"https://lcid.cc/{str(result['qid'])}",
                is_premium=result.get("is_premium", False)
            )
            for result in results
        ]
        
        return questions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching problems: {str(e)}")
