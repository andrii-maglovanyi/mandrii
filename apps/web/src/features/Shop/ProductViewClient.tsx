"use client";

import clsx from "clsx";
import { ShoppingBag, ShoppingBasket } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Breadcrumbs, Button, EmptyState, ImageCarousel, RichText, TabPane, Tabs } from "~/components/ui";
import { CartItemVariant, getCartItemId, useCart } from "~/contexts/CartContext";
import { useNotifications } from "~/hooks/useNotifications";
import { mapProduct, useProducts } from "~/hooks/useProducts";
import { useI18n } from "~/i18n/useI18n";
import {
  CLOTHING_AGE_GROUP,
  CLOTHING_GENDER,
  CLOTHING_GENDER_ADULT,
  CLOTHING_GENDER_KIDS,
  CLOTHING_SIZE_ADULT,
  CLOTHING_SIZE_KIDS,
  ClothingSize,
} from "~/lib/constants/options/CLOTHING";
import { Clothing_Age_Group_Enum, Clothing_Gender_Enum, GetProductBySlugQuery } from "~/types/graphql.generated";
import { sendToMixpanel } from "~/lib/mixpanel";
import { formatPrice } from "~/lib/utils";
import { Locale } from "~/types";

import { ColorSelector, ReturnPolicy, ShippingInfo, VariantSelector } from "./components";

type GraphQLProduct = GetProductBySlugQuery["products"][number];

interface ProductViewClientProps {
  initialProduct: GraphQLProduct | null;
  returnPolicy?: ReturnPolicyData;
  slug: string;
}

interface ReturnPolicyData {
  content: string;
  title: string;
}

