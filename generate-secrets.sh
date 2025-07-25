#!/bin/bash

echo "🔐 Generating Secure Secrets for MyLocal Connect"
echo "=============================================="
echo ""

echo "🔑 JWT Secret:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""

echo "🔑 Session Secret:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""

echo "📝 Copy these secrets and use them in your Render environment variables:"
echo "- JWT_SECRET: Use the first secret"
echo "- SESSION_SECRET: Use the second secret"
echo ""

echo "⚠️  Keep these secrets secure and never commit them to your repository!"
