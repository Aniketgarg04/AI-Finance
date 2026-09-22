import os
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama

def get_llm(model_name: str = None, temperature: float = 0.0) -> BaseChatModel:
    """
    Returns a LangChain BaseChatModel. Supports OpenAI directly, or Ollama for Tool Calling and Agentic workflows.
    """
    if model_name and model_name.startswith(("gpt-", "o1-", "o3-")) and os.getenv("OPENAI_API_KEY"):
        return ChatOpenAI(model=model_name, temperature=temperature)

    model = model_name or os.getenv("OLLAMA_MODEL", "gemma3")
    host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    
    return ChatOllama(
        model=model,
        temperature=temperature,
        base_url=host
    )
