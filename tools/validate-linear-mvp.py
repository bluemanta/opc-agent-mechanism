#!/usr/bin/env python3
"""
Validate Linear Issue and Agent result Markdown for the direct-read MVP workflow.

Usage:
  python tools/validate-linear-mvp.py issue path/to/issue.md
  python tools/validate-linear-mvp.py result path/to/comment.md
  cat issue.md | python tools/validate-linear-mvp.py issue -
"""

import argparse
import re
import sys
from pathlib import Path


REQUIRED_SECTIONS = {
    "issue": ["Task", "Scope", "Acceptance", "Return Evidence"],
    "result": ["Result", "Changed", "Verification", "Risks", "Next"],
}

OPTIONAL_SECTIONS = {
    "issue": ["Background"],
    "result": [],
}


def read_input(path: str) -> str:
    if path == "-":
        return sys.stdin.read()
    return Path(path).read_text(encoding="utf-8")


def parse_sections(markdown: str) -> dict[str, str]:
    heading_pattern = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)
    matches = list(heading_pattern.finditer(markdown))
    sections: dict[str, str] = {}

    for index, match in enumerate(matches):
        title = match.group(1).strip()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(markdown)
        sections[title] = markdown[start:end].strip()

    return sections


def is_placeholder_only(content: str) -> bool:
    normalized = re.sub(r"\s+", "", content)
    placeholders = {
        "",
        "要完成什么。",
        "什么算完成。",
        "本次要做什么/不做什么。",
        "完成后直接回填：变更摘要、文件/链接、验证结果、风险。",
        "完成了什么。",
        "涉及的文件、PR、链接或产物。",
        "运行了什么检查，结果如何。",
        "剩余风险、未覆盖部分、需要人工判断的点。",
        "建议下一步；没有则写“无”。",
    }
    return normalized in {re.sub(r"\s+", "", item) for item in placeholders}


def validate(kind: str, markdown: str) -> list[str]:
    sections = parse_sections(markdown)
    errors: list[str] = []

    for title in REQUIRED_SECTIONS[kind]:
        if title not in sections:
            errors.append(f"missing required section: ## {title}")
            continue
        if is_placeholder_only(sections[title]):
            errors.append(f"section is empty or still placeholder: ## {title}")

    for title in OPTIONAL_SECTIONS[kind]:
        if title in sections and title != "Background" and not sections[title].strip():
            errors.append(f"optional section is present but empty: ## {title}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Linear MVP Markdown templates.")
    parser.add_argument("kind", choices=sorted(REQUIRED_SECTIONS), help="Markdown type to validate.")
    parser.add_argument("path", help="Markdown file path, or '-' for stdin.")
    args = parser.parse_args()

    try:
        markdown = read_input(args.path)
    except OSError as error:
        print(f"failed to read input: {error}", file=sys.stderr)
        return 2

    errors = validate(args.kind, markdown)
    if errors:
        print(f"{args.kind} validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"{args.kind} validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
