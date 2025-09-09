import fs from "fs";
import matter from "gray-matter";
import path from "path";

import { Locale } from "~/types";

import { constants } from "../constants";

export interface ContentData {
  content: string;
  id: string;
  meta: {
    category?: (typeof constants.posts.enabledCategories)[number]["name"];
    date: string;
    description?: string;
    images?: string[];
    title: string;
  };
}

export interface ContentManagerConfig {
  baseDirectory?: string;
  defaultLocale?: Locale;
  sortBy?: keyof ContentData["meta"];
  sortOrder?: "asc" | "desc";
  supportedLocales?: Locale[];
}

export type ContentType = string; // 'posts', 'cv', etc

interface ContentFilters {
  category?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    hasNext: boolean;
    hasPrev: boolean;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const DEFAULT_CONFIG: Required<ContentManagerConfig> = {
  baseDirectory: "content",
  defaultLocale: Locale.EN,
  sortBy: "date" as keyof ContentData["meta"],
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

  public async getContent(
    contentType: ContentType,
    lang: Locale = this.config.defaultLocale,
    filters?: ContentFilters,
  ) {
    const result = await this.getContentPaginated(contentType, lang, filters);
    return result.data;
  }

  /**
   * Get specific content item by ID and type
   */
  public async getContentById(
    contentType: ContentType,
    id: string,
    locale: Locale = this.config.defaultLocale,
  ): Promise<ContentData | null> {
    try {
      const scanDirectory = (locale: Locale) => {
        let fullPath: null | string = null;

        const contentDirectory = this.getContentDirectory(contentType, locale);
        const possibleFiles = [`${id}.md`, `${id}.mdx`];

        for (const filename of possibleFiles) {
          const testPath = path.join(contentDirectory, filename);
          console.log(`Checking for content file: ${testPath}`);
          if (fs.existsSync(testPath)) {
            fullPath = testPath;
            break;
          }
        }

        return fullPath;
      };

      const validLocale = this.validateLocale(locale);
      let fullPath = scanDirectory(validLocale);

      if (!fullPath) {
        console.warn(`Content ${contentType}/${id} not found for ${locale} locale. Falling back to default locale.`);
        fullPath = scanDirectory(Locale.EN);

        if (!fullPath) {
          console.warn(`
          Content ${contentType}/${id} not found in default locale either.`);
          return null;
        }
      }

      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      return {
        content: matterResult.content,
        id,
        meta: matterResult.data as ContentData["meta"],
      };
    } catch (error) {
      console.error(`Error getting content "${contentType}/${id}" (${locale}):`, error);
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

  public async getContentPaginated(
    contentType: ContentType,
    lang: Locale = this.config.defaultLocale,
    filters?: ContentFilters,
  ) {
    try {
      const contentDirectory = this.getContentDirectory(contentType, lang);

      if (!fs.existsSync(contentDirectory)) {
        console.warn(`Content directory not found: ${contentDirectory}`);
        return this.createEmptyPaginatedResult(filters);
      }

      const fileNames = fs.readdirSync(contentDirectory).filter((filename) => this.isMarkdownFile(filename));

      if (fileNames.length === 0) {
        console.warn(`No markdown files found in: ${contentDirectory}`);
        return this.createEmptyPaginatedResult(filters);
      }

      const allContent: Array<ContentData> = [];

      for (const filename of fileNames) {
        try {
          const id = filename.replace(/\.(md|mdx)$/i, "");
          const fullPath = path.join(contentDirectory, filename);
          const fileContents = fs.readFileSync(fullPath, "utf8");
          const matterResult = matter(fileContents);

          const contentData: ContentData = {
            content: matterResult.content,
            id,
            meta: matterResult.data as ContentData["meta"],
          };

          if (filters && !this.passesFilters(contentData, filters)) {
            continue;
          }

          allContent.push(contentData);
        } catch (error) {
          console.error(`Error processing file ${filename}:`, error);
          continue;
        }
      }

      const sortedContent = this.sortContent(allContent);

      if (filters?.limit && filters.limit > 0) {
        return this.paginateResults(sortedContent.slice(0, filters.limit), filters);
      }

      return this.paginateResults(sortedContent, filters);
    } catch (error) {
      console.error(`Error getting content for type "${contentType}" (${lang}):`, error);
      return this.createEmptyPaginatedResult(filters);
    }
  }

  private createEmptyPaginatedResult(filters?: ContentFilters): PaginatedResult<ContentData> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || filters?.limit || 10;

    return {
      data: [],
      pagination: {
        hasNext: false,
        hasPrev: false,
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    };
  }

  private getContentDirectory(contentType: ContentType, locale: Locale) {
    const validLocale = this.validateLocale(locale);

    return path.join(this.baseDirectory, contentType, validLocale);
  }

  private isMarkdownFile(filename: string) {
    return /\.(md|mdx)$/i.test(filename);
  }

  private paginateResults(sortedContent: ContentData[], filters?: ContentFilters): PaginatedResult<ContentData> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || filters?.limit || 10;
    const total = sortedContent.length;
    const totalPages = Math.ceil(total / pageSize);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = sortedContent.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        hasNext: page < totalPages,
        hasPrev: page > 1,
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  private passesFilters(contentData: ContentData, filters: ContentFilters): boolean {
    if (filters.category) {
      const contentCategory = contentData.meta.category;
      if (!contentCategory || contentCategory !== filters.category) {
        return false;
      }
    }

    return true;
  }

  private sortContent(content: Array<ContentData>) {
    return content.sort((a, b) => {
      const aValue = a.meta[this.config.sortBy];
      const bValue = b.meta[this.config.sortBy];

      if (aValue === undefined || bValue === undefined) {
        return 0;
      }

      if (this.config.sortBy === "date" || this.config.sortBy.toLowerCase().includes("date")) {
        const dateA = new Date(aValue as string);
        const dateB = new Date(bValue as string);

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
