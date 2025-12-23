import os
from dotenv import load_dotenv
load_dotenv()

from connection import get_engine




POSTGRESQL_URL = os.getenv("POSTGRESQL_URL")
print(POSTGRESQL_URL)
print(get_engine())
