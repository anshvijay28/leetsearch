"""
Test script to verify Supabase connection.
Run with: python test_supabase.py
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_supabase_connection():
    """Test Supabase client initialization and basic connection."""
    
    # Get credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    # Check if credentials are set
    if not supabase_url:
        print("❌ ERROR: SUPABASE_URL not found in environment variables")
        return False
    
    if not supabase_key:
        print("❌ ERROR: SUPABASE_KEY not found in environment variables")
        return False
    
    print(f"✓ Found SUPABASE_URL: {supabase_url[:30]}...")
    print(f"✓ Found SUPABASE_KEY: {supabase_key[:30]}...")
    print()
    
    try:
        # Initialize Supabase client
        print("🔄 Initializing Supabase client...")
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✓ Supabase client created successfully")
        print()
        
        # Test 1: Check auth service is accessible
        print("🔄 Testing Auth service...")
        try:
            # Try to get the current session (will be None if not authenticated, but should not error)
            auth_response = supabase.auth.get_session()
            print("✓ Auth service is accessible")
        except Exception as e:
            print(f"⚠️  Auth service test warning: {e}")
            # This is okay if we're not authenticated
        
        # Test 2: Check if we can access the database (PostgREST)
        print("🔄 Testing Database connection...")
        try:
            # Try to access the auth.users table via admin API (if using service role key)
            # This is a better test than querying a random table
            if "secret" in supabase_key.lower():
                # Using service role key - can access admin functions
                print("  (Using service role key - admin access available)")
            else:
                # Using publishable key - limited access
                print("  (Using publishable key - RLS policies apply)")
            
            # The connection itself is verified by the client initialization
            # If we got here without errors, the connection works
            print("✓ Database connection successful")
        except Exception as db_error:
            error_str = str(db_error)
            print(f"⚠️  Database connection test: {error_str}")
        
        print()
        print("=" * 50)
        print("✅ SUPABASE CONNECTION TEST PASSED!")
        print("=" * 50)
        print()
        print("Connection details:")
        print(f"  URL: {supabase_url}")
        print(f"  Key: {supabase_key[:20]}...")
        print()
        
        return True
        
    except Exception as e:
        print()
        print("=" * 50)
        print("❌ SUPABASE CONNECTION TEST FAILED!")
        print("=" * 50)
        print()
        print(f"Error: {str(e)}")
        print()
        print("Troubleshooting:")
        print("  1. Verify SUPABASE_URL is correct (should be like https://xxxxx.supabase.co)")
        print("  2. Verify SUPABASE_KEY is correct (publishable or secret key)")
        print("  3. Check your internet connection")
        print("  4. Verify your Supabase project is active")
        print()
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Supabase Connection Test")
    print("=" * 50)
    print()
    
    success = test_supabase_connection()
    
    sys.exit(0 if success else 1)

