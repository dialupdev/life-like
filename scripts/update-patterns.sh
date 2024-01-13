#!/bin/bash
set -eo pipefail

LIBRARY_DIR="./library"
PATTERNS_SOURCE_FILENAME="$LIBRARY_DIR/patterns.zip"

mkdir -p $LIBRARY_DIR
curl -o $PATTERNS_SOURCE_FILENAME https://conwaylife.com/patterns/all.zip

