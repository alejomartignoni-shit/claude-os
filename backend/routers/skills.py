import pathlib
from fastapi import APIRouter

router = APIRouter()

SKILLS_PATH = pathlib.Path(r"C:/Users/Alejo/.claude/skills")

DESCRIPTIONS = {
    "autopilot": "Autonomous task execution loop",
    "ultrawork": "Deep work parallelization harness",
    "ralph": "PRD-driven persistence loop",
    "deep-research": "Multi-source research with adversarial verification",
    "claude-api": "Claude API reference and usage patterns",
    "frontend-patterns": "React/Vue/Svelte frontend patterns",
    "backend-patterns": "API and server-side patterns",
    "agent-harness-construction": "Build custom agent harnesses",
    "content-engine": "Content automation pipeline",
    "market-research": "Competitive intelligence gathering",
    "agentic-engineering": "Engineering agentic AI systems",
    "ai-first-engineering": "AI-first software development",
    "deep-dive": "Deep analysis on any topic",
    "security-review": "Security vulnerability scanning",
    "tdd-workflow": "Test-driven development workflow",
}


def get_category(name):
    n = name.lower()
    if any(x in n for x in ["frontend", "react", "css", "web", "ui", "design"]):
        return "frontend"
    if any(x in n for x in ["backend", "api", "database", "postgres", "python"]):
        return "backend"
    if any(x in n for x in ["agent", "harness", "orchestrat", "ultrawork", "ralph", "autopilot", "agentic"]):
        return "agents"
    if any(x in n for x in ["claude", "llm", "model", "ai-first", "prompt"]):
        return "ai"
    if any(x in n for x in ["research", "market", "intel", "search", "deep"]):
        return "research"
    if any(x in n for x in ["content", "social", "brand", "article"]):
        return "content"
    if any(x in n for x in ["security", "review", "tdd", "test"]):
        return "quality"
    return "general"


@router.get("/skills")
def get_skills():
    if not SKILLS_PATH.exists():
        return []
    skills = []
    for item in sorted(SKILLS_PATH.iterdir()):
        if not item.is_dir():
            continue
        description = DESCRIPTIONS.get(item.name, "")
        if not description:
            skill_md = item / "SKILL.md"
            if skill_md.exists():
                try:
                    content = skill_md.read_text(encoding="utf-8", errors="ignore")
                    lines = [l.strip() for l in content.split("\n") if l.strip() and not l.startswith("#")]
                    if lines:
                        description = lines[0][:120]
                except Exception:
                    pass
        skills.append({
            "name": item.name,
            "description": description,
            "category": get_category(item.name),
            "path": str(item),
        })
    return skills
