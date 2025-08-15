import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import { useMDXComponents } from "./mdx-components";

export async function compileMDX(mdxContent: string) {
  try {
    const file = await compile(mdxContent, {
      outputFormat: "function-body",
      providerImportSource: "./mxd-components",
    });

    return await run(file, {
      ...runtime,
      useMDXComponents,
    });
  } catch (error) {
    console.error("MDX compilation error:", error);
    throw new Error("Failed to compile MDX content");
  }
}
