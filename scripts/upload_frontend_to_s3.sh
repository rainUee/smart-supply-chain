#!/bin/bash

BUCKET_NAME="supply-chain-mgmt-frontend-648mfstq"

BUILD_DIR="../frontend/build"

# Check build directory
if [ ! -d "$BUILD_DIR" ]; then
    echo "Please run the build command (e.g., npm run build) first."
    exit 1
fi

echo "🚀 Upload $BUILD_DIR to S3://$BUCKET_NAME/"

aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME/" \
  --delete \
  --cache-control "max-age=31536000,public"

aws s3 cp "$BUILD_DIR/index.html" "s3://$BUCKET_NAME/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

echo "✅ Upload completed."