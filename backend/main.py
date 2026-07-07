import os
import sys
import pathlib
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sys.path.insert(0, os.path.dirname(__file__))

from routers import memory, skills, agents, dream, activity

app = FastAPI(title="Claude OS Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(memory.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(dream.router, prefix="/api")
app.include_router(activity.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/stats")
def stats():
    obsidian_path = pathlib.Path(os.path.expanduser("~/Documents/ObsidianVault/AlejoOS"))
    _home = pathlib.Path(os.path.expanduser("~"))
    _m1 = _home / ".claude/projects/c--Users-Alejo--claude/memory"
    claude_memory_path = _m1 if _m1.exists() else _home / ".claude/memory"
    skills_path = _home / ".claude/skills"

    obsidian_count = len(list(obsidian_path.rglob("*.md"))) if obsidian_path.exists() else 0
    memory_count = len(list(claude_memory_path.rglob("*.md"))) if claude_memory_path.exists() else 0
    skills_count = len([d for d in skills_path.iterdir() if d.is_dir()]) if skills_path.exists() else 0

    return {
        "skills_count": skills_count,
        "memory_files": memory_count,
        "obsidian_files": obsidian_count,
        "last_sync": datetime.now(timezone.utc).isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8082))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
