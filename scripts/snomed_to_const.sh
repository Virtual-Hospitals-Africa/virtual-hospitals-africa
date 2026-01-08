#!/bin/bash

# Converts SNOMED concept format from stdin to TypeScript constant
# Input format: 409060008 |Evaluation for signs and symptoms of physical health problems (procedure)|
# Output: TypeScript export const

read -r input

# Extract the ID (everything before the first space)
id=$(echo "$input" | sed 's/ |.*//')

# Extract the full term inside the pipes
full_term=$(echo "$input" | sed 's/^[0-9]* |//; s/|$//')

# Extract the category from parentheses at the end
category=$(echo "$full_term" | sed 's/.*(\([^)]*\))$/\1/')

# Extract the name (remove the category suffix)
name=$(echo "$full_term" | sed 's/ ([^)]*)$//')

# Convert name to SCREAMING_SNAKE_CASE for the constant name
const_name=$(echo "$name" | tr '[:lower:]' '[:upper:]' | sed "s/[^A-Z0-9]/_/g" | sed 's/__*/_/g' | sed 's/^_//; s/_$//')

cat <<EOF
export const $const_name = {
  id: '$id',
  name: '$name',
  category: '$category' as const,
}
EOF
