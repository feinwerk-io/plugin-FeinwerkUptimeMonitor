#!/usr/bin/env bash
# Runs tests/js/promo.check.js (javascripts/promo.js, version 3, together with the oldest version 2 still shipped,
# tests/js/fixtures/promo-v2.js: "the first copy wins", no compact logo, no demo mode) in every load order, with the
# kit's real stylesheets and logo, in the devtools' browser runner: lib/browser.sh starts Chrome as fwrtest-browser with
# its sandbox on, on the test host by default. As root, from a root-owned checkout:
#
#   bash tests/js/run-promo-check.sh
#
# Exit 0 when every check passed.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
chmod 700 "$work"

# the runner takes one root-only script file: both scripts, the stylesheets and the logo go in as strings
python3 -I - "$here" "$work/check.js" <<'PY'
import json, re, sys
here, out = sys.argv[1:3]
root = here + '/../..'
read = lambda p: open(p, encoding='utf-8').read()
logo = re.sub(r'\{#.*?#\}\s*', '', read(root + '/templates/_feinwerkLogo.twig'), flags=re.S).strip()
css = read(root + '/stylesheets/promo.css') + '\n' + read(root + '/stylesheets/feinwerklogo.css')
with open(out, 'w', encoding='utf-8') as f:
    f.write('const V2 = %s;\nconst OLD3 = %s;\nconst OLD4 = %s;\nconst V3 = %s;\nconst CSS = %s;\nconst LOGO = %s;\n%s' % (
        json.dumps(read(here + '/fixtures/promo-v2.js')), json.dumps(read(here + '/fixtures/promo-v3.js')),
        json.dumps(read(here + '/fixtures/promo-v4.js')),
        json.dumps(read(root + '/javascripts/promo.js')),
        json.dumps(css), json.dumps(logo), read(here + '/promo.check.js')))
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
