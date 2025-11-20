#!/bin/bash
set -e

# Script to update iOS bundle identifier in Xcode project
# Usage: update_bundle_id_ios.sh <NEW_BUNDLE_ID>

# Check if required argument is provided
if [ $# -ne 1 ]; then
    echo "Error: Missing required argument"
    echo "Usage: $0 <NEW_BUNDLE_ID>"
    echo "Example: $0 com.mycompany.myapp"
    exit 1
fi

NEW_BUNDLE_ID="$1"

# Validate bundle ID format (basic validation)
if ! [[ "$NEW_BUNDLE_ID" =~ ^[a-zA-Z0-9.-]+$ ]]; then
    echo "Error: Invalid bundle ID format. Bundle ID should contain only letters, numbers, dots, and hyphens."
    exit 1
fi

# Define paths
PROJECT_DIR="ios/App"
PBXPROJ_FILE="${PROJECT_DIR}/App.xcodeproj/project.pbxproj"
CAPACITOR_CONFIG="capacitor.config.ts"

# Check if project files exist
if [ ! -f "$PBXPROJ_FILE" ]; then
    echo "Error: Xcode project file not found at $PBXPROJ_FILE"
    exit 1
fi

if [ ! -f "$CAPACITOR_CONFIG" ]; then
    echo "Error: Capacitor config file not found at $CAPACITOR_CONFIG"
    exit 1
fi

echo "Updating iOS bundle identifier to: $NEW_BUNDLE_ID"

# Backup files before modification
echo "Creating backup of project files..."
cp "$PBXPROJ_FILE" "${PBXPROJ_FILE}.backup"
cp "$CAPACITOR_CONFIG" "${CAPACITOR_CONFIG}.backup"

# Update bundle identifier in Xcode project file
echo "Updating bundle identifier in $PBXPROJ_FILE..."
sed -i.tmp "s/PRODUCT_BUNDLE_IDENTIFIER = .*;/PRODUCT_BUNDLE_IDENTIFIER = ${NEW_BUNDLE_ID};/g" "$PBXPROJ_FILE"
rm -f "${PBXPROJ_FILE}.tmp"

# Update bundle identifier in Capacitor config
echo "Updating bundle identifier in $CAPACITOR_CONFIG..."
sed -i.tmp "s/appId: '[^']*'/appId: '${NEW_BUNDLE_ID}'/g" "$CAPACITOR_CONFIG"
rm -f "${CAPACITOR_CONFIG}.tmp"

# Verify changes were made
if grep -q "$NEW_BUNDLE_ID" "$PBXPROJ_FILE" && grep -q "$NEW_BUNDLE_ID" "$CAPACITOR_CONFIG"; then
    echo "Successfully updated bundle identifier to: $NEW_BUNDLE_ID"
    echo "Files updated:"
    echo "  - $PBXPROJ_FILE"
    echo "  - $CAPACITOR_CONFIG"
    
    # Clean up backup files on success
    rm -f "${PBXPROJ_FILE}.backup"
    rm -f "${CAPACITOR_CONFIG}.backup"
else
    echo "Error: Failed to update bundle identifier"
    echo "Restoring backup files..."
    mv "${PBXPROJ_FILE}.backup" "$PBXPROJ_FILE" 2>/dev/null || true
    mv "${CAPACITOR_CONFIG}.backup" "$CAPACITOR_CONFIG" 2>/dev/null || true
    exit 1
fi

exit 0
