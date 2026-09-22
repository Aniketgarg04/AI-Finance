import os
import json
from typing import Any, Dict, List, Optional
from openai import OpenAI
from .provider import AIProvider

class OpenAIProvider(AIProvider):
    def __init__(self):
        # Requires OPENAI_API_KEY environment variable
        self.client = OpenAI()
        self.model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    def generate_chat(self, messages: List[Dict[str, str]], system_prompt: Optional[str] = None) -> str:
        formatted_messages = []
        
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
            
        formatted_messages.extend(messages)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=formatted_messages
        )
        return response.choices[0].message.content

    def generate_structured(self, prompt: str, schema: Any, system_prompt: Optional[str] = None) -> Any:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
            
        messages.append({"role": "user", "content": prompt})

        # OpenAI Structured Outputs directly parse to Pydantic
        completion = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=messages,
            response_format=schema,
        )
        
        return completion.choices[0].message.parsed
