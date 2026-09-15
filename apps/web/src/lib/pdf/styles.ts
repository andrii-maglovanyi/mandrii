import fs from "node:fs/promises";
import path from "node:path";

import { isDevelopment } from "~/lib/config/env";

let cachedStyles: Promise<string> | undefined;

/** Build assets are immutable in production; failed reads must remain retryable. */
export function loadPdfStyles(): Promise<string> {
  if (isDevelopment) return readStyles();
  cachedStyles ??= readStyles().catch((error) => {
    cachedStyles = undefined;
    throw error;
  });
  return cachedStyles;
}

async function readStyles() {
  // Next's webpack and Turbopack builds emit CSS into different directories.
  // The PDF route explicitly includes these immutable assets in next.config.mjs.
  const directories = [path.join(/* turbopackIgnore: true */ process.cwd(), ".next/static/css"), path.join(/* turbopackIgnore: true */ process.cwd(), ".next/static/chunks")];
  const chunks = await Promise.all(
    directories.map(async (directory) => {
      let files: string[];
      try {
        files = await fs.readdir(/* turbopackIgnore: true */ directory);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw error;
      }
      return Promise.all(
        files
          .filter((file) => file.endsWith(".css"))
          .sort()
          .map((file) => fs.readFile(/* turbopackIgnore: true */ path.join(directory, file), "utf8")),
      );
    }),
  );
  const styles = chunks.flat();
  if (!styles.length) throw new Error("No compiled PDF styles found");
  return styles.join("\n");
}
