#!/bin/bash
set -e

# Script to decode base64-encoded App Store Connect API private key
# Usage: decode_appstore_key.sh <KEY_ID> <BASE64_ENCODED_KEY>

# Check if required arguments are provided
if [ $# -ne 2 ]; then
    echo "Error: Missing required arguments"
    echo "Usage: $0 <KEY_ID> <BASE64_ENCODED_KEY>"
    echo "Example: $0 ABC123XYZ \"\$(cat key.p8 | base64)\""
    exit 1
fi

KEY_ID="$1"
BASE64_KEY="$2"

# Validate KEY_ID is not empty
if [ -z "$KEY_ID" ]; then
    echo "Error: KEY_ID cannot be empty"
    exit 1
fi

# Validate BASE64_KEY is not empty
if [ -z "$BASE64_KEY" ]; then
    echo "Error: BASE64_ENCODED_KEY cannot be empty"
    exit 1
fi

# Define output path
OUTPUT_PATH="/tmp/AuthKey_${KEY_ID}.p8"

# Decode base64 and write to file
echo "Decoding App Store Connect API key..."
echo "$BASE64_KEY" | base64 -d > "$OUTPUT_PATH"

# Verify the file was created successfully
if [ ! -f "$OUTPUT_PATH" ]; then
    echo "Error: Failed to create key file at $OUTPUT_PATH"
    exit 1
fi

# Check if file has content
if [ ! -s "$OUTPUT_PATH" ]; then
    echo "Error: Key file is empty at $OUTPUT_PATH"
    exit 1
fi

echo "Successfully decoded and saved App Store Connect API key to: $OUTPUT_PATH"

# Set appropriate permissions for the key file
chmod 600 "$OUTPUT_PATH"
echo "Set permissions to 600 (read/write for owner only)"

exit 0
