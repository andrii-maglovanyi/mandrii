import fs from "fs";
import matter from "gray-matter";
import path from "path";

import { Locale } from "~/types";

export interface ContentData {
  content: string;
  id: string;
  meta: Record<string, number | string>;
}

export interface ContentManagerConfig {
  baseDirectory?: string;
  defaultLocale?: Locale;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  supportedLocales?: Locale[];
}

export type ContentType = string; // 'posts', 'cv', etc

const DEFAULT_CONFIG: Required<ContentManagerConfig> = {
  baseDirectory: "content",
  defaultLocale: Locale.EN,
  sortBy: "date",
  sortOrder: "desc",
  supportedLocales: [Locale.EN, Locale.UK],
};

class MarkdownContentManager {
  private baseDirectory: string;
  private config: Required<ContentManagerConfig>;

  constructor(config: ContentManagerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baseDirectory = path.join(process.cwd(), this.config.baseDirectory);
  }

  /**
   * Check if content exists
   */
  public contentExists(contentType: ContentType, id: string, lang: Locale = this.config.defaultLocale): boolean {
    try {
      const validLang = this.validateLocale(lang);
      const contentDirectory = this.getContentDirectory(contentType, validLang);

      const possibleFiles = [`${id}.md`, `${id}.mdx`];

      return possibleFiles.some((filename) => {
        const fullPath = path.join(contentDirectory, filename);
        return fs.existsSync(fullPath);
      });
    } catch {
      return false;
    }
  }

  /**
   * Get all content IDs across all types and Locales
   */
  public getAllContentIds(): Array<{
    params: {
      contentType: string;
      id: string;
      lang?: string;
    };
  }> {
    try {
      const allIds: Array<{
        params: { contentType: string; id: string; lang?: string };
      }> = [];
      const contentTypes = this.getAvailableContentTypes();

      for (const contentType of contentTypes) {
        const typeIds = this.getContentIds(contentType);

        for (const { params } of typeIds) {
          allIds.push({
            params: {
              contentType,
              ...params,
            },
          });
        }
      }

      return allIds;
    } catch (error) {
      console.error("Error getting all content IDs:", error);
      return [];
    }
  }

