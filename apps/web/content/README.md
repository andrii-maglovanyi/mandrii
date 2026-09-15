# Publishing content

Posts are deliberately file-based: a small project can publish reliably through a pull request without a CMS, roles, or a second database.

## Add a post

1. Create `content/posts/en/<slug>.mdx`.
2. Add the required front matter:

   ```md
   ---
   title: "Clear, specific title"
   categorySlug: "life-and-reflections"
   date: "2026-09-08T12:00:00Z"
   description: "A useful one-sentence summary for cards and search previews."
   images:
     - cover.webp
   ---
   ```

3. Add `content/posts/uk/<slug>.mdx` when a Ukrainian version is ready. Do not add an empty translation.
4. If using `images`, upload them with the existing post media convention so the filename resolves as `posts/<slug>/<filename>` in blob storage.
5. Preview the article, its social preview, and the post listing; then run `pnpm run build` from `apps/web` before merging.

Published posts are automatically included in the sitemap. Keep titles, descriptions, dates, and categories accurate: they are the small editorial inputs that make the content discoverable.
