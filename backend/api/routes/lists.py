from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Any
from uuid import UUID
import logging
from services.auth import get_current_user

logger = logging.getLogger(__name__)
from services.lists import (
    get_all_lists,
    create_list as create_list_service,
    update_list as update_list_service,
    delete_list as delete_list_service,
    get_list_problems,
    add_problem_to_list,
    remove_problem_from_list,
)
from ..models import ListCreate, ListUpdate, ListResponse, AddProblemRequest
from ..middleware.rate_limit import limiter, LISTS_LIMIT

router = APIRouter(prefix="/api/py/lists", tags=["lists"])


@router.get("", response_model=List[ListResponse])
@limiter.limit(LISTS_LIMIT)
async def get_lists(
    request: Request,
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
        logger.error(f"Error fetching lists for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch lists. Please try again.")


@router.post("", response_model=ListResponse, status_code=201)
@limiter.limit(LISTS_LIMIT)
async def create_list(
    request: Request,
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
        logger.error(f"Error creating list for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create list. Please try again.")


@router.put("/{list_id}", response_model=ListResponse)
@limiter.limit(LISTS_LIMIT)
async def update_list(
    request: Request,
    list_id: UUID,
    list_data: ListUpdate,
    current_user: Any = Depends(get_current_user)
):
    """
    Update a list's name and/or description. Requires authentication and ownership.
    
    Args:
        list_id: UUID of the list to update
        list_data: Update data (name, description - both optional)
        current_user: Authenticated user (from JWT token)
    
    Returns:
        Updated list object
    """
    try:
        # Update list using authenticated user's ID
        updated_list = await update_list_service(
            list_id=str(list_id),
            user_id=current_user.id,
            name=list_data.name.strip() if list_data.name else None,
            description=list_data.description.strip() if list_data.description else None
        )
        
        # Convert to response model
        return ListResponse(
            id=updated_list["id"],
            user_id=updated_list["user_id"],
            name=updated_list["name"],
            description=updated_list.get("description"),
            is_public=updated_list["is_public"],
            created_at=updated_list["created_at"],
            updated_at=updated_list["updated_at"],
            problem_count=updated_list.get("problem_count", 0)
        )
    except Exception as e:
        error_message = str(e)
        if "not found" in error_message.lower() or "permission" in error_message.lower():
            raise HTTPException(status_code=404, detail="List not found or you don't have permission to modify it")
        else:
            logger.error(f"Error updating list {list_id} for user {current_user.id}: {error_message}")
            raise HTTPException(status_code=500, detail="Failed to update list. Please try again.")


@router.delete("/{list_id}")
@limiter.limit(LISTS_LIMIT)
async def delete_list(
    request: Request,
    list_id: UUID,
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
            list_id=str(list_id),
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
        logger.error(f"Error deleting list {list_id} for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete list. Please try again.")


@router.get("/{list_id}/problems")
@limiter.limit(LISTS_LIMIT)
async def get_list_problems_endpoint(
    request: Request,
    list_id: UUID,
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
            list_id=str(list_id),
            user_id=current_user.id
        )
        
        return {"problems": problems}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching problems for list {list_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch list problems. Please try again.")


@router.post("/{list_id}/problems")
@limiter.limit(LISTS_LIMIT)
async def add_problem_to_list_endpoint(
    request: Request,
    list_id: UUID,
    problem_request: AddProblemRequest,
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
            list_id=str(list_id),
            user_id=current_user.id,
            problem_qid=problem_request.problem_qid
        )
        
        return added_problem
    except Exception as e:
        error_message = str(e)
        if "not found" in error_message.lower() or "permission" in error_message.lower():
            raise HTTPException(status_code=404, detail="List not found or you don't have permission to modify it")
        elif "already exists" in error_message.lower():
            raise HTTPException(status_code=400, detail="Problem already exists in this list")
        else:
            logger.error(f"Error adding problem {problem_request.problem_qid} to list {list_id}: {error_message}")
            raise HTTPException(status_code=500, detail="Failed to add problem. Please try again.")


@router.delete("/{list_id}/problems/{problem_qid}")
@limiter.limit(LISTS_LIMIT)
async def remove_problem_from_list_endpoint(
    request: Request,
    list_id: UUID,
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
            list_id=str(list_id),
            user_id=current_user.id,
            problem_qid=problem_qid
        )
        
        return {"message": "Problem removed from list successfully"}
    except Exception as e:
        error_message = str(e)
        if "not found" in error_message.lower() or "permission" in error_message.lower():
            raise HTTPException(status_code=404, detail="List or problem not found, or you don't have permission")
        else:
            logger.error(f"Error removing problem {problem_qid} from list {list_id}: {error_message}")
            raise HTTPException(status_code=500, detail="Failed to remove problem. Please try again.")

