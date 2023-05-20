import { assert } from "std/_util/asserts.ts";
import { Migrator, Migration } from "kysely";
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

function startMigrating() {
  switch (Deno.args[0]) {
    case "--up":
      return migrator.migrateToLatest();
    case "--down":
      return migrator.migrateDown();
    case "--to":
      assert(Deno.args[1], "Must specify target");
      return migrator.migrateTo(Deno.args[1]);
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
