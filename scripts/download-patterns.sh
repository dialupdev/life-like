# https://entropymine.com/jason/life/

#!/bin/bash
set -eo pipefail

LIBRARY_DIR="./library"
PATTERNS_SOURCE_FILE="$LIBRARY_DIR/jslife.zip"

if [ -f $PATTERNS_SOURCE_FILE ]; then
  echo "Patterns source file already exists. Skipping download."
  exit 0
fi

mkdir -p $LIBRARY_DIR
curl -o $PATTERNS_SOURCE_FILE https://entropymine.com/jason/life/p/jslife-20121230.zip
