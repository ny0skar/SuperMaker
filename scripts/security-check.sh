#!/bin/bash
# Security check script — run before deploys
# Protects against supply chain attacks

echo "🔒 Running security checks..."
echo ""

# 1. Check for known vulnerable versions
echo "1. Checking for compromised packages..."
AXIOS_VERSION=$(npm ls axios --json 2>/dev/null | grep -o '"axios": "[^"]*"' | head -1)
if echo "$AXIOS_VERSION" | grep -qE '1\.14\.1|0\.30\.4'; then
  echo "   ❌ COMPROMISED axios version detected! Do NOT deploy."
  exit 1
fi
echo "   ✅ No compromised packages found"

# 2. Run npm audit
echo ""
echo "2. Running npm audit..."
AUDIT_RESULT=$(npm audit 2>&1)
if echo "$AUDIT_RESULT" | grep -q "found 0 vulnerabilities"; then
  echo "   ✅ No vulnerabilities found"
else
  echo "   ⚠️  Vulnerabilities found:"
  echo "$AUDIT_RESULT" | tail -5
fi

# 3. Check for suspicious postinstall scripts in dependencies
echo ""
echo "3. Checking for suspicious postinstall scripts..."
SUSPICIOUS=$(find node_modules -maxdepth 2 -name "package.json" -exec grep -l '"postinstall"' {} \; 2>/dev/null | head -10)
if [ -n "$SUSPICIOUS" ]; then
  echo "   ⚠️  Packages with postinstall scripts (review if unfamiliar):"
  for pkg in $SUSPICIOUS; do
    PKG_NAME=$(dirname "$pkg" | sed 's|node_modules/||')
    echo "      - $PKG_NAME"
  done
else
  echo "   ✅ No postinstall scripts found"
fi

# 4. Check ignore-scripts is enabled
echo ""
echo "4. Checking ignore-scripts config..."
if [ -f ".npmrc" ] && grep -q "ignore-scripts=true" .npmrc; then
  echo "   ✅ ignore-scripts=true is set"
else
  echo "   ❌ ignore-scripts is NOT set — run: echo 'ignore-scripts=true' >> .npmrc"
fi

echo ""
echo "🔒 Security check complete."
