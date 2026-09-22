import os
import json
from typing import Any, Dict, List, Optional
from ollama import Client
from .provider import AIProvider

class OllamaProvider(AIProvider):
    def __init__(self):
        host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
        self.model = os.environ.get("OLLAMA_MODEL", "gemma3")
        # Initialize the synchronous Ollama client
        self.client = Client(host=host)

    def generate_chat(self, messages: List[Dict[str, str]], system_prompt: Optional[str] = None) -> str:
        formatted_messages = []
        
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
            
        formatted_messages.extend(messages)

        response = self.client.chat(
            model=self.model,
            messages=formatted_messages
        )
        return response['message']['content']

    def generate_structured(self, prompt: str, schema: Any, system_prompt: Optional[str] = None) -> Any:
        """
        Uses Ollama's JSON format output capability combined with Pydantic schema enforcing.
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
            
        messages.append({"role": "user", "content": prompt})

        # By passing the Pydantic schema via format, Ollama enforces the output structure
        response = self.client.chat(
            model=self.model,
            messages=messages,
            format=schema.model_json_schema()
        )
        
        # Parse the JSON string into the actual Pydantic object
        result_dict = json.loads(response['message']['content'])
        return schema(**result_dict)
