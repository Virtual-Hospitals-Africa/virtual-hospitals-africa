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

import { runCommandAssertExitCodeZero } from '../util/command.ts'
import sortBy from '../util/sortBy.ts'

const DEFAULT_WIDTH = 150
const SOURCE_DIR = 'static/medical-resources/za/primary-care/adult/thumbnails'

async function main() {
  const target_width = parseInt(Deno.args[0] || String(DEFAULT_WIDTH))

  if (isNaN(target_width) || target_width <= 0) {
    throw new Error('Width must be a positive number')
  }

  const target_dir = `${SOURCE_DIR}/${target_width}`

  console.log(`Resizing thumbnails to ${target_width}px width...`)
  console.log(`Source: ${SOURCE_DIR}`)
  console.log(`Target: ${target_dir}\n`)

  // Check if ImageMagick is available
  const check = await new Deno.Command('convert', {
    args: ['-version'],
    stdout: 'null',
    stderr: 'null',
  }).output()

  if (!check.success) {
    throw new Error('ImageMagick not available')
  }

  // Create target directory
  await Deno.mkdir(target_dir, { recursive: true })

  // Get all PNG files
  const files_unsorted: string[] = []
  for await (const entry of Deno.readDir(SOURCE_DIR)) {
    if (entry.isFile && entry.name.endsWith('.png')) {
      files_unsorted.push(entry.name)
    }
  }

  if (files_unsorted.length === 0) {
    console.log('No PNG files found to resize')
    return
  }

  const files = sortBy(files_unsorted, (file) => parseInt(file.replace('.png', '')))

  console.log(`Found ${files.length} PNG files to resize\n`)

  let processed = 0

  for (const file of files) {
    const source_path = `${SOURCE_DIR}/${file}`
    const target_path = `${target_dir}/${file}`

    // Use ImageMagick to resize
    // -resize: resize to width, maintain aspect ratio
    // -strip: remove metadata to reduce file size
    // -quality: PNG quality setting
    await runCommandAssertExitCodeZero('convert', {
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

    processed++

    // Show progress every 10 files
    if (processed % 10 === 0) {
      console.log(`Processed ${processed}/${files.length} files...`)
    }
  }

  console.log(`\nComplete!`)
  console.log(`Successfully processed: ${processed}`)

  const first_file = files[0]
  const source_stats = await Deno.stat(`${SOURCE_DIR}/${first_file}`)
  const target_stats = await Deno.stat(`${target_dir}/${first_file}`)
  const reduction = ((1 - target_stats.size / source_stats.size) * 100).toFixed(
    1,
  )
  console.log(`\nExample size reduction: ~${reduction}% smaller`)
}

if (import.meta.main) {
  main()
}
