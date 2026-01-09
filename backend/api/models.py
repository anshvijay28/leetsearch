"""
Pydantic models for API request and response validation.
"""
from pydantic import BaseModel
from typing import List, Optional


# Pydantic model for Question (MongoDB search results)
class Question(BaseModel):
    id: int
    qid: int
    title: str
    difficulty: str
    tags: List[str]
    url: str
    is_premium: bool


# Pydantic models for Lists
class ListCreate(BaseModel):
    name: str
    description: Optional[str] = None
    # is_public field exists in database but is always set to False
    # Reserved for future URL sharing functionality


class ListUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    # is_public field exists in database but is not modifiable
    # Reserved for future URL sharing functionality


class ListResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    is_public: bool
    created_at: str
    updated_at: str
    problem_count: int


class AddProblemRequest(BaseModel):
    problem_qid: int


class ListProblemResponse(BaseModel):
    id: str
    list_id: str
    problem_qid: int
    position: int
    added_at: str

