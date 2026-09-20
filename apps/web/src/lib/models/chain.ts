import slugify from "slugify";

import type { ChainDetails, ChainSummary, ChainVenue } from "~/lib/chains/types";
import type { ChainInput } from "~/lib/validation/chain";

import { ConflictError, NotFoundError, ValidationError } from "~/lib/api/errors";
import sql from "~/lib/db/db";
import { invalidatePublicContent } from "~/lib/public-cache/invalidate";

export async function getChainDetails(chainId: string) {
  const [result] = await sql<Array<{ venues: ChainVenue[] } & ChainDetails>>`
    SELECT chain.id, chain.name, chain.slug, chain.country, chain.city, chain.chain_id,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', venue.id, 'name', venue.name, 'slug', venue.slug, 'category', venue.category,
          'city', venue.city, 'country', venue.country, 'chain_id', venue.chain_id
        ) ORDER BY LOWER(venue.name), venue.id)
        FROM venues venue WHERE venue.chain_id = chain.id
      ), '[]'::jsonb) AS venues
    FROM chains chain WHERE chain.id = ${chainId}
  `;
  if (!result) throw new NotFoundError("The chain no longer exists");
  const { venues, ...chain } = result;
  return { chain, venues };
}

export async function listChains() {
  return sql<ChainSummary[]>`
    WITH venue_counts AS (
      SELECT chain_id, COUNT(*)::int AS venue_count,
        CASE WHEN COUNT(DISTINCT category) = 1 THEN MIN(category) END AS display_category
      FROM venues WHERE chain_id IS NOT NULL GROUP BY chain_id
    ), child_counts AS (
      SELECT chain_id, COUNT(*)::int AS child_chain_count
      FROM chains WHERE chain_id IS NOT NULL GROUP BY chain_id
    )
    SELECT chain.id, chain.name, chain.slug, chain.country, chain.city, chain.chain_id,
      venue_counts.display_category,
      COALESCE(venue_counts.venue_count, 0) AS venue_count,
      COALESCE(child_counts.child_chain_count, 0) AS child_chain_count
    FROM chains chain
    LEFT JOIN venue_counts ON venue_counts.chain_id = chain.id
    LEFT JOIN child_counts ON child_counts.chain_id = chain.id
    ORDER BY LOWER(chain.name), chain.id
  `;
}

export async function saveChain(input: ChainInput, userId: string) {
  const slug = normaliseSlug(input.slug, input.name);
  const parentChainId = input.parentChainId ?? null;
  const venueIds = [...new Set(input.venueIds)];

  const result = await sql.begin(async (transaction) => {
    // Chain administration is rare. Serialising writes makes the unique-slug
    // and hierarchy checks deterministic when the same chain is edited in two tabs.
    await transaction`SELECT pg_advisory_xact_lock(hashtext('venue-chain-manager'))`;

    const [duplicateSlug] = await transaction<{ id: string }[]>`
        SELECT id FROM chains WHERE slug = ${slug} AND id IS DISTINCT FROM ${input.id ?? null}::uuid
      `;
    if (duplicateSlug) throw new ConflictError("This chain slug is already in use");

    if (parentChainId) {
      const [hierarchy] = await transaction<
        { child_depth: number; parent_depth: number; would_create_cycle: boolean }[]
      >`
          WITH RECURSIVE ancestors AS (
            SELECT id, chain_id, ARRAY[id] AS path
            FROM chains
            WHERE id = ${parentChainId}
            UNION ALL
            SELECT parent.id, parent.chain_id, ancestor.path || parent.id
            FROM chains parent
            JOIN ancestors ancestor ON parent.id = ancestor.chain_id
            WHERE NOT parent.id = ANY(ancestor.path)
          ), descendants AS (
            SELECT id, 0::int AS depth, ARRAY[id] AS path
            FROM chains
            WHERE id = ${input.id ?? null}::uuid
            UNION ALL
            SELECT child.id, descendant.depth + 1, descendant.path || child.id
            FROM chains child
            JOIN descendants descendant ON child.chain_id = descendant.id
            WHERE NOT child.id = ANY(descendant.path)
          )
          SELECT
            (SELECT COUNT(*)::int FROM ancestors) AS parent_depth,
            COALESCE((SELECT MAX(depth) FROM descendants), 0)::int AS child_depth,
            EXISTS(SELECT 1 FROM ancestors WHERE id = ${input.id ?? null}::uuid) AS would_create_cycle
        `;
      if (!hierarchy || hierarchy.parent_depth === 0)
        throw new NotFoundError("The selected parent chain no longer exists");
      if (hierarchy.would_create_cycle) {
        throw new ConflictError("A chain cannot be placed inside itself or one of its descendants");
      }
      if (hierarchy.parent_depth + 1 + hierarchy.child_depth > 2) {
        throw new ConflictError("A chain can have one local branch level beneath a brand");
      }
    }

    let savedChain: {
      chain_id: null | string;
      city: null | string;
      country: null | string;
      id: string;
      name: string;
      slug: string;
    };
    if (input.id) {
      const [updated] = await transaction<(typeof savedChain)[]>`
          UPDATE chains
          SET name = ${input.name},
              slug = ${slug},
              country = ${cleanOptionalText(input.country)},
              city = ${cleanOptionalText(input.city)},
              chain_id = ${parentChainId},
              updated_at = NOW()
          WHERE id = ${input.id}
          RETURNING id, name, slug, country, city, chain_id
        `;
      if (!updated) throw new NotFoundError("The chain no longer exists");
      savedChain = updated;
    } else {
      const [created] = await transaction<(typeof savedChain)[]>`
          INSERT INTO chains (name, slug, country, city, chain_id, user_id)
          VALUES (${input.name}, ${slug}, ${cleanOptionalText(input.country)}, ${cleanOptionalText(input.city)}, ${parentChainId}, ${userId})
          RETURNING id, name, slug, country, city, chain_id
        `;
      if (!created) throw new ConflictError("Unable to create this chain");
      savedChain = created;
    }

    const existingVenues = venueIds.length
      ? await transaction<{ id: string }[]>`
        SELECT id FROM venues WHERE id = ANY(${venueIds}::uuid[])
      `
      : [];
    if (existingVenues.length !== venueIds.length) {
      throw new NotFoundError("One or more selected venues no longer exist");
    }

    await transaction`
        UPDATE venues
        SET chain_id = NULL, updated_at = NOW()
        WHERE chain_id = ${savedChain.id}
          AND NOT (id = ANY(${venueIds}::uuid[]))
      `;
    if (venueIds.length > 0) {
      await transaction`
          UPDATE venues
          SET chain_id = ${savedChain.id}, updated_at = NOW()
          WHERE id = ANY(${venueIds}::uuid[]) AND chain_id IS DISTINCT FROM ${savedChain.id}
        `;
    }

    return savedChain;
  });
  invalidatePublicContent();
  return result;
}

function cleanOptionalText(value: null | string | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function normaliseSlug(value: string | undefined, name: string) {
  const slug = slugify(value || name, { lower: true, strict: true });
  if (!slug) throw new ValidationError("Enter a chain name or slug containing letters or numbers");
  return slug;
}
