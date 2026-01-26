#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Resize PNG thumbnails to a specified width while maintaining aspect ratio.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-run scripts/resize_thumbnails.ts [width]
 *
 * Default width: 150px
 *
 * Requirements:
 *   - ImageMagick (convert command) must be installed
 */

const DEFAULT_WIDTH = 150
const SOURCE_DIR = 'static/medical-resources/za/primary-care/adult/thumbnails'

async function main() {
  const target_width = parseInt(Deno.args[0] || String(DEFAULT_WIDTH))

  if (isNaN(target_width) || target_width <= 0) {
    console.error('Error: Width must be a positive number')
    Deno.exit(1)
  }

  const target_dir = `${SOURCE_DIR}/${target_width}`

  console.log(`Resizing thumbnails to ${target_width}px width...`)
  console.log(`Source: ${SOURCE_DIR}`)
  console.log(`Target: ${target_dir}\n`)

  // Check if ImageMagick is available
  try {
    const check = await new Deno.Command('convert', {
      args: ['-version'],
      stdout: 'null',
      stderr: 'null',
    }).output()

    if (!check.success) {
      throw new Error('ImageMagick not available')
    }
  } catch {
    console.error('Error: ImageMagick is not installed or not in PATH')
    console.error('Install with: brew install imagemagick')
    Deno.exit(1)
  }

  // Create target directory
  try {
    await Deno.mkdir(target_dir, { recursive: true })
  } catch (error) {
    console.error(`Error creating directory ${target_dir}:`, error)
    Deno.exit(1)
  }

  // Get all PNG files
  const files: string[] = []
  try {
    for await (const entry of Deno.readDir(SOURCE_DIR)) {
      if (entry.isFile && entry.name.endsWith('.png')) {
        files.push(entry.name)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${SOURCE_DIR}:`, error)
    Deno.exit(1)
  }

  if (files.length === 0) {
    console.log('No PNG files found to resize')
    return
  }

  files.sort((a, b) => {
    const numA = parseInt(a.replace('.png', ''))
    const numB = parseInt(b.replace('.png', ''))
    return numA - numB
  })

  console.log(`Found ${files.length} PNG files to resize\n`)

  let processed = 0

  for (const file of files) {
    const source_path = `${SOURCE_DIR}/${file}`
    const target_path = `${target_dir}/${file}`

    // Use ImageMagick to resize
    // -resize: resize to width, maintain aspect ratio
    // -strip: remove metadata to reduce file size
    // -quality: PNG quality setting
    const command = new Deno.Command('convert', {
      args: [
        source_path,
        '-resize',
        `${target_width}x`,
        '-strip',
        target_path,
      ],
      stdout: 'null',
      stderr: 'piped',
    })

    const output = await command.output()

    if (!output.success) {
      const errorText = new TextDecoder().decode(output.stderr)
      throw new Error(errorText)
    }

    processed++

    // Show progress every 10 files
    if (processed % 10 === 0) {
      console.log(`Processed ${processed}/${files.length} files...`)
    }
  }

  console.log(`\nComplete!`)
  console.log(`Successfully processed: ${processed}`)

  const firstFile = files[0]
  const sourceStats = await Deno.stat(`${SOURCE_DIR}/${firstFile}`)
  const targetStats = await Deno.stat(`${target_dir}/${firstFile}`)
  const reduction = ((1 - targetStats.size / sourceStats.size) * 100).toFixed(
    1,
  )
  console.log(`\nExample size reduction: ~${reduction}% smaller`)
}

if (import.meta.main) {
  main()
}
