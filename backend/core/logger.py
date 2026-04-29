import logging
import sys
from datetime import datetime

LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
logging.basicConfig(stream=sys.stdout, level=logging.INFO, format=LOG_FORMAT)

logger = logging.getLogger("agrotrade")


def log_action(user_email: str, action: str, detail: str = ""):
    logger.info(f"USER={user_email} | ACTION={action} | DETAIL={detail}")
