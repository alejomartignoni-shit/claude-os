import json
import subprocess
import pathlib
from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()

DREAM_PATH = pathlib.Path(r"C:/Users/Alejo/claude-os/dream_history.json")
OBSIDIAN_PATH = pathlib.Path(r"C:/Users/Alejo/Documents/ObsidianVault/AlejoOS")
CLAUDE_MEMORY_PATH = pathlib.Path(r"C:/Users/Alejo/.claude/memory")


def build_context():
    parts = ["# DREAM ANALYSIS CONTEXT\n", "Analyze patterns and generate actionable insights.\n"]
    parts.append("\n## Obsidian Notes (most recent 8):")
    if OBSIDIAN_PATH.exists():
        files = sorted(OBSIDIAN_PATH.rglob("*.md"), key=lambda f: f.stat().st_mtime, reverse=True)[:8]
        for f in files:
            try:
                content = f.read_text(encoding="utf-8", errors="ignore")[:600]
                parts.append(f"\n### {f.stem}\n{content}")
            except Exception:
                pass
    parts.append("\n\n## Claude Memory Files:")
    if CLAUDE_MEMORY_PATH.exists():
        for f in sorted(CLAUDE_MEMORY_PATH.glob("*.md"))[:10]:
            try:
                content = f.read_text(encoding="utf-8", errors="ignore")[:400]
                parts.append(f"\n### {f.stem}\n{content}")
            except Exception:
                pass
    return "\n".join(parts)


def load_history():
    if DREAM_PATH.exists():
        try:
            return json.loads(DREAM_PATH.read_text())
        except Exception:
            pass
    return []


def save_dream(data):
    history = load_history()
    history.insert(0, data)
    DREAM_PATH.write_text(json.dumps(history[:10], indent=2))


PROMPT = """You are Alejo's Dream Engine. Analyze the context below about his projects and memory.

Generate 3-5 specific, actionable improvement suggestions based on patterns you observe.

Return ONLY valid JSON:
{
  "generated_at": "ISO datetime",
  "improvements_found": 4,
  "summary": "Brief summary",
  "patterns": [
    {
      "type": "COST|PATTERN|OPPORTUNITY|RISK|HABIT",
      "title": "Short title",
      "description": "2-3 sentences",
      "why": "Why this matters and what to do"
    }
  ]
}

Context:
"""


@router.get("/dream/latest")
def get_latest():
    history = load_history()
    return history[0] if history else None


@router.get("/dream/history")
def get_history():
    return load_history()


@router.post("/dream/run")
def run_dream():
    context = build_context()
    prompt = PROMPT + context[:3000]
    try:
        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True, text=True, timeout=120, encoding="utf-8"
        )
        output = result.stdout.strip()
        start = output.find("{")
        end = output.rfind("}") + 1
        if start >= 0 and end > start:
            data = json.loads(output[start:end])
        else:
            data = {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "improvements_found": 1,
                "summary": "Dream engine ran.",
                "patterns": [{
                    "type": "INSIGHT",
                    "title": "Dream Engine Active",
                    "description": "The dream engine ran. Raw output captured.",
                    "why": output[:300] if output else "No output. Check claude CLI."
                }]
            }
        data["generated_at"] = datetime.now(timezone.utc).isoformat()
        save_dream(data)
        return data
    except subprocess.TimeoutExpired:
        return {"error": "Timeout", "patterns": [], "generated_at": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        return {"error": str(e), "patterns": [], "generated_at": datetime.now(timezone.utc).isoformat()}
