[project]
name = "{{SLUG}}"
version = "0.1.0"
description = "{{DESCRIPTION_TOML}}"
readme = "README.md"
requires-python = ">=3"
dependencies = []

[dependency-groups]
dev = [
  "pytest",
  "ruff",
]

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.ruff]
line-length = 100
src = ["src", "tests"]
