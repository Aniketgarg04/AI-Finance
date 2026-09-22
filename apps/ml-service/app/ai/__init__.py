import os
from .provider import AIProvider
from .ollama_provider import OllamaProvider

# Global instance for dependency injection across the ML service
ai_provider: AIProvider

# Switch based on environment variable, defaulting to Ollama for local dev
provider_type = os.environ.get("AI_PROVIDER", "ollama").lower()

if provider_type == "openai":
    from .openai_provider import OpenAIProvider
    ai_provider = OpenAIProvider()
else:
    ai_provider = OllamaProvider()
