#!/usr/bin/env bash
# Build every reel folder given (default: all r*/ with a spec.json)
cd "$(dirname "$0")"
for r in ${@:-r*/}; do r=${r%/}; [ -f "$r/spec.json" ] || continue; echo "== $r"; WORKERS=${WORKERS:-4} ./make.sh "$r" 2>&1 | grep -vE "^\[w|^frame|^base [0-9]" ; done
