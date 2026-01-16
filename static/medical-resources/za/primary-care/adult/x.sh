#!/bin/bash
set -euo pipefail

# Check if any PDF files exist in the current directory
if ! ls *.pdf >/dev/null 2>&1; then
    echo "No PDF files found in the current directory."
    exit 1
fi

# Create an output directory

# Loop through all PDF files
for file in *.pdf; do
    # Get filename without extension
    filename="${file%.*}"
    
    echo "Converting $file..."
    
    # Convert command
    # -density: Sets the DPI (300 is high quality)
    # -alpha remove: Ensures a white background instead of transparency
    magick -density 300 "$file" -alpha remove "thumbnails/${filename}.png"
done

echo "Conversion complete! Check the 'thumbnails' folder."