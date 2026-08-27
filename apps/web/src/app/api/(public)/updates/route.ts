import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import {
  createContentUpdate,
  getContentUpdates,
  removeFailedContentUpdate,
  setContentUpdateImages,
} from "~/lib/models/content-updates";
import { RATING_TARGET_TYPES } from "~/lib/ratings/types";
import { ContentUpdateCursor } from "~/lib/updates/types";
import { envName } from "~/lib/config/env";
import {
  CONTENT_UPDATE_MAX_PAGE_SIZE,
  CONTENT_UPDATE_MAX_IMAGES,
  CONTENT_UPDATE_PAGE_SIZE,
  isContentUpdateImage,
} from "~/lib/updates/constants";
import { deleteImages, processImages } from "~/lib/utils/images";

export const dynamic = "force-dynamic";

const targetSchema = z.object({
  targetId: z.string().uuid(),
  type: z.enum(RATING_TARGET_TYPES),
});

const createUpdateSchema = targetSchema.extend({
  body: z.string().trim().min(1).max(1500),
  images: z.array(z.instanceof(File).refine(isContentUpdateImage)).max(CONTENT_UPDATE_MAX_IMAGES).optional(),
  isHighlighted: z.boolean().default(false),
});

const parseCursor = (value: string | null): ContentUpdateCursor | null => {
  if (!value) return null;
  const [pinned, createdAt, id] = value.split("|");
  if (
    (pinned !== "0" && pinned !== "1") ||
    !createdAt ||
    !id ||
    value.split("|").length !== 3 ||
    !z.string().datetime({ offset: true }).safeParse(createdAt).success ||
    !z.string().uuid().safeParse(id).success
  ) {
    throw new BadRequestError("A valid updates cursor is required");
  }
  return { createdAt, id, isPinned: pinned === "1" };
};

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    await rateLimiters.general.check();
    const { searchParams } = new URL(req.url);
    const target = targetSchema.safeParse({
      targetId: searchParams.get("targetId"),
      type: searchParams.get("type"),
    });
    if (!target.success) throw new BadRequestError("A valid updates target is required");

    const requestedLimit = Number(searchParams.get("limit") ?? CONTENT_UPDATE_PAGE_SIZE);
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, CONTENT_UPDATE_MAX_PAGE_SIZE)
        : CONTENT_UPDATE_PAGE_SIZE;

    return Response.json(
      await getContentUpdates(target.data.type, target.data.targetId, parseCursor(searchParams.get("cursor")), limit),
    );
  });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const { body, images, isHighlighted, targetId, type } = await validateRequest(req, createUpdateSchema);

    const id = await createContentUpdate(type, targetId, session.user.id, body, isHighlighted);
    if (images?.length) {
      let uploadedImages: string[] = [];
      try {
        uploadedImages = await processImages(images, [envName, "feed", id, "images"].join("/"));
        await setContentUpdateImages(id, session.user.id, uploadedImages);
      } catch (error) {
        const storedImages = await removeFailedContentUpdate(id, session.user.id).catch((cleanupError) => {
          console.error("Failed to remove an incomplete update after a failed publish", cleanupError);
          return [];
        });
        await deleteImages(storedImages.length ? storedImages : uploadedImages).catch((cleanupError) => {
          console.error("Failed to clean up update images after a failed publish", cleanupError);
        });
        throw error;
      }
    }

    return Response.json({ id }, { status: 201 });
  });
