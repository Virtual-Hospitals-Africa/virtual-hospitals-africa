import { Migrator, Migration, sql } from "kysely";
import db from "../external-clients/db.ts";

if (!Deno.args.length) {
  console.error("Please provide a migration name as in\ndeno task migrate:create name");
  Deno.exit(1);
}

const migrations: Record<string, Migration> = {};
for (const migrationFile of Deno.readDirSync("./migrate-db/migrations")) {
  const migrationName = migrationFile.name
  const migration = await import(`./migrations/${migrationName}`);
  migrations[migrationName] = migration;
}

const migrator = new Migrator({
  db,
  provider: {
    getMigrations: () => Promise.resolve(migrations),
  },
});

async function startMigrating() {
  switch (Deno.args[0]) {
    case "--latest":
      return migrator.migrateToLatest();
    case "--up":
      return migrator.migrateUp();
    case "--down":
      return migrator.migrateDown();
    case "--to": {
      const target = Deno.args[1];
      if (!target) {
        const migrations = await sql<{name: string}>`SELECT name from kysely_migration`.execute(db);
        const migrationTargets = migrations.rows.map(({ name }) => name);
        console.error(`Please specify a valid target as in\n\n  deno task migrate:to ${migrationTargets[0]}\n\nValid targets:\n${migrationTargets.join("\n")}`);
        Deno.exit(1);
      }
      return migrator.migrateTo(target);    }

    default:
      throw new Error("Invalid command");
  }
}

async function migrate() {
  const { error, results } = await startMigrating()

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  await db.destroy();

  if (error) {
    console.error("failed to migrate");
    throw error;
  }
}

migrate();
