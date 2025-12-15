import { Alert } from "~/components/ui";
import { GET_PUBLIC_PRODUCTS } from "~/graphql/products";
import { getI18n } from "~/i18n/getI18n";
import { getServerClient } from "~/lib/apollo/server-client";
import {
  GetPublicProductsQuery,
  GetPublicProductsQueryVariables,
  Order_By,
  Product_Status_Enum,
} from "~/types/graphql.generated";

import { ShopCatalogClient } from "./ShopCatalogClient";

const ITEMS_LIMIT = 12;

interface ShopCatalogServerProps {
  locale: string;
}

export async function ShopCatalogServer({ locale }: ShopCatalogServerProps) {
  try {
    const client = await getServerClient();

    const { data } = await client.query<GetPublicProductsQuery, GetPublicProductsQueryVariables>({
      query: GET_PUBLIC_PRODUCTS,
      variables: {
        limit: ITEMS_LIMIT,
        offset: 0,
        order_by: [{ created_at: Order_By.Desc }],
        where: { status: { _eq: Product_Status_Enum.Active } },
      },
    });

    const products = data?.products ?? [];
    const count = data?.products_aggregate?.aggregate?.count ?? 0;

    return <ShopCatalogClient initialCount={count} initialProducts={products} />;
  } catch (error) {
    console.error("Error fetching products:", error);

    const i18n = await getI18n({ locale });

    return <Alert variant="warning">{i18n("Products are not available at the moment")}</Alert>;
  }
}
