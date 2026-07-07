import pathlib
import re
from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()

OBSIDIAN_PATH = pathlib.Path(r"C:/Users/Alejo/Documents/ObsidianVault/AlejoOS")
# Try the per-project memory path first, then fallback to global
_MEM1 = pathlib.Path(r"C:/Users/Alejo/.claude/projects/c--Users-Alejo--claude/memory")
_MEM2 = pathlib.Path(r"C:/Users/Alejo/.claude/memory")
CLAUDE_MEMORY_PATH = _MEM1 if _MEM1.exists() else _MEM2


def extract_wikilinks(content: str):
    return re.findall(r"\[\[([^\]]+)\]\]", content)


@router.get("/memory/files")
def get_memory_files():
    files = []
    if OBSIDIAN_PATH.exists():
        for f in OBSIDIAN_PATH.rglob("*.md"):
            files.append({
                "id": str(f.relative_to(OBSIDIAN_PATH)),
                "name": f.stem,
                "source": "obsidian",
                "path": str(f),
                "size": f.stat().st_size,
                "modified": datetime.fromtimestamp(f.stat().st_mtime, tz=timezone.utc).isoformat()
            })
    if CLAUDE_MEMORY_PATH.exists():
        for f in CLAUDE_MEMORY_PATH.rglob("*.md"):
            files.append({
                "id": str(f.relative_to(CLAUDE_MEMORY_PATH)),
                "name": f.stem,
                "source": "claude",
                "path": str(f),
                "size": f.stat().st_size,
                "modified": datetime.fromtimestamp(f.stat().st_mtime, tz=timezone.utc).isoformat()
            })
    return files


@router.get("/memory/graph")
def get_memory_graph():
    nodes = []
    links = []
    name_to_id = {}
    all_files = []

    if OBSIDIAN_PATH.exists():
        for f in OBSIDIAN_PATH.rglob("*.md"):
            node_id = "obs::" + f.stem
            nodes.append({"id": node_id, "name": f.stem, "source": "obsidian", "size": f.stat().st_size})
            name_to_id[f.stem.lower()] = node_id
            all_files.append((f, node_id))

    if CLAUDE_MEMORY_PATH.exists():
        for f in CLAUDE_MEMORY_PATH.rglob("*.md"):
            node_id = "mem::" + f.stem
            nodes.append({"id": node_id, "name": f.stem, "source": "claude", "size": f.stat().st_size})
            name_to_id[f.stem.lower()] = node_id
            all_files.append((f, node_id))

    for f, node_id in all_files:
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
            for link in extract_wikilinks(content):
                target_id = name_to_id.get(link.lower())
                if target_id and target_id != node_id:
                    links.append({"source": node_id, "target": target_id})
        except Exception:
            pass

    return {"nodes": nodes, "links": links}
