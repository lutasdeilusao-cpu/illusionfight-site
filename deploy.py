"""
deploy.py — Automate the full LDI workflow: version bump → build → commit → push → deploy.

Usage:
  python deploy.py -g pp -m "fixed chat layout"
  python deploy.py -g ldi jack -m "new scenes + item tweaks"
  python deploy.py -g site -m "AGENTS.md rewrite"
  python deploy.py -g ldi --minor -m "big feature drop"

Bump type (default: patch):
  --patch   1.0.0 → 1.0.1
  --minor   1.0.0 → 1.1.0
  --major   1.0.0 → 2.0.0
"""

import re
import sys
import subprocess
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# ── Game registry ───────────────────────────────────────────────────────────
# Each game maps to its version file, constant name, and SITE_MAP.md context
# markers (used to scope version replacements in the docs).

GAMES = {
    "ldi": {
        "const": "LDI_VERSION",
        "file": ROOT / "src/pages/LDI/store/useGameStore.js",
        "label": "Lendas do LDI",
        # Lines in SITE_MAP.md matching these AND old version get updated
        "sm_context": ["LENDAS DO LDI", "LDI_VERSION", "LDI versão", "Lendas do LDI"],
    },
    "jack": {
        "const": "JACK_VERSION",
        "file": ROOT / "src/pages/JackCandy/store/useJackStore.js",
        "label": "Jack Dream Candy",
        "sm_context": ["JACK DREAM BEER", "JACK versão", "Jack Dream"],
    },
    "toptrumps": {
        "const": "MP_VERSION",
        "file": ROOT / "src/pages/TopTrumpsMP.jsx",
        "label": "Top Trumps",
        "sm_context": ["Top Trumps LDI", "MP versão", "Top Trumps —"],
    },
    "minigames": {
        "const": "MINIGAMES_VERSION",
        "file": ROOT / "src/pages/MiniGames/version.js",
        "label": "MiniGames",
        "sm_context": ["MINIGAMES versão", "Mini Games", "MiniGames —"],
    },
    "arena": {
        "const": "ARENA_VERSION",
        "file": ROOT / "src/pages/Arena/ArenaRoute.jsx",
        "label": "Arena Mode",
        "sm_context": ["LDI Arena", "ARENA versão", "Arena Mode"],
    },
    "pp": {
        "const": "PP_VERSION",
        "file": ROOT / "src/pages/PesadeloParticular/PP.jsx",
        "label": "Pesadelo Particular",
        "sm_context": ["Pesadelo Particular", "PP"],
    },
    "tama": {
        "const": "TAMA_VERSION",
        "file": ROOT / "src/pages/Tamagoshi/store/useTamagoshiStore.js",
        "label": "Tamagoshi LDI",
        "sm_context": ["tama", "Tamagoshi", "TAMAGOSHI"],
    },
    "site": {
        "const": "SITE_VERSION",
        "file": ROOT / "src/config/version.js",
        "label": "Site global",
        "sm_context": ["Versão:", "SITE versão", "SITE_VERSION"],
    },
}


# ── Helpers ─────────────────────────────────────────────────────────────────

def run(cmd, cwd=None, capture=False):
    """Run a command, print output, raise SystemExit on failure."""
    print(f"\n  → {' '.join(cmd)}")
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd or ROOT,
            capture_output=capture,
            text=True,
            timeout=300,
            shell=False,
        )
    except subprocess.TimeoutExpired:
        print(f"  ✗ TIMEOUT: {' '.join(cmd)}")
        sys.exit(1)

    if capture:
        return result

    if result.returncode != 0:
        print(f"  ✗ FAILED (exit {result.returncode}): {' '.join(cmd)}")
        sys.exit(result.returncode)


def get_version(filepath, const_name):
    """Read the current version string from a source file."""
    content = filepath.read_text(encoding="utf-8")
    pattern = rf"(?:export\s+)?const\s+{re.escape(const_name)}\s*=\s*'([^']+)'"
    m = re.search(pattern, content)
    if not m:
        print(f"  ✗ Could not find {const_name} in {filepath}")
        sys.exit(1)
    return m.group(1)


def bump_version(version_str, part="patch"):
    """Bump a semver string: '1.2.3' + 'patch' → '1.2.4'."""
    parts = [int(x) for x in version_str.split(".")]
    if len(parts) != 3:
        print(f"  ✗ Version '{version_str}' is not semver X.Y.Z")
        sys.exit(1)

    if part == "major":
        return f"{parts[0] + 1}.0.0"
    if part == "minor":
        return f"{parts[0]}.{parts[1] + 1}.0"
    return f"{parts[0]}.{parts[1]}.{parts[2] + 1}"


