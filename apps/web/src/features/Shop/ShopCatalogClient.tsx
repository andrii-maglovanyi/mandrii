"use client";

import clsx from "clsx";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useDebouncedCallback } from "use-debounce";

import {
  AnimatedEllipsis,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  FallbackImage,
  Input,
  Pagination,
  RichText,
  Select,
} from "~/components/ui";
import { useListControls } from "~/hooks/useListControls";
import { Product, ProductVariant, useProducts } from "~/hooks/useProducts";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { constants } from "~/lib/constants";
import { ClothingSize } from "~/lib/constants/options/CLOTHING";
import { Clothing_Age_Group_Enum, Clothing_Gender_Enum, GetPublicProductsQuery } from "~/types/graphql.generated";
import { formatPrice } from "~/lib/utils";
import { FilterParams, Locale } from "~/types";

const ITEMS_LIMIT = 12;
const SEARCH_DEBOUNCE_MS = 300;

type GraphQLProduct = GetPublicProductsQuery["products"][number];

interface ShopCatalogClientProps {
  initialCount: number;
  initialProducts: GraphQLProduct[];
}

const normalizeImage = (path?: null | string) => {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${constants.vercelBlobStorageUrl}/${path}`;
};

const mapProduct = (product: GraphQLProduct): Product => ({
  badge: product.badge,
  category: product.category,
  clothingType: product.clothing_product_details?.clothing_type ?? null,
  currency: product.currency,
  description_en: product.description_en,
  description_uk: product.description_uk,
  id: product.id,
  images: product.images?.map(normalizeImage).filter((img): img is string => img !== undefined),
  name: product.name,
  priceMinor: product.price_minor,
  slug: product.slug,
  status: product.status,
  stock: product.stock ?? undefined,
  variants: product.product_variants.map((v) => ({
    ageGroup: v.age_group as Clothing_Age_Group_Enum,
    color: v.color ?? undefined,
    gender: v.gender as Clothing_Gender_Enum,
    id: v.id,
    priceOverrideMinor: v.price_override_minor,
    size: v.size as ClothingSize,
    sku: v.sku,
    stock: v.stock,
  })),
});

const ProductCard = ({ locale, product }: { locale: Locale; product: Product }) => {
  const i18n = useI18n();

  const [mainImage, secondImage] = product.images ?? [];
  const hasVariants = product.variants && product.variants.length > 0;
  const totalStock = hasVariants ? product.variants!.reduce((sum, v) => sum + v.stock, 0) : (product.stock ?? 0);

  return (
    <Card className="group/card relative flex flex-col" href={`/shop/${product.slug}`}>
      <div className={`bg-surface-tint/50 relative aspect-4/5 w-full overflow-hidden rounded-lg`}>
        <FallbackImage
          alt={product.name}
          className={clsx("object-cover transition-opacity duration-500", secondImage && "group-hover/card:opacity-0")}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          src={mainImage || ""}
        />
        {secondImage && (
          <FallbackImage
            alt={`${product.name} - alternate view`}
            className={`absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover/card:opacity-100`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={secondImage}
          />
        )}

        {totalStock === 0 && (
          <div className={`bg-surface/50 absolute inset-0 flex items-center justify-center backdrop-blur-sm`}>
            <span className={`bg-surface text-neutral/70 rounded-full px-3 py-1.5 text-sm font-medium`}>
              {i18n("Sold out")}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 pt-4">
        <h3 className={`text-on-surface group-hover/card:text-primary text-sm leading-snug font-medium`}>
          {product.name}
        </h3>
        <p className="text-neutral/70 text-sm">{formatPrice(product.priceMinor, product.currency, locale)}</p>
      </div>
    </Card>
  );
};

export function ShopCatalogClient({ initialCount, initialProducts }: ShopCatalogClientProps) {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { usePublicProducts } = useProducts();

  const [category, setCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const { handleFilter, handlePaginate, listState } = useListControls({ limit: ITEMS_LIMIT, where: {} });

  // Only fetch from API after user interacts (filters/pagination)
  const {
    count: apiCount,
    data: apiProducts,
    error,
    loading,
    refetch,
  } = usePublicProducts(
    hasUserInteracted ? listState : { limit: 0 }, // Skip query until user interacts
  );

  // Use initial data until user interacts, then use API data
  const products = useMemo(() => {
    if (!hasUserInteracted) {
      return initialProducts.map(mapProduct);
    }
    return apiProducts;
  }, [hasUserInteracted, initialProducts, apiProducts]);

  const count = hasUserInteracted ? apiCount : initialCount;
  const isLoading = hasUserInteracted && loading;

  const countPages = useMemo(() => Math.max(1, Math.ceil(count / ITEMS_LIMIT)), [count]);

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    if (value.trim()) {
      sendToMixpanel("Searched Products", { query: value.trim() });
    }
  }, SEARCH_DEBOUNCE_MS);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSetSearch(e.target.value);
    setHasUserInteracted(true);
  };

  const handleCategoryChange = (value: string | undefined) => {
    setCategory(value);
    setHasUserInteracted(true);
    if (value) {
      sendToMixpanel("Filtered Products by Category", { category: value });
    }
  };

  useEffect(() => {
    if (!hasUserInteracted) return;

    const where: FilterParams = {};

    if (category) {
      where.category = { _eq: category };
    }

    if (debouncedSearch) {
      where._or = [
        { name: { _ilike: `%${debouncedSearch}%` } },
        { description_en: { _ilike: `%${debouncedSearch}%` } },
        { description_uk: { _ilike: `%${debouncedSearch}%` } },
      ];
    }

    handleFilter(where);
  }, [category, debouncedSearch, handleFilter, hasUserInteracted]);

  const handlePageChange = (pageIndex: number) => {
    setHasUserInteracted(true);
    const actualOffset = (pageIndex - 1) * ITEMS_LIMIT;
    handlePaginate({ offset: actualOffset });

    if (!isMobile) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  };

  const categoryOptions = constants.options.PRODUCT_CATEGORIES.map((option) => {
    const label = option.label[locale] ?? option.label.en;
    return { label, value: option.value };
  });

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ title: i18n("Home"), url: "/" }]} />

      <div className={`mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}>
        <h1
          className={`from-primary to-secondary bg-linear-to-r bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl`}
        >
          {i18n("Shop")}
        </h1>
      </div>

      <div className="mx-auto w-full max-w-(--breakpoint-xl)">
        <div className="shrink-0 space-y-4">
          <div className={`flex flex-col gap-4 md:flex-row md:gap-x-2`}>
            <div className={`w-full md:flex-1`}>
              <Input
                onChange={handleSearchChange}
                placeholder={i18n("Search products by name...")}
                type="search"
                value={searchQuery}
              />
            </div>
            <div className={`w-full md:w-48 md:shrink-0`}>
              <Select
                onChange={(e) => handleCategoryChange(e.target.value || undefined)}
                options={[{ label: i18n("All categories"), value: "" }, ...categoryOptions]}
                value={category ?? ""}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between">
        {count > 0 ? (
          <RichText as="div" className={`text-sm sm:text-base`}>
            {(() => {
              const currentOffset = listState.offset ?? 0;
              const start = currentOffset + 1;
              const end = Math.min(currentOffset + products.length, count);

              return i18n("Showing **{start}**-**{end}** of **{count}** items", {
                count,
                end,
                start,
              });
            })()}
          </RichText>
        ) : (
          <div />
        )}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30`}>
            <AlertCircle className={`h-8 w-8 text-red-600 dark:text-red-400`} />
          </div>
          <div className="text-center">
            <h3 className="font-semibold">{i18n("Failed to load products")}</h3>
            <p className="text-neutral/60 mt-1 text-sm">{i18n("There was a problem fetching the catalog.")}</p>
          </div>
          <Button color="primary" onClick={() => refetch()} size="sm" variant="outlined">
            <RefreshCw className="mr-2 h-4 w-4" />
            {i18n("Try again")}
          </Button>
        </div>
      ) : products.length === 0 && !isLoading ? (
        <EmptyState
          body={i18n("Try adjusting your filters or search terms")}
          heading={i18n("No products found")}
          icon={<ShoppingBag size={50} />}
        />
      ) : (
        <>
          <div className={`grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}>
            {products.map((product) => (
              <ProductCard key={product.id} locale={locale} product={product} />
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <AnimatedEllipsis size="md" />
            </div>
          )}
        </>
      )}

      <div className="mt-6 flex justify-center">
        <Pagination
          count={countPages}
          index={(listState.offset ?? 0) / ITEMS_LIMIT + 1}
          loading={isLoading}
          nextText={i18n("Next")}
          onPaginate={handlePageChange}
          prevText={i18n("Back")}
        />
      </div>
    </div>
  );
}
