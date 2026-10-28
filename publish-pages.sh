#!/usr/bin/env bash
set -euo pipefail
repo='kaysongt/kingsword-chicago'
endpoint="repos/$repo/pages"
gh auth status
gh repo edit "$repo" --visibility public --accept-visibility-change-consequences
if response=$(gh api "$endpoint" 2>&1); then
  method=PUT
elif [[ "$response" == *'HTTP 404'* ]]; then
  method=POST
else
  printf '%s\n' "$response" >&2
  exit 1
fi
printf '%s' '{"build_type":"legacy","source":{"branch":"main","path":"/docs"}}' | gh api "$endpoint" --method "$method" --input - --jq '{html_url,status,source}'
printf '\nConfigured. GitHub may take a few minutes to publish:\nhttps://kaysongt.github.io/kingsword-chicago/\n'
