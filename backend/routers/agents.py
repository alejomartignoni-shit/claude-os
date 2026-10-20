import pathlib
import re
from fastapi import APIRouter

router = APIRouter()

# Global agents first, then the ones committed to this repo's .claude/agents
AGENTS_PATHS = [
    pathlib.Path(r"C:/Users/Alejo/.claude/agents"),
    pathlib.Path(__file__).resolve().parents[2] / ".claude" / "agents",
]

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


def read_frontmatter(path):
    content = path.read_text(encoding="utf-8", errors="ignore")
    match = re.match(r"^---\s*\n(.*?)\n---", content, re.S)
    if not match:
        return {}
    fields = {}
    for line in match.group(1).splitlines():
        key, sep, value = line.partition(":")
        if sep and not line[:1].isspace():
            fields[key.strip()] = value.strip().strip("\"'")
    return fields


def get_installed_agents():
    known = {a["name"].lower() for a in AGENTS}
    installed = []
    for agents_path in AGENTS_PATHS:
        if not agents_path.exists():
            continue
        for f in sorted(agents_path.glob("*.md")):
            try:
                meta = read_frontmatter(f)
            except Exception:
                continue
            name = meta.get("name") or f.stem
            if name.lower() in known or f.stem.lower() in known:
                continue
            known.add(name.lower())
            installed.append({
                "name": name,
                "description": meta.get("description", "")[:160],
                "model": meta.get("model", ""),
                "tier": "installed",
                "status": "online",
            })
    return installed


@router.get("/agents")
def get_agents():
    return AGENTS + get_installed_agents()
