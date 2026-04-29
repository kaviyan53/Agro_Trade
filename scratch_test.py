import os
import sys

# add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.chatbot_service import get_chat_response

messages = [{"role": "user", "content": "Hello!"}]
response = get_chat_response(messages)
print("Response:", response)
