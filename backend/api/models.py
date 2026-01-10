"""
Pydantic models for API request and response validation.
"""
from pydantic import BaseModel, Field, field_validator
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
    name: str = Field(..., min_length=1, max_length=100, description="List name (1-100 characters)")
    description: Optional[str] = Field(None, max_length=500, description="Optional description (max 500 characters)")
    # is_public field exists in database but is always set to False
    # Reserved for future URL sharing functionality

    @field_validator('name', mode='before')
    @classmethod
    def strip_name(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator('description', mode='before')
    @classmethod
    def strip_description(cls, v):
        if isinstance(v, str):
            stripped = v.strip()
            return stripped if stripped else None
        return v


class ListUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="List name (1-100 characters)")
    description: Optional[str] = Field(None, max_length=500, description="Optional description (max 500 characters)")
    # is_public field exists in database but is not modifiable
    # Reserved for future URL sharing functionality

    @field_validator('name', mode='before')
    @classmethod
    def strip_name(cls, v):
        if isinstance(v, str):
            stripped = v.strip()
            return stripped if stripped else None
        return v

    @field_validator('description', mode='before')
    @classmethod
    def strip_description(cls, v):
        if isinstance(v, str):
            stripped = v.strip()
            return stripped if stripped else None
        return v


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
    problem_qid: int = Field(..., ge=1, le=10000, description="LeetCode question ID (1-10000)")


class ListProblemResponse(BaseModel):
    id: str
    list_id: str
    problem_qid: int
    position: int
    added_at: str

