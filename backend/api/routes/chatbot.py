from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Annotated, List, Literal
from services.chatbot_service import get_chat_response

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


class TextContentPart(BaseModel):
    type: Literal["text"]
    text: str


class ImageUrlValue(BaseModel):
    url: str


class ImageContentPart(BaseModel):
    type: Literal["image_url"]
    image_url: ImageUrlValue


MessageContentPart = Annotated[TextContentPart | ImageContentPart, Field(discriminator="type")]


class Message(BaseModel):
    role: str
    content: str | List[MessageContentPart]


class ChatRequest(BaseModel):
    messages: List[Message]


def _serialize_content(content: str | List[MessageContentPart]):
    if isinstance(content, str):
        return content

    serialized = []
    for item in content:
        if isinstance(item, TextContentPart):
            serialized.append({"type": "text", "text": item.text})
        else:
            serialized.append({"type": "image_url", "image_url": {"url": item.image_url.url}})
    return serialized


@router.post("/chat")
async def chat(request: ChatRequest):
    messages_dict = [{"role": m.role, "content": _serialize_content(m.content)} for m in request.messages]
    result = get_chat_response(messages_dict)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return {"reply": result["response"]}