def replace_version_in_file(filepath, old_ver, new_ver, const_name):
    """In-place replace the version string in a source file (line containing the const)."""
    content = filepath.read_text(encoding="utf-8")
    pattern = rf"((?:export\s+)?const\s+{re.escape(const_name)}\s*=\s*)'{re.escape(old_ver)}'"
    new_content = re.sub(pattern, rf"\1'{new_ver}'", content, count=1)
    if new_content == content:
        print(f"  ✗ Failed to replace {old_ver} in {filepath}")
        sys.exit(1)
    filepath.write_text(new_content, encoding="utf-8")
    print(f"  ✓ {filepath.relative_to(ROOT)}: {old_ver} → {new_ver}")


def update_site_map(game_key, old_ver, new_ver):
    """Replace old version with new in SITE_MAP.md, scoped to game context lines."""
    sm_path = ROOT / "SITE_MAP.md"
    content = sm_path.read_text(encoding="utf-8")
    lines = content.split("\n")
    updated = 0

    context_markers = GAMES[game_key]["sm_context"]
    escaped_old = re.escape(old_ver)

    new_lines = []
    for line in lines:
        if any(m.lower() in line.lower() for m in context_markers):
            if re.search(escaped_old, line):
                updated += 1
                line = line.replace(old_ver, new_ver)
        new_lines.append(line)

    if updated:
        sm_path.write_text("\n".join(new_lines), encoding="utf-8")
        print(f"  ✓ SITE_MAP.md: {updated} occurrence(s) of {old_ver} → {new_ver}")
    else:
        print(f"  ⚠ SITE_MAP.md: no lines matched for {game_key} with version {old_ver}")


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Bump versions, build, commit, push, deploy — full LDI workflow.",
    )
    parser.add_argument(
        "-g", "--games",
        nargs="+",
        required=True,
        choices=list(GAMES.keys()),
        help="Which game(s) were modified (ldi, jack, toptrumps, minigames, arena, pp, site)",
    )
    parser.add_argument(
        "-m", "--message",
        required=True,
        help="Commit message (version suffix will be auto-appended)",
    )
    bump_group = parser.add_mutually_exclusive_group()
    bump_group.add_argument("--patch", action="store_true", default=True, help="Bump patch (default)")
    bump_group.add_argument("--minor", action="store_true", help="Bump minor")
    bump_group.add_argument("--major", action="store_true", help="Bump major")

    args = parser.parse_args()

    if args.major:
        bump_type = "major"
    elif args.minor:
        bump_type = "minor"
    else:
        bump_type = "patch"

    print("=" * 60)
    print(f"  DEPLOY — {', '.join(args.games).upper()}  |  {bump_type} bump")
    print("=" * 60)

    # ── 1. Bump versions ─────────────────────────────────────────────────
    print("\n[1/5] BUMPING VERSIONS")
    bumps = []  # (label, old, new)

    for game_key in args.games:
        info = GAMES[game_key]
        old_ver = get_version(info["file"], info["const"])
        new_ver = bump_version(old_ver, bump_type)

        replace_version_in_file(info["file"], old_ver, new_ver, info["const"])
        update_site_map(game_key, old_ver, new_ver)
        bumps.append((info["label"], old_ver, new_ver))

    # ── 2. Build ─────────────────────────────────────────────────────────
    print("\n[2/5] BUILD")
    run(["npm", "run", "build"])

    # ── 3. Commit ────────────────────────────────────────────────────────
    print("\n[3/5] COMMIT")

    version_tags = " / ".join(f"v{new}" for _, _, new in bumps)
    commit_msg = f"{args.message} + {version_tags}"

    run(["git", "add", "-A"])
    run(["git", "commit", "-m", commit_msg])

    # ── 4. Push ──────────────────────────────────────────────────────────
    print("\n[4/5] PUSH")
    run(["git", "push"])

    # ── 5. Deploy ────────────────────────────────────────────────────────
    print("\n[5/5] DEPLOY")
    run(["npm", "run", "deploy"])

    # ── Report ───────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  DEPLOY COMPLETE")
    print("=" * 60)
    print(f"  Commit: {commit_msg}")

    # Get commit hash
    result = run(["git", "rev-parse", "--short", "HEAD"], capture=True)
    if result.returncode == 0:
        print(f"  Hash:   {result.stdout.strip()}")

    print("\n  Versions bumped:")
    for label, old, new in bumps:
        print(f"    {label}: {old} → {new}")

    print("\n  Done.\n")


if __name__ == "__main__":
    main()
