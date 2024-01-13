#!/bin/bash
set -eo pipefail

PATTERNS_SOURCE_FILENAME="./library/patterns.zip"
PUBLIC_DIR="./public"
PATTERNS_DIR="./public/patterns"

if ! [ -f $PATTERNS_SOURCE_FILENAME ]; then
  echo "Patterns source file does not exist. Please run \"npm run patterns:update\" first."
  exit 1
fi

mkdir -p $PATTERNS_DIR
unzip -n -q $PATTERNS_SOURCE_FILENAME -d $PATTERNS_DIR

node ./scripts/build-pattern-library.js $PUBLIC_DIR $PATTERNS_DIR
