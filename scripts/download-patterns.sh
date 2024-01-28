#!/bin/bash
set -eo pipefail

GOLLY_DIR="./golly"

if ! [ -d "$GOLLY_DIR" ]; then
  git clone --no-checkout --depth=1 https://git.code.sf.net/p/golly/code "$GOLLY_DIR"
fi

cd "$GOLLY_DIR"
git pull
git sparse-checkout set --no-cone Patterns
git checkout
