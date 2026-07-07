from fastapi import APIRouter

router = APIRouter()

AGENTS = [
    {"name": "claude", "description": "General-purpose Claude agent. Default orchestrator.", "model": "claude-sonnet-4-6", "tier": "orchestrator", "status": "online"},
    {"name": "planner", "description": "Strategic planning consultant with interview workflow.", "model": "claude-opus-4-8", "tier": "orchestrator", "status": "online"},
    {"name": "mars-bot", "description": "Telegram bot + Win hotkey AI manager (PM2 active).", "model": "claude-sonnet-4-6", "tier": "orchestrator", "status": "online"},
    {"name": "executor", "description": "Focused task executor for implementation work.", "model": "claude-sonnet-4-6", "tier": "specialist", "status": "online"},
    {"name": "architect", "description": "Strategic Architecture & Debugging Advisor (read-only).", "model": "claude-opus-4-8", "tier": "specialist", "status": "online"},
    {"name": "code-reviewer", "description": "Expert code review with severity-rated feedback.", "model": "claude-sonnet-4-6", "tier": "specialist", "status": "online"},
    {"name": "debugger", "description": "Root-cause analysis and regression isolation.", "model": "claude-sonnet-4-6", "tier": "specialist", "status": "online"},
    {"name": "designer", "description": "UI/UX Designer-Developer for stunning interfaces.", "model": "claude-sonnet-4-6", "tier": "specialist", "status": "online"},
    {"name": "security-reviewer", "description": "Security vulnerability detection specialist.", "model": "claude-opus-4-8", "tier": "specialist", "status": "online"},
    {"name": "typescript-reviewer", "description": "TypeScript/JavaScript code reviewer.", "model": "claude-sonnet-4-6", "tier": "worker", "status": "online"},
    {"name": "python-reviewer", "description": "Python code reviewer specializing in PEP 8.", "model": "claude-sonnet-4-6", "tier": "worker", "status": "online"},
    {"name": "tdd-guide", "description": "Test-Driven Development specialist.", "model": "claude-sonnet-4-6", "tier": "worker", "status": "online"},
    {"name": "build-error-resolver", "description": "Build and TypeScript error resolution.", "model": "claude-haiku-4-5", "tier": "worker", "status": "online"},
    {"name": "doc-updater", "description": "Documentation and codemap specialist.", "model": "claude-haiku-4-5", "tier": "worker", "status": "online"},
    {"name": "Explore", "description": "Fast read-only codebase search agent.", "model": "claude-haiku-4-5", "tier": "worker", "status": "online"},
]


@router.get("/agents")
def get_agents():
    return AGENTS
