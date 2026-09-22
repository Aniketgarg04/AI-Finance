from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class AIProvider(ABC):
    """
    Abstract base class for all AI/LLM providers (Ollama, OpenAI, etc.)
    """

    @abstractmethod
    def generate_chat(self, messages: List[Dict[str, str]], system_prompt: Optional[str] = None) -> str:
        """Generate a raw text response for conversational chat."""
        pass

    @abstractmethod
    def generate_structured(self, prompt: str, schema: Any, system_prompt: Optional[str] = None) -> Any:
        """Generate a structured JSON output based on a Pydantic schema."""
        pass
