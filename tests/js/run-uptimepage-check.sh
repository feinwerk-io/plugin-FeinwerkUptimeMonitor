#!/usr/bin/env bash
# Runs tests/js/uptimepage.check.js: behaviour checks of the built Vue app (vue/dist/FeinwerkUptimeMonitor.umd.js) on Vue
# of Matomo 6 (or 5) in the devtools' browser runner: lib/browser.sh starts Chrome as fwrtest-browser with its sandbox
# on, on the test host by default. The page's answer for a past day and for now, the outage totals inside a period,
# the columns of a day without measurements, the certificate figure, the reasons for what cannot be checked, the
# dashboard card's one place and the card itself (with the kit's javascripts/promocard.js). As root, from a
# root-owned checkout, after a build (fw-vue build):
#
#   bash tests/js/run-uptimepage-check.sh [6|5]
#
# Vue comes from the root-only Matomo test harness (/var/lib/fw-matomo-tests/m6 or m5), never from a web user's tree.
# Exit 0 when every check passed.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../.." && pwd)
line=${1:-6}
case "$line" in
    6|5) vue="${FWUM_HARNESS:-/var/lib/fw-matomo-tests}/m$line/node_modules/vue/dist/vue.global.prod.js" ;;
    *) echo "usage: $0 [6|5]" >&2; exit 2 ;;
esac
[ -f "$vue" ] || { echo "no Vue at $vue" >&2; exit 2; }
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
chmod 700 "$work"

# the runner takes one root-only script file: Vue, the plugin's bundle, its English texts and the kit's card script go
# in as strings
python3 -I - "$vue" "$root/vue/dist/FeinwerkUptimeMonitor.umd.js" "$root/lang/en.json" \
    "$root/javascripts/promocard.js" "$here/uptimepage.check.js" "$work/check.js" <<'PY'
import json, sys
vue, umd, en, kit, check, out = sys.argv[1:7]
with open(out, 'w') as f:
    f.write('const VUE = %s;\nconst UMD = %s;\nconst EN = %s;\nconst KIT = %s;\n%s' % (
        json.dumps(open(vue).read()), json.dumps(open(umd).read()), json.dumps(open(en).read()),
        json.dumps(open(kit).read()), open(check).read()))
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
