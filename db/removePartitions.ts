import { sql } from 'kysely'
import db from './db.ts'
import { spinner } from '../util/spinner.ts'

/**
 * Finds all partition tables (tables that inherit from a partitioned parent table)
 * and drops them in dependency order (respecting foreign key constraints).
 */
async function removePartitions() {
  // Query to find all partition tables
  const partitions = await sql<{ table_name: string; parent_table: string }>`
    SELECT
      c.relname as table_name,
      p.relname as parent_table
    FROM
      pg_class c
    JOIN
      pg_inherits i ON i.inhrelid = c.oid
    JOIN
      pg_class p ON p.oid = i.inhparent
    JOIN
      pg_namespace n ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND p.relkind = 'p'  -- parent is a partitioned table
    ORDER BY
      p.relname, c.relname
  `.execute(db)

  if (partitions.rows.length === 0) {
    console.log('No partitions found to remove.')
    return
  }

  // Get all foreign key dependencies
  // Note: Partitions inherit constraints from parent tables, so we check both
  // partition names and their parent table names
  const partition_names = new Set(partitions.rows.map((p) => p.table_name))
  const parent_tables = new Set(partitions.rows.map((p) => p.parent_table))
  const all_related_tables = new Set([...partition_names, ...parent_tables])

  // Get ALL foreign key constraints in the public schema
  const all_fks = await sql<{ from_table: string; to_table: string }>`
    SELECT DISTINCT
      source.relname as from_table,
      target.relname as to_table
    FROM
      pg_constraint con
    JOIN
      pg_class source ON con.conrelid = source.oid
    JOIN
      pg_class target ON con.confrelid = target.oid
    JOIN
      pg_namespace n ON n.oid = source.relnamespace
    WHERE
      con.contype = 'f'  -- foreign key constraints
      AND n.nspname = 'public'
  `.execute(db)

  // Filter to only FKs involving tables we're dropping (either partition or parent)
  const dependencies = all_fks.rows.filter(
    ({ from_table, to_table }) =>
      all_related_tables.has(from_table) || all_related_tables.has(to_table)
  )

  // Build a map from parent table to its partitions
  const parent_to_partitions = new Map<string, string[]>()
  for (const { table_name, parent_table } of partitions.rows) {
    if (!parent_to_partitions.has(parent_table)) {
      parent_to_partitions.set(parent_table, [])
    }
    parent_to_partitions.get(parent_table)!.push(table_name)
  }

  // Build dependency graph for partition tables
  // Foreign keys can be: partition→partition, partition→parent, parent→partition, parent→parent
  // We need to expand parent references to all their partitions
  const dependency_graph = new Map<string, Set<string>>()

  for (const { from_table, to_table } of dependencies) {
    // Determine which partitions are involved
    const from_partitions = partition_names.has(from_table)
      ? [from_table]
      : (parent_to_partitions.get(from_table) || [])

    const to_partitions = partition_names.has(to_table)
      ? [to_table]
      : (parent_to_partitions.get(to_table) || [])

    // Add edges for all partition combinations
    for (const from_partition of from_partitions) {
      if (!dependency_graph.has(from_partition)) {
        dependency_graph.set(from_partition, new Set())
      }
      for (const to_partition of to_partitions) {
        dependency_graph.get(from_partition)!.add(to_partition)
      }
    }
  }


  // Topological sort with cycle detection that groups cyclic components
  function topological_sort_with_cycles(tables: string[]): string[] {
    const visited = new Set<string>()
    const temp_mark = new Set<string>()
    const result: string[] = []
    const in_cycle = new Set<string>()

    function visit(table: string, path: Set<string> = new Set()): boolean {
      if (visited.has(table)) {
        return false
      }

      if (temp_mark.has(table)) {
        // Cycle detected - mark all tables in the path as being in a cycle
        let found_start = false
        for (const t of path) {
          if (t === table) found_start = true
          if (found_start) in_cycle.add(t)
        }
        in_cycle.add(table)
        return true
      }

      temp_mark.add(table)
      path.add(table)

      const deps = dependency_graph.get(table)
      if (deps) {
        for (const dep of deps) {
          visit(dep, new Set(path))
        }
      }

      path.delete(table)
      temp_mark.delete(table)
      visited.add(table)
      result.push(table)
      return false
    }

    for (const table of tables) {
      if (!visited.has(table)) {
        visit(table)
      }
    }

    return result
  }

  // Get all partition table names and sort them by dependencies
  const all_partitions = partitions.rows.map((p) => p.table_name)

  // Sort partitions, handling cycles
  const sorted_partitions = topological_sort_with_cycles(all_partitions).reverse()

  console.log('Sorted partitions:', sorted_partitions.slice(0, 20), '...')

  // Group by parent for logging
  const by_parent = new Map<string, number>()
  for (const { parent_table } of partitions.rows) {
    by_parent.set(parent_table, (by_parent.get(parent_table) || 0) + 1)
  }

  console.log(
    `Found ${partitions.rows.length} partition(s) across ${by_parent.size} table(s)`
  )

  // Drop partitions with CASCADE to handle circular dependencies
  // This is safe because we're dropping ALL partitions anyway
  for (const table_name of sorted_partitions) {
    await sql.raw(`DROP TABLE IF EXISTS ${table_name} CASCADE;`).execute(db)
  }
  console.log(`✓ Dropped ${sorted_partitions.length} partition(s)`)

  console.log('✓ All partitions removed successfully')
}

if (import.meta.main) {
  await spinner('Removing partitions from partitioned tables', removePartitions)
}

export { removePartitions }
