from typing import Annotated, TypedDict, Literal
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from .llm_adapter import get_llm
from .tools import ALL_TOOLS

# Define the State
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    pending_approval: bool

# Initialize tools and ToolNode
tools = ALL_TOOLS
tool_node = ToolNode(tools)

def planner_node(state: AgentState):
    """
    Analyzes the user request and selects tools.
    """
    llm = get_llm().bind_tools(tools)
    response = llm.invoke(state["messages"])
    return {"messages": [response], "pending_approval": False}

def hitl_node(state: AgentState):
    """
    Human-in-the-Loop node. If a high-risk tool is selected, pause.
    """
    last_message = state["messages"][-1]
    # Check if there are tool calls and if any are high-risk
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        for tc in last_message.tool_calls:
            if tc["name"] in ["send_email", "trigger_sap_erp_payment"]:
                return {"pending_approval": True}
    return {"pending_approval": False}

def should_execute_or_pause(state: AgentState) -> Literal["hitl", "tools", "__end__"]:
    """
    Determine whether to execute tools, pause for approval, or end.
    """
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        if state.get("pending_approval"):
            return "hitl"
        return "tools"
    return END

# Build the Graph
workflow = StateGraph(AgentState)

workflow.add_node("planner", planner_node)
workflow.add_node("tools", tool_node)
workflow.add_node("hitl", hitl_node)

workflow.set_entry_point("planner")

# From planner, we check if we need to pause, execute tools, or end.
# Wait, let's make it simpler: planner -> hitl -> should_execute_or_pause
workflow.add_edge("planner", "hitl")

workflow.add_conditional_edges(
    "hitl",
    should_execute_or_pause,
    {
        "tools": "tools",
        "hitl": END, # Pause execution by ending, UI will resume it later
        END: END
    }
)

workflow.add_edge("tools", "planner")

from langgraph.checkpoint.memory import MemorySaver

# Compile the graph
memory = MemorySaver()
agent_executor = workflow.compile(checkpointer=memory)
