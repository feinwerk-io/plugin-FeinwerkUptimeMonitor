#!/usr/bin/env bash
# Runs tests/js/promocard.check.js (javascripts/promocard.js together with the version 1 that Campaign Score 5.2.0 and
# 6.0.0-beta.4 ship, in every load order) in the devtools' browser runner: lib/browser.sh starts Chrome as
# fwrtest-browser with its sandbox on, on the test host by default. As root, from a root-owned checkout:
#
#   bash tests/js/run-promocard-check.sh
#
# Exit 0 when every check passed.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
chmod 700 "$work"

# the runner takes one root-only script file: put both card scripts in as the strings V1 and V2
python3 -I - "$here/fixtures/promocard-v1.js" "$here/../../javascripts/promocard.js" "$here/promocard.check.js" "$work/check.js" "$here/fixtures/promocard-v3.js" "$here/fixtures/promocard-v4.js" <<'PY'
import json, sys
v1, v2, check, out, v3, v4 = sys.argv[1:7]
with open(out, 'w') as f:
    f.write('const V1 = %s;\nconst V2 = %s;\nconst OLD3 = %s;\nconst OLD4 = %s;\n%s' % (json.dumps(open(v1).read()),
            json.dumps(open(v2).read()), json.dumps(open(v3).read()), json.dumps(open(v4).read()), open(check).read()))
PY
chmod 600 "$work/check.js"
: > "$work/none.pw"
chmod 600 "$work/none.pw"
mkdir -m 700 "$work/out"

cd /
# shellcheck source=/dev/null
source /opt/feinwerk-devtools/lib/common.sh
# shellcheck source=/dev/null
source /opt/feinwerk-devtools/lib/browser.sh
fw_browser_run "$work/none.pw" "$work/out" 300 "$work/check.js" </dev/null
