import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  platform: "node",
  outfile: "dist/index.cjs",
  minify: true,
  sourcemap: true,
  format: "cjs",
});
