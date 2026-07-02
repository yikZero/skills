.PHONY: install format lint test diff-check validate

install:
	uv sync

format:
	uv run ruff format .

lint:
	uv run ruff check .

test:
	uv run pytest

diff-check:
	@if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then git diff --check; else echo "Skipping git diff --check outside git repo"; fi

validate:
	uv run ruff format --check . && uv run ruff check . && uv run pytest && $(MAKE) diff-check
