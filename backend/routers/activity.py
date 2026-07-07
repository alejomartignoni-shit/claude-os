import pathlib
from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()


@router.get("/activity")
def get_activity():
    activities = []
    sessions_path = pathlib.Path(r"C:/Users/Alejo/.claude")
    if sessions_path.exists():
        json_files = sorted(
            sessions_path.glob("*.json"),
            key=lambda x: x.stat().st_mtime,
            reverse=True
        )[:8]
        for f in json_files:
            activities.append({
                "time": datetime.fromtimestamp(f.stat().st_mtime, tz=timezone.utc).isoformat(),
                "text": "Claude session: " + f.stem[:50],
                "platform": "claude"
            })
    if not activities:
        activities = [
            {
                "time": datetime.now(timezone.utc).isoformat(),
                "text": "Claude OS started",
                "platform": "system"
            }
        ]
    return activities
