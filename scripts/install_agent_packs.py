"""Install the curated agent packs evaluated in docs/research/2026-10-19-agent-packs.md.

    python scripts/install_agent_packs.py              # install or update
    python scripts/install_agent_packs.py --dry-run    # print the plan, change nothing
    python scripts/install_agent_packs.py --force      # overwrite agents you edited locally
    python scripts/install_agent_packs.py --skip-plugins
"""
import argparse
import filecmp
import os
import pathlib
import shutil
import subprocess

SCRIPTS_DIR = pathlib.Path(__file__).resolve().parent
CLAUDE_DIR = pathlib.Path(os.environ.get("CLAUDE_CONFIG_DIR") or pathlib.Path.home() / ".claude")

AGENCY_REPO = "https://github.com/msitarzewski/agency-agents.git"
AGENCY_DIR = CLAUDE_DIR / "vendor" / "agency-agents"
AGENTS_DIR = CLAUDE_DIR / "agents"
AGENTS_LIST = SCRIPTS_DIR / "agent-packs.txt"

MARKETPLACES = ["wshobson/agents"]
PLUGINS = [
    "python-development@claude-code-workflows",
    "javascript-typescript@claude-code-workflows",
]


def run(cmd, dry_run):
    print("  $ " + " ".join(cmd))
    if dry_run:
        return 0
    code = subprocess.run(cmd).returncode
    if code != 0:
        print(f"  ! exited with {code}")
    return code


def read_agent_list():
    entries = []
    for line in AGENTS_LIST.read_text(encoding="utf-8").splitlines():
        line = line.split("#", 1)[0].strip()
        if line:
            entries.append(line)
    return entries


def sync_agency_repo(dry_run):
    print(f"\n[1/3] agency-agents -> {AGENCY_DIR}")
    if (AGENCY_DIR / ".git").exists():
        return run(["git", "-C", str(AGENCY_DIR), "pull", "--ff-only", "-q"], dry_run)
    return run(["git", "clone", "-q", "--depth", "1", AGENCY_REPO, str(AGENCY_DIR)], dry_run)


def install_agents(dry_run, force):
    print(f"\n[2/3] agents -> {AGENTS_DIR}")
    for rel in read_agent_list():
        src = AGENCY_DIR / rel
        dest = AGENTS_DIR / src.name
        if dry_run:
            print(f"  would copy {rel}")
            continue
        if not src.exists():
            print(f"  ! missing upstream: {rel}")
            continue
        if dest.exists() and filecmp.cmp(src, dest, shallow=False):
            print(f"  = {dest.name}")
            continue
        if dest.exists() and not force:
            print(f"  ~ {dest.name} differs from upstream, kept yours (use --force to overwrite)")
            continue
        AGENTS_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        print(f"  + {dest.name}")


def install_plugins(dry_run):
    print("\n[3/3] plugins")
    claude = shutil.which("claude")
    if not claude:
        print("  claude CLI not on PATH. Run these inside Claude Code instead:")
        for source in MARKETPLACES:
            print(f"    /plugin marketplace add {source}")
        for plugin in PLUGINS:
            print(f"    /plugin install {plugin}")
        return
    for source in MARKETPLACES:
        run([claude, "plugin", "marketplace", "add", source], dry_run)
    for plugin in PLUGINS:
        run([claude, "plugin", "install", plugin], dry_run)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="print the plan without changing anything")
    parser.add_argument("--force", action="store_true", help="overwrite agents that differ from upstream")
    parser.add_argument("--skip-plugins", action="store_true", help="only install the agency agents")
    args = parser.parse_args()

    if sync_agency_repo(args.dry_run) != 0:
        raise SystemExit("git failed; nothing was copied")
    install_agents(args.dry_run, args.force)
    if not args.skip_plugins:
        install_plugins(args.dry_run)
    print("\nDone. Restart Claude Code, then run /agents to see them.")


if __name__ == "__main__":
    main()
