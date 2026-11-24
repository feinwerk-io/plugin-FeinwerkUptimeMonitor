#!/usr/bin/env bash
# Runs tests/js/connectorinstaller.check.js: javascripts/connectorinstaller.js loaded many times and next to older and
# newer versions, as Matomo does when several Feinwerk plugins ship it, must still navigate exactly once (release review
# 2026-11-24). Fixtures: connectorinstaller-v2.js (0338553), -v1.js (18443c5), -v0.js (fe32b50, unguarded). jQuery from the root-owned
# Matomo 5.0.0 code tree (read as data). The devtools' browser runner starts Chrome as fwrtest-browser with its sandbox
# on, on the test host by default. As root, from a root-owned checkout:
#
#   bash tests/js/run-connectorinstaller-check.sh
#
# Exit 0 when every check passed.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
chmod 700 "$work"

python3 -I - "$here/../../javascripts/connectorinstaller.js" "/srv/feinwerk-build/matomo-compat/5.0.0/node_modules/jquery/dist/jquery.min.js" "$here/connectorinstaller.check.js" "$work/check.js" "$here/fixtures/connectorinstaller-v1.js" "$here/fixtures/connectorinstaller-v0.js" "$here/fixtures/connectorinstaller-v2.js" <<'PY'
import json, sys
script, jquery, check, out, v1, v0, v2 = sys.argv[1:8]
with open(out, 'w') as f:
    f.write('const INSTALLER = %s;\nconst OLD1 = %s;\nconst OLD0 = %s;\nconst OLD2 = %s;\nconst JQUERY = %s;\n%s' % (
            json.dumps(open(script).read()), json.dumps(open(v1).read()), json.dumps(open(v0).read()),
            json.dumps(open(v2).read()), json.dumps(open(jquery).read()), open(check).read()))
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
