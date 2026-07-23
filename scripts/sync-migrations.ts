#!/usr/bin/env bun
/**
 * Sincroniza drizzle.__drizzle_migrations con el estado actual de los archivos.
 *
 * Útil cuando las tablas ya existen (creadas con db:push) pero drizzle-kit migrate
 * falla porque no hay registros de tracking o los hashes/IDs no coinciden.
 *
 * Uso:
 *   DATABASE_URL=<url> bun run scripts/sync-migrations.ts [--reset-ids]
 *
 * Opciones:
 *   --reset-ids  Borra todos los registros existentes y los recrea desde cero
 *                (útil cuando la tabla tiene IDs auto-increment como 25, 26, etc.)
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const args = process.argv.slice(2);
const resetIds = args.includes("--reset-ids");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: debe setear DATABASE_URL");
    console.error("  DATABASE_URL=<url> bun run scripts/sync-migrations.ts");
    process.exit(1);
  }

  // 1. Leer journal
  const journalPath = join(projectRoot, "drizzle", "meta", "_journal.json");
  if (!existsSync(journalPath)) {
    console.error("ERROR: no se encuentra", journalPath);
    process.exit(1);
  }
  const raw = readFileSync(journalPath, "utf-8").replace(/,(\s*[\]}])/g, "$1"); // limpia trailing commas
  const journal = JSON.parse(raw);
  const entries = journal.entries;

  if (!entries?.length) {
    console.log("No hay migraciones en el journal.");
    process.exit(0);
  }

  console.log(`Migraciones en journal: ${entries.length}`);

  // 2. Calcular hashes de cada archivo
  const migrations = [];
  for (const entry of entries) {
    const filePath = join(projectRoot, "drizzle", `${entry.tag}.sql`);
    if (!existsSync(filePath)) {
      console.error(`ERROR: no se encuentra ${filePath}`);
      process.exit(1);
    }
    const content = readFileSync(filePath, "utf-8");
    const hash = createHash("md5").update(content).digest("hex");
    migrations.push({ id: entry.idx, tag: entry.tag, hash });
    console.log(`  ${entry.idx}: ${entry.tag} -> ${hash}`);
  }

  // 3. Conectar a la DB
  const pool = new pg.Pool({ connectionString: url });

  try {
    // 4. Asegurar schema y tabla de tracking
    await pool.query("CREATE SCHEMA IF NOT EXISTS drizzle");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id INTEGER PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      )
    `);
    console.log("\n✓ Schema/tabla asegurados");

    // 5. Si --reset-ids, borrar todo y re-crear desde cero
    if (resetIds) {
      console.log("  --reset-ids: borrando registros existentes...");
      await pool.query("DELETE FROM drizzle.__drizzle_migrations");
    }

    // 6. Leer registros existentes
    const existing = await pool.query(
      "SELECT id, hash FROM drizzle.__drizzle_migrations ORDER BY id"
    );
    const existingMap = new Map(existing.rows.map((r) => [r.id, r.hash]));
    console.log(`Registros en DB: ${existing.rows.length}`);

    // 7. Sincronizar
    let inserted = 0;
    let updated = 0;
    let verified = 0;

    for (const m of migrations) {
      const existingHash = existingMap.get(m.id);

      if (!existingHash) {
        await pool.query(
          "INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES ($1, $2, $3)",
          [m.id, m.hash, Date.now()]
        );
        console.log(`  + id=${m.id} (${m.tag}) insertado`);
        inserted++;
      } else if (existingHash === m.hash) {
        verified++;
      } else {
        console.warn(
          `  ~ id=${m.id} (${m.tag}): hash actualizado (${existingHash.substring(0,12)}... → ${m.hash.substring(0,12)}...)`
        );
        await pool.query(
          "UPDATE drizzle.__drizzle_migrations SET hash = $1 WHERE id = $2",
          [m.hash, m.id]
        );
        updated++;
      }
    }

    // 8. Mostrar warnings para IDs extraños
    const extraIds = existing.rows
      .filter((r) => !migrations.some((m) => m.id === r.id))
      .map((r) => r.id);
    if (extraIds.length > 0) {
      console.warn(`\n⚠  IDs en DB que no están en el journal: ${extraIds.join(", ")}`);
      console.warn("   (probablemente de ejecuciones previas con db:push o migraciones viejas)");
      if (!resetIds) {
        console.warn("   Para limpiarlos, corré con --reset-ids");
      }
    }

    // 9. Verificar columna include_notebook
    const missingCols = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='ai_summary_subscription'
        AND column_name = 'include_notebook'
    `);
    if (missingCols.rows.length === 0) {
      console.log("\n⚠  Agregando columna 'include_notebook' a ai_summary_subscription...");
      await pool.query(`
        ALTER TABLE "ai_summary_subscription"
        ADD COLUMN "include_notebook" boolean DEFAULT true NOT NULL
      `);
      console.log("   ✓ Columna agregada");
    }

    console.log("\n--- RESULTADO ---");
    console.log(`  Insertados:  ${inserted}`);
    console.log(`  Actualizados: ${updated}`);
    console.log(`  Coinciden:   ${verified}`);
    if (resetIds) console.log("  (reset-ids: se borraron y recrearon todos)");
    console.log("------------------\n");

    if (inserted > 0 || updated > 0) {
      console.log("✅ Probá ahora: DATABASE_URL=<url> bun run db:migrate");
    } else {
      console.log("✅ Todo en orden.");
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