  /**
   * Get all available content types
   */
  public getAvailableContentTypes(): ContentType[] {
    try {
      if (!fs.existsSync(this.baseDirectory)) {
        return [];
      }

      return fs
        .readdirSync(this.baseDirectory, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
    } catch (error) {
      console.error("Error getting available content types:", error);
      return [];
    }
  }

  /**
   * Get available Locales for specific content
   */
  public getAvailableLocales(contentType: ContentType, id: string): Locale[] {
    const availableLocales: Locale[] = [];

    for (const lang of this.config.supportedLocales) {
      if (this.contentExists(contentType, id, lang)) {
        availableLocales.push(lang);
      }
    }

    return availableLocales;
  }

  /**
   * Get all content items for a specific type and Locale
   */
  public async getContent(
    contentType: ContentType,
    lang: Locale = this.config.defaultLocale,
  ): Promise<Array<ContentData>> {
    try {
      const contentDirectory = this.getContentDirectory(contentType, lang);

      if (!fs.existsSync(contentDirectory)) {
        console.warn(`Content directory not found: ${contentDirectory}`);
        return [];
      }

      const fileNames = fs.readdirSync(contentDirectory).filter((filename) => this.isMarkdownFile(filename));

      if (fileNames.length === 0) {
        console.warn(`No markdown files found in: ${contentDirectory}`);
        return [];
      }

      const allContent: Array<ContentData> = [];

      for (const filename of fileNames) {
        try {
          const id = filename.replace(/\.(md|mdx)$/i, "");
          const fullPath = path.join(contentDirectory, filename);
          const fileContents = fs.readFileSync(fullPath, "utf8");
          const matterResult = matter(fileContents);

          allContent.push({
            content: matterResult.content,
            id,
            meta: matterResult.data,
          });
        } catch (error) {
          console.error(`Error processing file ${filename}:`, error);
          continue;
        }
      }

      return this.sortContent(allContent);
    } catch (error) {
      console.error(`Error getting content for type "${contentType}" (${lang}):`, error);
      return [];
    }
  }

  /**
   * Get specific content item by ID and type
   */
  public async getContentById(
    contentType: ContentType,
    id: string,
    lang: Locale = this.config.defaultLocale,
  ): Promise<ContentData | null> {
    try {
      const validLang = this.validateLocale(lang);
      const contentDirectory = this.getContentDirectory(contentType, validLang);

      // Try both .md and .mdx extensions
      const possibleFiles = [`${id}.md`, `${id}.mdx`];
      let fullPath: null | string = null;

      for (const filename of possibleFiles) {
        const testPath = path.join(contentDirectory, filename);
        console.log(`Checking for content file: ${testPath}`);
        if (fs.existsSync(testPath)) {
          fullPath = testPath;
          break;
        }
      }

      if (!fullPath) {
        console.warn(`Content not found: ${contentType}/${id} (${lang})`);
        return null;
      }

      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      return {
        content: matterResult.content,
        id,
        meta: matterResult.data,
      };
    } catch (error) {
      console.error(`Error getting content "${contentType}/${id}" (${lang}):`, error);
      return null;
    }
  }

  /**
   * Get all content IDs for a specific type across all Locales
   */
  public getContentIds(contentType: ContentType): Array<{ params: { id: string; lang?: string } }> {
    try {
      const allIds: Array<{ params: { id: string; lang?: string } }> = [];

      for (const lang of this.config.supportedLocales) {
        const contentDirectory = this.getContentDirectory(contentType, lang);

        if (!fs.existsSync(contentDirectory)) {
          continue;
        }

        const fileNames = fs.readdirSync(contentDirectory).filter((filename) => this.isMarkdownFile(filename));

        for (const fileName of fileNames) {
          const id = fileName.replace(/\.(md|mdx)$/i, "");
          allIds.push({
            params: {
              id,
              lang: lang !== this.config.defaultLocale ? lang : undefined,
            },
          });
        }
      }

      return allIds;
    } catch (error) {
      console.error(`Error getting content IDs for type "${contentType}":`, error);
      return [];
    }
  }

  /**
   * Get statistics about content across all types and Locales
   */
  public async getContentStats(): Promise<
    Record<
      ContentType,
      {
        byLocale: Record<Locale, number>;
        total: number;
      }
    >
  > {
    const stats: Record<ContentType, { byLocale: Record<Locale, number>; total: number }> = {};
    const contentTypes = this.getAvailableContentTypes();

    for (const contentType of contentTypes) {
      stats[contentType] = {
        byLocale: {} as Record<Locale, number>,
        total: 0,
      };

      for (const lang of this.config.supportedLocales) {
        const content = await this.getContent(contentType, lang);
        const count = content.length;

        stats[contentType].byLocale[lang] = count;
        stats[contentType].total += count;
      }
    }

    return stats;
  }

  private getContentDirectory(contentType: ContentType, lang: Locale) {
    const validLang = this.validateLocale(lang);
    return path.join(this.baseDirectory, contentType, validLang);
  }

  private isMarkdownFile(filename: string) {
    return /\.(md|mdx)$/i.test(filename);
  }

  private sortContent(content: Array<ContentData>) {
    return content.sort((a, b) => {
      const aValue = a.meta[this.config.sortBy];
      const bValue = b.meta[this.config.sortBy];

      if (this.config.sortBy === "date" || this.config.sortBy.toLowerCase().includes("date")) {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);

        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          const result = dateA.getTime() - dateB.getTime();
          return this.config.sortOrder === "desc" ? -result : result;
        }
      }

      if (aValue < bValue) {
        return this.config.sortOrder === "desc" ? 1 : -1;
      } else if (aValue > bValue) {
        return this.config.sortOrder === "desc" ? -1 : 1;
      }
      return 0;
    });
  }

  private validateLocale(lang: Locale) {
    return this.config.supportedLocales.includes(lang) ? lang : this.config.defaultLocale;
  }
}

export const contentManager = new MarkdownContentManager();
