"""
Service for managing lists and list problems in Supabase.

Handles all database operations for lists and list_problems tables.
"""
from typing import Dict, Any, Optional, List
from db.connection import get_supabase_client, get_database
from db.collections import METADATA_COLLECTION
from supabase import Client


async def get_all_lists(
    current_user_id: str
) -> list[Dict[str, Any]]:
    """
    Get all lists owned by the current user.
    
    Users can only see their own lists. Filtered by user_id only.
    
    Args:
        current_user_id: ID of the authenticated user making the request (required)
        
    Returns:
        List of lists with problem counts owned by the current user
    """
    supabase: Client = get_supabase_client()
    
    # Build query - only get lists owned by current user (filter by user_id only)
    query = supabase.table("lists").select("*").eq("user_id", current_user_id)
    
    # Order by created_at descending (newest first)
    query = query.order("created_at", desc=True)
    
    response = query.execute()
    lists = response.data if response.data else []
    
    # Get problem counts for each list
    lists_with_counts = []
    for list_item in lists:
        problem_count = await get_list_problem_count(list_item["id"])
        list_item["problem_count"] = problem_count
        lists_with_counts.append(list_item)
    
    return lists_with_counts


async def get_list_by_id(list_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single list by ID, ensuring it belongs to the user.
    
    Args:
        list_id: UUID of the list
        user_id: UUID of the user requesting the list (must own the list)
        
    Returns:
        List dictionary or None if not found or doesn't belong to user
    """
    supabase: Client = get_supabase_client()
    
    # Only get list if it belongs to the user
    response = supabase.table("lists").select("*").eq("id", list_id).eq("user_id", user_id).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None


async def create_list(
    user_id: str,
    name: str,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new list.
    
    Args:
        user_id: UUID of the user creating the list
        name: Name of the list
        description: Optional description
        
    Returns:
        Created list dictionary
    """
    supabase: Client = get_supabase_client()
    
    list_data = {
        "user_id": user_id,
        "name": name,
        "is_public": False,  # Always set to False, field reserved for future URL sharing
    }
    
    if description is not None:
        list_data["description"] = description
    
    response = supabase.table("lists").insert(list_data).execute()
    
    if not response.data or len(response.data) == 0:
        raise Exception("Failed to create list")
    
    created_list = response.data[0]
    created_list["problem_count"] = 0  # New list has no problems
    
    return created_list


async def update_list(
    list_id: str,
    user_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update a list's name and/or description.
    
    Args:
        list_id: UUID of the list to update
        user_id: UUID of the user (must own the list)
        name: New name for the list (optional)
        description: New description for the list (optional)
        
    Returns:
        Updated list dictionary
        
    Raises:
        Exception: If list doesn't exist or user doesn't own it
    """
    supabase: Client = get_supabase_client()
    
    # Verify list exists and belongs to user
    list_check = await get_list_by_id(list_id, user_id)
    if not list_check:
        raise Exception("List not found or you don't have permission to update it")
    
    # Build update data
    update_data: Dict[str, Any] = {}
    if name is not None:
        update_data["name"] = name
    if description is not None:
        update_data["description"] = description
    
    if not update_data:
        # Nothing to update, return existing list
        return list_check
    
    # Update the list
    response = supabase.table("lists").update(update_data).eq("id", list_id).eq("user_id", user_id).execute()
    
    if not response.data or len(response.data) == 0:
        raise Exception("Failed to update list")
    
    updated_list = response.data[0]
    updated_list["problem_count"] = await get_list_problem_count(list_id)
    
    return updated_list


async def get_list_problem_count(list_id: str) -> int:
    """
    Get the number of problems in a list.
    
    Args:
        list_id: UUID of the list
        
    Returns:
        Count of problems in the list
    """
    supabase: Client = get_supabase_client()
    
    # Fetch all problem IDs and count them
    response = supabase.table("list_problems").select("id").eq("list_id", list_id).execute()
    
    if response.data:
        return len(response.data)
    return 0


async def get_all_problems_paginated(cursor_qid: Optional[int], limit: int) -> Dict[str, Any]:
    """
    Get all problems from MongoDB with cursor-based pagination, ordered by QID ascending.
    
    Args:
        cursor_qid: QID to start after (cursor), or None to start from beginning
        limit: Maximum number of problems to return
        
    Returns:
        Dictionary with 'problems' list and 'nextPage' (last QID or None if no more)
    """
    db = await get_database()
    metadata_collection = db[METADATA_COLLECTION]
    
    # Build query - if cursor provided, get problems with QID > cursor
    query = {"qid": {"$gt": cursor_qid}} if cursor_qid is not None else {}
    
    # Fetch limit + 1 to check if there are more results
    cursor = metadata_collection.find(
        query,
        {"_id": 0, "qid": 1, "title": 1, "difficulty": 1, "topics": 1, "is_premium_question": 1}
    ).sort("qid", 1).limit(limit + 1)
    
    # Build results list
    results = []
    async for doc in cursor:
        qid = doc.get("qid")
        if qid:
            results.append({
                "qid": qid,
                "title": doc.get("title", ""),
                "difficulty": doc.get("difficulty", ""),
                "tags": doc.get("topics", []),
                "is_premium": doc.get("is_premium_question", False)
            })
    
    # Check if there are more results (we fetched limit + 1)
    has_more = len(results) > limit
    if has_more:
        results = results[:limit]  # Remove the extra item
    
    # nextPage is the last QID if there are more results, otherwise None
    next_page = results[-1]["qid"] if results and has_more else None
    
    return {
        "problems": results,
        "nextPage": next_page
    }


async def fuzzy_search_problems(query: str, limit: int = 20) -> list[Dict[str, Any]]:
    """
    Fuzzy search for problems in MongoDB by QID or title.
    
    Args:
        query: Search query - if numeric, searches by QID; otherwise searches by title (case-insensitive regex)
        limit: Maximum number of results to return (default 20)
        
    Returns:
        List of problems with qid, title, difficulty, tags, and is_premium
    """
    db = await get_database()
    metadata_collection = db[METADATA_COLLECTION]
    
    # Check if query is a number (QID search)
    try:
        qid = int(query.strip())
        # Search by exact QID
        cursor = metadata_collection.find(
            {"qid": qid},
            {"_id": 0, "qid": 1, "title": 1, "difficulty": 1, "topics": 1, "is_premium_question": 1}
        ).limit(1)
    except ValueError:
        # Search by title using case-insensitive regex (substring match)
        # Escape special regex characters to prevent regex injection, but allow substring matching
        import re
        escaped_query = re.escape(query.strip())
        # Use regex for substring matching (case-insensitive)
        regex_pattern = {"$regex": escaped_query, "$options": "i"}
        cursor = metadata_collection.find(
            {"title": regex_pattern},
            {"_id": 0, "qid": 1, "title": 1, "difficulty": 1, "topics": 1, "is_premium_question": 1}
        ).limit(limit).sort("qid", 1)  # Sort by qid for consistent base order
    
    # Build results list
    results: list[Dict[str, Any]] = []
    async for doc in cursor:
        qid = doc.get("qid")
        if qid:
            results.append({
                "qid": qid,
                "title": doc.get("title", "") or "",
                "difficulty": doc.get("difficulty", ""),
                "tags": doc.get("topics", []),
                "is_premium": doc.get("is_premium_question", False)
            })

    # For text queries, prioritize titles using a smart ranking heuristic:
    # 1. Exact matches (title == query) - highest priority
    # 2. Prefix matches - sorted by title length (shorter first)
    # 3. Other substring matches - sorted by title length (shorter first)
    trimmed_query = query.strip().lower()
    if trimmed_query:
        exact_matches: list[Dict[str, Any]] = []
        prefix_matches: list[Dict[str, Any]] = []
        other_matches: list[Dict[str, Any]] = []
        
        for item in results:
            title_lower = item["title"].lower()
            if title_lower == trimmed_query:
                exact_matches.append(item)
            elif title_lower.startswith(trimmed_query):
                prefix_matches.append(item)
            else:
                other_matches.append(item)
        
        # Sort each group by title length (shorter = more relevant)
        exact_matches.sort(key=lambda x: len(x["title"]))
        prefix_matches.sort(key=lambda x: len(x["title"]))
        other_matches.sort(key=lambda x: len(x["title"]))
        
        # Combine in priority order
        results = exact_matches + prefix_matches + other_matches

    return results


async def get_problem_metadata(qids: List[int]) -> Dict[int, Dict[str, Any]]:
    """
    Fetch problem metadata from MongoDB for given qids.
    
    Args:
        qids: List of LeetCode question IDs
        
    Returns:
        Dictionary mapping qid to problem metadata (qid, title, difficulty, tags, is_premium)
    """
    if not qids:
        return {}
    
    db = await get_database()
    metadata_collection = db[METADATA_COLLECTION]
    
    # Fetch metadata for all qids
    metadata_cursor = metadata_collection.find(
        {"qid": {"$in": qids}},
        {"_id": 0, "qid": 1, "title": 1, "difficulty": 1, "topics": 1, "is_premium_question": 1}
    )
    
    # Build a map of qid to metadata
    metadata_map: Dict[int, Dict[str, Any]] = {}
    async for doc in metadata_cursor:
        qid = doc.get("qid")
        if qid:
            metadata_map[qid] = {
                "qid": qid,
                "title": doc.get("title", ""),
                "difficulty": doc.get("difficulty", ""),
                "tags": doc.get("topics", []),
                "is_premium": doc.get("is_premium_question", False)
            }
    
    return metadata_map


async def get_list_problems(list_id: str, user_id: str) -> list[Dict[str, Any]]:
    """
    Get all problems in a list with full metadata, ensuring the list belongs to the user.
    
    Args:
        list_id: UUID of the list
        user_id: UUID of the user requesting the list (must own the list)
        
    Returns:
        List of problems with qid, position, title, difficulty, tags, and is_premium, ordered by position
    """
    supabase: Client = get_supabase_client()
    
    # Verify list exists and belongs to user
    list_check = await get_list_by_id(list_id, user_id)
    if not list_check:
        return []
    
    # Get all problems in the list, ordered by position
    response = supabase.table("list_problems").select("*").eq("list_id", list_id).order("position", desc=False).execute()
    
    if not response.data:
        return []
    
    # Extract qids and fetch metadata from MongoDB
    qids = [item["problem_qid"] for item in response.data]
    metadata_map = await get_problem_metadata(qids)
    
    # Combine list_problems data with metadata
    problems_with_metadata = []
    for item in response.data:
        qid = item["problem_qid"]
        problem_data = {
            "id": item["id"],
            "list_id": item["list_id"],
            "problem_qid": qid,
            "position": item["position"],
            "added_at": item["added_at"]
        }
        
        # Add metadata if available
        if qid in metadata_map:
            problem_data.update(metadata_map[qid])
        else:
            # If metadata not found, include basic info
            problem_data.update({
                "title": f"Problem {qid}",
                "difficulty": "Unknown",
                "tags": [],
                "is_premium": False
            })
        
        problems_with_metadata.append(problem_data)
    
    return problems_with_metadata


async def add_problem_to_list(list_id: str, user_id: str, problem_qid: int, position: Optional[int] = None) -> Dict[str, Any]:
    """
    Add a problem to a list, ensuring the list belongs to the user.
    
    Args:
        list_id: UUID of the list
        user_id: UUID of the user requesting the addition (must own the list)
        problem_qid: LeetCode question ID
        position: Optional position in the list (if None, appends to end)
        
    Returns:
        Created list_problem entry
        
    Raises:
        Exception: If list doesn't belong to user or problem already exists in list
    """
    supabase: Client = get_supabase_client()
    
    # Verify list exists and belongs to user
    list_check = await get_list_by_id(list_id, user_id)
    if not list_check:
        raise Exception("List not found or you don't have permission to modify it")
    
    # Check if problem already exists in list
    existing = supabase.table("list_problems").select("id").eq("list_id", list_id).eq("problem_qid", problem_qid).execute()
    if existing.data and len(existing.data) > 0:
        raise Exception("Problem already exists in this list")
    
    # If position not specified, get max position and add 1
    if position is None:
        all_problems = supabase.table("list_problems").select("position").eq("list_id", list_id).order("position", desc=True).limit(1).execute()
        if all_problems.data and len(all_problems.data) > 0:
            position = all_problems.data[0]["position"] + 1
        else:
            position = 1
    
    # Insert the problem
    problem_data = {
        "list_id": list_id,
        "problem_qid": problem_qid,
        "position": position
    }
    
    response = supabase.table("list_problems").insert(problem_data).execute()
    
    if not response.data or len(response.data) == 0:
        raise Exception("Failed to add problem to list")
    
    return response.data[0]


async def remove_problem_from_list(list_id: str, user_id: str, problem_qid: int) -> bool:
    """
    Remove a problem from a list, ensuring the list belongs to the user.
    
    Args:
        list_id: UUID of the list
        user_id: UUID of the user requesting the removal (must own the list)
        problem_qid: LeetCode question ID to remove
        
    Returns:
        True if removed successfully, False if not found
        
    Raises:
        Exception: If list doesn't belong to user
    """
    supabase: Client = get_supabase_client()
    
    # Verify list exists and belongs to user
    list_check = await get_list_by_id(list_id, user_id)
    if not list_check:
        raise Exception("List not found or you don't have permission to modify it")
    
    # Delete the problem from the list
    response = supabase.table("list_problems").delete().eq("list_id", list_id).eq("problem_qid", problem_qid).execute()
    
    # Check if anything was deleted
    # Note: Supabase delete doesn't return deleted count, so we check if response succeeded
    return True


async def delete_list(list_id: str, user_id: str) -> bool:
    """
    Delete a list, ensuring it belongs to the user.
    
    This will cascade delete all list_problems entries via foreign key constraint.
    
    Args:
        list_id: UUID of the list to delete
        user_id: UUID of the user requesting the deletion (must own the list)
        
    Returns:
        True if deleted successfully, False if list not found or doesn't belong to user
        
    Raises:
        Exception: If deletion fails
    """
    supabase: Client = get_supabase_client()
    
    # Verify list exists and belongs to user
    list_check = await get_list_by_id(list_id, user_id)
    if not list_check:
        return False
    
    # Delete the list (cascades to list_problems via foreign key)
    response = supabase.table("lists").delete().eq("id", list_id).eq("user_id", user_id).execute()
    
    return True


async def get_lists_containing_problem(problem_qid: int, user_id: str) -> Dict[str, bool]:
    """
    Get which lists (owned by the user) contain a specific problem.
    
    Args:
        problem_qid: LeetCode question ID
        user_id: UUID of the user (only returns lists owned by this user)
        
    Returns:
        Dictionary mapping list_id to True for lists that contain the problem
        Format: { "list-id-1": True, "list-id-2": True }
    """
    supabase: Client = get_supabase_client()
    
    # Get all list_problems entries for this problem_qid
    response = supabase.table("list_problems").select("list_id").eq("problem_qid", problem_qid).execute()
    
    if not response.data:
        return {}
    
    # Get list IDs that contain the problem
    list_ids_with_problem = {item["list_id"] for item in response.data}
    
    if not list_ids_with_problem:
        return {}
    
    # Verify these lists belong to the user and build result
    lists_response = supabase.table("lists").select("id").eq("user_id", user_id).in_("id", list(list_ids_with_problem)).execute()
    
    if not lists_response.data:
        return {}
    
    # Build dictionary: { "list-id": True }
    result = {str(list_item["id"]): True for list_item in lists_response.data}
    
    return result

