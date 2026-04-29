"""Backend package bootstrap for local development.

This adds the backend directory to ``sys.path`` so imports like
``from core.database import Base`` continue to work when the API is
started from the repository root via ``uvicorn backend.main:app``.
"""

import os
import sys

BACKEND_DIR = os.path.dirname(__file__)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
