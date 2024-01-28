#!/bin/bash
set -eo pipefail

GOLLY_PATTERNS_DIR="./golly/Patterns/Life"
PATTERNS_DIR="./public/patterns"

if ! [ -d "$GOLLY_PATTERNS_DIR" ]; then
  echo "Golly patterns directory does not exist. Please run \"npm run patterns:download\" first."
  exit 1
fi

rm -rf "$PATTERNS_DIR"
mkdir -p "$PATTERNS_DIR"
cp -a "$GOLLY_PATTERNS_DIR/." "$PATTERNS_DIR"

node ./scripts/build-pattern-library.js
