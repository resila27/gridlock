#!/bin/sh
set -eu

repository="/Users/dki/Documents/Codex/Gridlock/repository"
credentials="/Users/dki/Documents/Codex/Gridlock/deploy"
runtime="/Users/dki/.cache/codex-runtimes/codex-primary-runtime/dependencies"
git_bin="$runtime/bin/fallback/git"
node_bin="$runtime/node/bin"
remote="dh_4bkyxs@pdx1-shared-a1-37.dreamhost.com"
remote_path="gridlockword.com"
key="$credentials/dreamhost-deploy-key"
known_hosts="$credentials/known-hosts"

usage() {
  echo "Usage: $0 --verify | --deploy" >&2
  exit 2
}

mode="${1:-}"
case "$mode" in
  --verify|--deploy) ;;
  *) usage ;;
esac

test -d "$repository/.git"
test -f "$key"
test -f "$known_hosts"
cd "$repository"

branch=$("$git_bin" branch --show-current)
test "$branch" = "main"
test -z "$("$git_bin" status --porcelain)"

head_sha=$("$git_bin" rev-parse HEAD)
origin_sha=$("$git_bin" rev-parse origin/main)
test "$head_sha" = "$origin_sha"

test -x "./node_modules/.bin/tsc"
test -x "./node_modules/.bin/vite"
PATH="$node_bin:$PATH" ./node_modules/.bin/tsc --noEmit
PATH="$node_bin:$PATH" ./node_modules/.bin/vite build
PATH="$node_bin:$PATH" node scripts/build-server.mjs
"$git_bin" diff --check
test -z "$("$git_bin" status --porcelain)"

ssh_options="-o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=$known_hosts -i $key"
ssh $ssh_options "$remote" "test -d $remote_path"

if [ "$mode" = "--deploy" ]; then
  RSYNC_RSH="ssh $ssh_options" rsync -avz --delete --exclude '.DS_Store' "$repository/public/" "$remote:$remote_path/"
fi

echo "GRIDLOCK $mode succeeded at commit $head_sha"