export function ProductViewClient({ initialProduct, returnPolicy, slug }: ProductViewClientProps) {
  const locale = useLocale() as Locale;
  const i18n = useI18n();
  const { addItem, currency: cartCurrency, items } = useCart();
  const { showError, showSuccess } = useNotifications();
  const { useGetProduct } = useProducts();

  /**
   * Client-side product fetch for data freshness.
   * Uses SSR data initially, then background-fetches to get latest stock/prices.
   * This ensures users see up-to-date availability without waiting for hydration.
   */
  const { data: clientProduct } = useGetProduct(slug);

  // Use client data if available (fresher), otherwise SSR data
  const product = useMemo(() => {
    // Prefer client-fetched data for freshness (stock, prices may have changed)
    if (clientProduct) return clientProduct;
    // Fall back to SSR data for initial render
    if (!initialProduct) return null;
    return mapProduct(initialProduct);
  }, [clientProduct, initialProduct]);

  // Track product view
  useEffect(() => {
    if (product) {
      sendToMixpanel("Viewed Product", {
        category: product.category,
        currency: product.currency,
        priceMinor: product.priceMinor,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
      });
    }
  }, [product?.id]); // Only track once per product

  // Variant selection state
  const [selectedGender, setSelectedGender] = useState<Clothing_Gender_Enum | undefined>();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<Clothing_Age_Group_Enum | undefined>();
  const [selectedSize, setSelectedSize] = useState<ClothingSize | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  const normalizedVariants = useMemo(
    () =>
      (product?.variants ?? []).map((variant) => ({
        ...variant,
        ageGroup: (variant.ageGroup ?? "adult") as Clothing_Age_Group_Enum,
        gender: (variant.gender?.toLowerCase?.() ?? "") as Clothing_Gender_Enum,
      })),
    [product?.variants],
  );

  const hasVariants = Boolean(product?.variants?.length);

  /**
   * Check if this is a simple product (non-clothing) that doesn't require variant selection.
   * A simple product has variants where all have NULL/empty gender, age_group, and size.
   */
  const isSimpleProduct = useMemo(() => {
    if (!product?.variants?.length) return false;
    return product.variants.every((v) => !v.gender && !v.ageGroup && !v.size);
  }, [product?.variants]);

  /**
   * Single-pass variant computation - filters once and derives all options.
   * Computes: hasColorVariants, availableAgeGroups, availableGenders,
   * availableSizes, availableColors, and selectedVariant in one memo.
   */
  const variantOptions = useMemo(() => {
    if (!normalizedVariants.length) {
      return {
        availableAgeGroups: [],
        availableColors: [],
        availableGenders: [],
        availableSizes: [],
        hasColorVariants: false,
        selectedVariant: null,
      };
    }

    // Single pass to check for color variants
    const hasColorVariants = normalizedVariants.some((v) => v.color);

    // Progressive filtering - filter once per level
    const afterAgeGroup = selectedAgeGroup
      ? normalizedVariants.filter((v) => v.ageGroup === selectedAgeGroup)
      : normalizedVariants;

    const afterGender = selectedGender ? afterAgeGroup.filter((v) => v.gender === selectedGender) : afterAgeGroup;

    const afterSize = selectedSize ? afterGender.filter((v) => v.size === selectedSize) : afterGender;

    // Age groups - from all variants
    const ageGroupSet = new Set(normalizedVariants.map((v) => v.ageGroup));
    const ageGroupStockMap = new Map<string, number>();
    for (const v of normalizedVariants) {
      ageGroupStockMap.set(v.ageGroup, (ageGroupStockMap.get(v.ageGroup) ?? 0) + v.stock);
    }
    const availableAgeGroups = CLOTHING_AGE_GROUP.filter((a) => ageGroupSet.has(a.value)).map((a) => ({
      label: a.label[locale],
      stock: ageGroupStockMap.get(a.value) ?? 0,
      value: a.value,
    }));

    // Genders - from age-filtered variants
    const genderSet = new Set(afterAgeGroup.map((v) => v.gender));
    const genderStockMap = new Map<string, number>();
    for (const v of afterAgeGroup) {
      genderStockMap.set(v.gender, (genderStockMap.get(v.gender) ?? 0) + v.stock);
    }
    const genderOptions = selectedAgeGroup === "kids" ? CLOTHING_GENDER_KIDS : CLOTHING_GENDER_ADULT;
    const availableGenders = genderOptions
      .filter((g) => genderSet.has(g.value))
      .map((g) => ({
        label: g.label[locale],
        stock: genderStockMap.get(g.value) ?? 0,
        value: g.value,
      }));

    // Sizes - from age+gender filtered variants
    const sizeSet = new Set(afterGender.map((v) => v.size));
    const sizeStockMap = new Map<string, number>();
    for (const v of afterGender) {
      sizeStockMap.set(v.size, (sizeStockMap.get(v.size) ?? 0) + v.stock);
    }
    const sizeOptions = selectedAgeGroup === "kids" ? CLOTHING_SIZE_KIDS : CLOTHING_SIZE_ADULT;
    const availableSizes = sizeOptions
      .filter((s) => sizeSet.has(s.value))
      .map((s) => ({
        label: s.label[locale],
        stock: sizeStockMap.get(s.value) ?? 0,
        value: s.value,
      }));

    // Colors - from age+gender+size filtered variants
    let availableColors: Array<{ label: string; stock: number; value: string }> = [];
    if (hasColorVariants) {
      const colorStockMap = new Map<string, number>();
      for (const v of afterSize) {
        if (v.color) {
          colorStockMap.set(v.color, (colorStockMap.get(v.color) ?? 0) + v.stock);
        }
      }
      availableColors = Array.from(colorStockMap.entries()).map(([color, stock]) => ({
        label: color.charAt(0).toUpperCase() + color.slice(1),
        stock,
        value: color,
      }));
    }

    // Selected variant - only if all required selections made
    let selectedVariant = null;
    if (selectedGender && selectedAgeGroup && selectedSize) {
      if (!hasColorVariants || selectedColor) {
        selectedVariant =
          normalizedVariants.find(
            (v) =>
              v.gender === selectedGender &&
              v.ageGroup === selectedAgeGroup &&
              v.size === selectedSize &&
              (!hasColorVariants || v.color === selectedColor),
          ) ?? null;
      }
    }

    return {
      availableAgeGroups,
      availableColors,
      availableGenders,
      availableSizes,
      hasColorVariants,
      selectedVariant,
    };
  }, [normalizedVariants, selectedAgeGroup, selectedGender, selectedSize, selectedColor, locale]);

  /**
   * For simple products, auto-select the first (and usually only) variant.
   * For clothing products, use the user's selections.
   */
  const effectiveSelectedVariant = useMemo(() => {
    if (isSimpleProduct && product?.variants?.length) {
      return product.variants[0];
    }
    return variantOptions.selectedVariant;
  }, [isSimpleProduct, product?.variants, variantOptions.selectedVariant]);

  // Destructure for convenience
  const { availableAgeGroups, availableColors, availableGenders, availableSizes, hasColorVariants } = variantOptions;

  const isVariantSelected = !hasVariants || isSimpleProduct || Boolean(effectiveSelectedVariant);

  // Reset dependent selections when parent changes
  const handleAgeGroupChange = useCallback((value: string) => {
    setSelectedAgeGroup(value as Clothing_Age_Group_Enum);
    setSelectedGender(undefined);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
  }, []);

  const handleGenderChange = useCallback((value: string) => {
    setSelectedGender(value as Clothing_Gender_Enum);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
  }, []);

  const handleSizeChange = useCallback((value: string) => {
    setSelectedSize(value as ClothingSize);
    setSelectedColor(undefined);
  }, []);

  const handleColorChange = useCallback((value: string) => {
    setSelectedColor(value);
  }, []);

  // Auto-select when only one option is available
  useEffect(() => {
    if (availableAgeGroups.length === 1 && !selectedAgeGroup) {
      setSelectedAgeGroup(availableAgeGroups[0].value as Clothing_Age_Group_Enum);
    }
  }, [availableAgeGroups, selectedAgeGroup]);

  useEffect(() => {
    if (availableGenders.length === 1 && !selectedGender) {
      setSelectedGender(availableGenders[0].value as Clothing_Gender_Enum);
    }
  }, [availableGenders, selectedGender]);

  useEffect(() => {
    if (availableSizes.length === 1 && !selectedSize) {
      setSelectedSize(availableSizes[0].value as ClothingSize);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (availableColors.length === 1 && !selectedColor) {
      setSelectedColor(availableColors[0].value);
    }
  }, [availableColors, selectedColor]);

  // Product not found
  if (!product) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          body={i18n("The product you're looking for isn't available yet")}
          heading={i18n("Product not found")}
          icon={<ShoppingBasket size={50} />}
        />
      </div>
    );
  }

  const description =
    locale === "uk"
      ? product.description_uk || product.description_en
      : product.description_en || product.description_uk;

  const images = product.images ?? [];

  // Use variant price if available, otherwise fall back to product price
  const effectivePrice = effectiveSelectedVariant?.priceOverrideMinor ?? product.priceMinor;
  const priceLabel = formatPrice(effectivePrice, product.currency, locale);
  const mainImage = images[0];

  // Calculate stock - use variant stock if variants exist, otherwise product stock
  const currentStock = hasVariants ? (effectiveSelectedVariant?.stock ?? 0) : (product.stock ?? 0);

  // Determine if add to cart should be enabled
  const canAddToCart = isVariantSelected && currentStock > 0;

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    // Check for currency mismatch with existing cart items
    if (cartCurrency && cartCurrency !== product.currency) {
      showError(
        i18n(
          "This item is priced in {currency}, but your cart contains {cartCurrency} items. Please complete or clear your current cart first.",
          { cartCurrency, currency: product.currency },
        ),
      );
      return;
    }

    const variant: CartItemVariant | undefined =
      hasVariants && selectedGender && selectedAgeGroup && selectedSize
        ? {
            ageGroup: selectedAgeGroup,
            color: selectedColor,
            gender: selectedGender,
            size: selectedSize,
          }
        : undefined;

    const cartItemId = getCartItemId(product.id, variant);

    // Build variant label for cart display
    const variantParts: string[] = [];
    if (variant) {
      const ageLabel = CLOTHING_AGE_GROUP.find((a) => a.value === variant.ageGroup)?.label[locale];
      const genderLabel = CLOTHING_GENDER.find((g) => g.value === variant.gender)?.label[locale];
      if (ageLabel) variantParts.push(ageLabel);
      if (genderLabel) variantParts.push(genderLabel);
      variantParts.push(variant.size.toUpperCase());
      if (variant.color) {
        variantParts.push(variant.color.charAt(0).toUpperCase() + variant.color.slice(1));
      }
    }
    const variantLabel = variantParts.length ? ` (${variantParts.join(", ")})` : "";

    const result = addItem({
      currency: product.currency,
      id: cartItemId,
      image: mainImage,
      name: `${product.name}${variantLabel}`,
      priceMinor: effectivePrice,
      quantity: 1,
      slug: product.slug,
      stock: currentStock,
      variant,
    });

    // Defensive check - should not happen due to pre-check above
    if (!result.success) {
      showError(
        i18n(
          "This item is priced in {currency}, but your cart contains {cartCurrency} items. Please complete or clear your current cart first.",
          { cartCurrency: cartCurrency ?? "", currency: product.currency },
        ),
      );
      return;
    }

    showSuccess(i18n("{name} added to cart", { name: product.name }), {
      header: i18n("Added!"),
    });

    sendToMixpanel("Added to Cart", {
      currency: product.currency,
      priceMinor: effectivePrice,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quantity: 1,
      variant: variant ? variantLabel : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ title: i18n("Home"), url: "/" }, { title: i18n("Shop"), url: "/shop" }, { title: product.name }]}
      />

      {/* Main Product Section */}
      <section className={`grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12`}>
        {/* Image Gallery */}
        <div className={`relative aspect-square w-full overflow-hidden rounded-lg sm:aspect-4/5`}>
          <ImageCarousel autoPlay={false} images={images.length ? images : ["/static/no-image.webp"]} showDots />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            {product.category && (
              <span className={`text-neutral/60 text-sm font-medium tracking-wide uppercase`}>{product.category}</span>
            )}

            {product.badge && (
              <span className={`bg-secondary/50 inline-flex w-fit rounded-lg px-3 py-1 text-xs font-medium`}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Title & Price */}
          <div className="space-y-3">
            <h1 className={`text-2xl leading-tight font-semibold md:text-3xl`}>{product.name}</h1>
            <div className="space-y-1">
              <p className="text-on-surface text-2xl font-semibold">{priceLabel}</p>
              <p className="text-neutral/60 text-sm">{i18n("Price includes all applicable taxes")}</p>
            </div>
          </div>

          {/* Product Description */}
          {description && (
            <div className={`prose prose-sm text-neutral/80 dark:prose-invert max-w-none`}>
              <RichText>{description}</RichText>
            </div>
          )}

          {/* Variant Selectors - only for clothing products with variant options */}
          {hasVariants && !isSimpleProduct && (
            <div className="border-neutral/10 space-y-5 border-y py-6">
              <VariantSelector
                label={i18n("Age group")}
                onChange={handleAgeGroupChange}
                options={availableAgeGroups}
                value={selectedAgeGroup}
              />

              <VariantSelector
                disabled={!selectedAgeGroup}
                label={i18n("Gender")}
                onChange={handleGenderChange}
                options={availableGenders}
                value={selectedGender}
              />

              <VariantSelector
                disabled={!selectedGender}
                label={i18n("Size")}
                onChange={handleSizeChange}
                options={availableSizes}
                value={selectedSize}
              />

              {hasColorVariants && (
                <ColorSelector
                  disabled={!selectedSize}
                  label={i18n("Color")}
                  onChange={handleColorChange}
                  options={availableColors}
                  value={selectedColor}
                />
              )}

              {effectiveSelectedVariant && effectiveSelectedVariant.stock === 0 && (
                <p className="text-danger text-sm font-medium">{i18n("Out of stock for selected options")}</p>
              )}
            </div>
          )}

          {/* Stock indicator (for simple products and products without variants) */}
          {(!hasVariants || isSimpleProduct) && (
            <p className={clsx("text-sm", currentStock > 0 ? `text-neutral/70` : `text-danger font-medium`)}>
              {currentStock > 0 ? i18n("In stock") : i18n("Out of stock")}
            </p>
          )}

          {/* Add to Cart */}
          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              color="primary"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              size="lg"
              variant="filled"
            >
              {hasVariants && !isVariantSelected ? i18n("Select options") : i18n("Add to cart")}
            </Button>
            {items.length > 0 && (
              <Link href={`/${locale}/shop/cart`}>
                <Button className="w-full" color="neutral" size="lg" variant="outlined">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {i18n("View bag")} ({items.reduce((sum, item) => sum + item.quantity, 0)})
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Tabs defaultActiveKey="shipping">
        <TabPane tab={i18n("Shipping info")} key="shipping">
          <div className="space-y-6 py-4">
            <ShippingInfo />
            <div className="border-neutral/10 space-y-3 border-t pt-4">
              <p className="text-neutral/70 text-sm">
                {i18n("You'll receive an email confirmation once your order is paid and ready to ship.")}
              </p>
              <p className="text-neutral/70 text-sm">
                {i18n("Need a custom option? Drop me a note via the contact form and mention the product slug:")}{" "}
                <code className={`bg-surface-tint rounded px-2 py-0.5 font-mono text-xs`}>{product.slug}</code>
              </p>
            </div>
          </div>
        </TabPane>
        <TabPane tab={i18n("Returns policy")}>
          <div className="py-4">
            {returnPolicy?.content && <ReturnPolicy content={returnPolicy.content} title={returnPolicy.title} />}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}
