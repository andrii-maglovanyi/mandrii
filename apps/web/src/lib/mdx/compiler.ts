import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import { useMDXComponents } from "./mdx-components";

interface MDXVariables {
  [key: string]: string;
}

/**
 * Compiles MDX content with optional variable replacement
 * @param mdxContent - The MDX content string
 * @param variables - Optional object with key-value pairs to replace in the MDX (e.g., { VENUE_NAME: "My Venue" })
 * @returns Compiled MDX component
 */
export async function compileMDX(mdxContent: string, variables?: MDXVariables) {
  try {
    // Replace variables in the format {{ VARIABLE_NAME }}
    let processedContent = mdxContent;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        processedContent = processedContent.replace(regex, value);
      });
    }

    const file = await compile(processedContent, {
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
