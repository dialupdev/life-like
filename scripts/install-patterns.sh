#!/bin/bash
set -eo pipefail

LIBRARY_DIR="./library"
PATTERNS_SOURCE_FILE="$LIBRARY_DIR/jslife.zip"
PATTERNS_SOURCE_DIR="$LIBRARY_DIR/jslife"
PUBLIC_DIR="./public"
PATTERNS_DIR="$PUBLIC_DIR/patterns"

if ! [ -f $PATTERNS_SOURCE_FILE ]; then
  echo "Patterns source file does not exist. Please run \"npm run patterns:download\" first."
  exit 1
fi

rm -rf "$PATTERNS_DIR"
mkdir -p "$PATTERNS_DIR"
unzip -n -q $PATTERNS_SOURCE_FILE -d $LIBRARY_DIR
cp -a "$PATTERNS_SOURCE_DIR/." "$PATTERNS_DIR"

node ./scripts/build-pattern-library.js $PUBLIC_DIR $PATTERNS_DIR
