import { Alert } from "~/components/ui";
import { GET_PRODUCT_BY_SLUG } from "~/graphql/products";
import { getI18n } from "~/i18n/getI18n";
import { getServerClient } from "~/lib/apollo/server-client";
import { contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";
import { GetProductBySlugQuery, GetProductBySlugQueryVariables } from "~/types/graphql.generated";

import { ProductViewClient } from "./ProductViewClient";

interface ProductViewServerProps {
  locale: string;
  slug: string;
}

/**
 * Server component for product detail view.
 * Fetches product data on the server for SSR.
 */
export async function ProductViewServer({ locale, slug }: ProductViewServerProps) {
  try {
    const client = await getServerClient();

    const [{ data }, returnPolicyData] = await Promise.all([
      client.query<GetProductBySlugQuery, GetProductBySlugQueryVariables>({
        query: GET_PRODUCT_BY_SLUG,
        variables: { slug },
      }),
      contentManager.getContentById("about", "return-policy", locale as Locale),
    ]);

    const product = data?.products?.[0] ?? null;
    const returnPolicy = {
      content: returnPolicyData?.content ?? "",
      title: returnPolicyData?.meta?.title ?? "",
    };

    return <ProductViewClient initialProduct={product} returnPolicy={returnPolicy} slug={slug} />;
  } catch (error) {
    console.error("Error fetching product:", error);

    const i18n = await getI18n({ locale });

    return <Alert variant="warning">{i18n("Product is not available at the moment")}</Alert>;
  }
}
