"""
RAG LLM module for reasoning about questions using OpenAI.

This module handles calling OpenAI's chat API with RAG context for semantic re-ranking.
"""

import json
import os
from typing import List, Dict, Any
from openai import AsyncOpenAI
from dotenv import load_dotenv
from services.embeddings import get_openai_client

load_dotenv()

# Configuration
MODEL = "gpt-4o-mini"  # Using gpt-4o-mini as a cost-effective model


async def rerank_problems(query: str, problems: List[Dict[str, Any]]) -> List[int]:
    """
    Re-rank problems based on semantic understanding of the user's query.
    
    Takes vector search results and uses LLM to understand the true intent behind
    the query, then returns problems ranked by actual relevance.
    
    Args:
        query: User search query
        problems: List of problem dictionaries with 'qid' and 'title' keys
                  (and optionally 'difficulty', 'tags')
    
    Returns:
        List of problem IDs (qids) in ranked order (most relevant first)
    
    Raises:
        Exception: If LLM generation or JSON parsing fails
    """
    try:
        # Get OpenAI client (singleton pattern)
        client = get_openai_client()
        
        # Format problems for context (include ID and title, optionally more details)
        problem_list = []
        for problem in problems:
            qid = problem.get("qid")
            title = problem.get("title", "")
            difficulty = problem.get("difficulty", "")
            tags = problem.get("tags", [])
            
            problem_str = f"Q{qid}: {title}"
            if difficulty:
                problem_str += f" ({difficulty})"
            if tags:
                problem_str += f" [Tags: {', '.join(tags)}]"
            
            problem_list.append(problem_str)
        
        context = "\n".join(problem_list)
        
        # System prompt for semantic re-ranking
        system_prompt = """You are a LeetCode problem ranking system with deep semantic understanding capabilities.

Your primary task: Extract the TRUE INTENT behind the user's query, then rank problems based on that deeper meaning.

Key principles:
- Look beyond surface-level keyword matches from vector search
- Identify the underlying concepts, patterns, or techniques the user is actually asking about
- Recognize when users describe problems indirectly (e.g., "find duplicates efficiently" → hash table/set problems)
- Understand problem-solving approaches mentioned implicitly (e.g., "avoid nested loops" → two-pointer, sliding window, hash maps)
- Consider the learning context (e.g., "I struggled with X" → rank similar but slightly easier problems higher)
- Detect skill level from query phrasing and adjust difficulty appropriately

The vector search gives you candidates - your job is to deeply understand what the user REALLY needs and re-rank accordingly.

Output ONLY valid JSON - an array of problem identifiers in ranked order (most relevant first)."""

        # User message with context
        user_message = f"""Query: {query}

Problems (pre-filtered by vector search):
{context}

Deeply analyze the query's intent and return a JSON object with a "ranked_problems" array containing problem IDs (as integers) ranked by true relevance:
{{"ranked_problems": [123, 456, 789, ...]}}"""

        # Call OpenAI API with JSON response format
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            response_format={"type": "json_object"},  # Force JSON output
            temperature=0.3,  # Lower temperature for more consistent ranking
        )
        
        # Parse JSON response
        response_content = response.choices[0].message.content
        
        # Try to extract JSON array - the response might be wrapped in an object
        try:
            parsed = json.loads(response_content)
            # If it's an object, look for common keys like "ranked_problems", "results", or check if it's directly an array
            if isinstance(parsed, dict):
                # Try common keys for the array
                for key in ["ranked_problems", "results", "problems", "ranking"]:
                    if key in parsed and isinstance(parsed[key], list):
                        ranked_ids = parsed[key]
                        break
                else:
                    # If no common key found, raise error
                    raise ValueError("JSON response doesn't contain a recognizable array field")
            elif isinstance(parsed, list):
                ranked_ids = parsed
            else:
                raise ValueError("JSON response is not an array or object with array field")
        except json.JSONDecodeError:
            # If direct parsing fails, try to extract array from markdown code blocks or text
            # This is a fallback for cases where JSON mode might not work perfectly
            import re
            array_match = re.search(r'\[[\d\s,]+\]', response_content)
            if array_match:
                ranked_ids = json.loads(array_match.group())
            else:
                raise ValueError(f"Could not parse JSON from response: {response_content}")
        
        # Convert to list of integers (qids)
        ranked_qids = [int(qid) for qid in ranked_ids if isinstance(qid, (int, str)) and str(qid).isdigit()]
        
        # Validate that all returned IDs were in the original problems
        original_qids = {p.get("qid") for p in problems}
        ranked_qids = [qid for qid in ranked_qids if qid in original_qids]
        
        # If some problems weren't ranked, append them in original order
        ranked_set = set(ranked_qids)
        unranked = [p.get("qid") for p in problems if p.get("qid") not in ranked_set]
        ranked_qids.extend(unranked)
        
        return ranked_qids
        
    except Exception as e:
        raise Exception(f"Error during RAG LLM re-ranking: {str(e)}") from e

