import * as esbuild from "esbuild";

/**
 * marking knex dynamic imports, otherwise build fails
 */
const knexDeps = ["pg-query-stream", "mysql", "oracledb", "better-sqlite3", "mysql2", "sqlite3", "tedious"];

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  platform: "node",
  outfile: "dist/index.cjs",
  minify: true,
  sourcemap: true,
  format: "cjs",
  external: knexDeps,
});
