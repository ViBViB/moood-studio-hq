#!/bin/bash
# Usage: bash export-pdf.sh
# 1. Re-inlines style.css into proposal.html
# 2. Generates proposal-preoptima.pdf via Chrome headless

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT="file://${DIR}/index.html"
OUTPUT="${DIR}/proposal-preoptima.pdf"

echo "Inlining CSS..."
python3 - <<PYEOF
import re

logo_b64 = __import__('subprocess').check_output(
    ['base64', '-i', '${DIR}/../../../AGENCY_ASSETS/moood-logo.svg']
).decode().replace('\n', '')

css = open('${DIR}/style.css').read()
html = open('${DIR}/index.html').read()

# Replace <style> block with updated style.css
html = re.sub(r'<style>.*?</style>', f'<style>\n{css}\n</style>', html, flags=re.DOTALL)

# Inline all logo references (data URI and file path)
html = re.sub(
    r'src="data:image/svg\+xml;base64,[^"]*"',
    f'src="data:image/svg+xml;base64,{logo_b64}"',
    html
)
html = html.replace(
    'src="../../AGENCY_ASSETS/moood-logo.svg"',
    f'src="data:image/svg+xml;base64,{logo_b64}"'
)

open('${DIR}/index.html', 'w').write(html)
print(f"  proposal.html updated ({len(html)} chars)")
PYEOF

echo "Generating PDF..."
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="$OUTPUT" \
  --print-to-pdf-no-header \
  --run-all-compositor-stages-before-draw \
  --virtual-time-budget=5000 \
  "$INPUT" 2>/dev/null

if [ -f "$OUTPUT" ]; then
  echo "Done → proposal-preoptima.pdf"
  open "$OUTPUT"
else
  echo "Error: PDF not generated."
  exit 1
fi
