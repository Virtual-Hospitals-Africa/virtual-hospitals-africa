import parse from "s-expression";
import { walk } from "jsr:@std/fs@1/walk";
import { basename } from "jsr:@std/path@1/basename";
import { fastNormalize } from '../shared/s_expression.ts'

/**
 * Strip Lisp-style comments (lines starting with ;;) from the input text
 */
function stripComments(text: string): string {
  return text
    .split("\n")
    .filter((line) => !line.trim().startsWith(";;"))
    .join("\n");
}

/**
 * Normalize an s-expression by removing extra whitespace
 * Converts the parsed s-expression back to a string with single spaces
 */
function normalize(expr: unknown): string {
  if (typeof expr === "string") {
    // If it contains spaces or special chars, wrap in quotes
    if (/[\s()]/.test(expr)) {
      return `"${expr}"`;
    }
    return expr;
  }

  if (Array.isArray(expr)) {
    const normalized = expr.map(normalize).join(" ");
    return `(${normalized})`;
  }

  return String(expr);
}

/**
 * Extract top-level s-expressions from text
 * Returns an array of s-expression strings
 */
function extractSExpressions(text: string): string[] {
  const withoutComments = stripComments(text);
  const expressions: string[] = [];

  let depth = 0;
  let currentExpr = "";
  let inString = false;

  for (let i = 0; i < withoutComments.length; i++) {
    const char = withoutComments[i];

    // Handle string literals
    if (char === '"' && (i === 0 || withoutComments[i - 1] !== "\\")) {
      inString = !inString;
      currentExpr += char;
      continue;
    }

    if (inString) {
      currentExpr += char;
      continue;
    }

    // Track parentheses depth
    if (char === "(") {
      if (depth === 0) {
        currentExpr = "";
      }
      depth++;
      currentExpr += char;
    } else if (char === ")") {
      currentExpr += char;
      depth--;

      if (depth === 0 && currentExpr.trim()) {
        // We've completed a top-level s-expression
        const parsed = parse(currentExpr.trim());
        if (parsed instanceof Error) {
          throw parsed
        }
        if (!Array.isArray(parsed)) {
          throw parsed
        }
        const normalized = fastNormalize(parsed);
        expressions.push(normalized);
        currentExpr = "";
      }
    } else if (depth > 0) {
      currentExpr += char;
    }
  }

  return expressions;
}

/**
 * Convert a filename to a valid TypeScript constant name
 * e.g., "tasks.lisp" -> "TASKS"
 */
function filenameToConstName(filename: string): string {
  return basename(filename, ".lisp").toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

/**
 * Process a single .lisp file and generate corresponding .ts file
 */
async function processLispFile(lispPath: string) {
  console.log(`Processing ${lispPath}...`);

  const content = await Deno.readTextFile(lispPath);
  const expressions = extractSExpressions(content);

  const constName = filenameToConstName(lispPath);
  const tsPath = lispPath.replace(/\.lisp$/, ".ts");

  // Generate TypeScript file content
  const tsContent = `// Auto-generated from ${basename(lispPath)}
// Do not edit manually

export const ${constName} = [
${expressions.map((expr) => `  \`${expr}\`,`).join("\n")}
];
`;

  await Deno.writeTextFile(tsPath, tsContent);
  console.log(`  ✓ Generated ${tsPath} with ${expressions.length} expression(s)`);
}

/**
 * Main function - process all .lisp files in s_expression directory
 */
async function main() {
  const sExpressionDir = "s_expression";

  // Check if directory exists
  try {
    await Deno.stat(sExpressionDir);
  } catch {
    console.error(`Directory ${sExpressionDir} not found`);
    Deno.exit(1);
  }

  // Find all .lisp files
  const lispFiles: string[] = [];
  for await (const entry of walk(sExpressionDir, { exts: [".lisp"] })) {
    if (entry.isFile) {
      lispFiles.push(entry.path);
    }
  }

  if (lispFiles.length === 0) {
    console.log("No .lisp files found");
    return;
  }

  console.log(`Found ${lispFiles.length} .lisp file(s)\n`);

  // Process each file
  for (const lispFile of lispFiles) {
    await processLispFile(lispFile);
  }

  console.log("\n✓ All files processed successfully");
}

if (import.meta.main) {
  main();
}
