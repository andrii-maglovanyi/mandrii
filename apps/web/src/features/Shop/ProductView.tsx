"use client";

import clsx from "clsx";
import { ShoppingBasket, ShoppingCart } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AnimatedEllipsis,
  Breadcrumbs,
  Button,
  EmptyState,
  ImageCarousel,
  RichText,
  TabPane,
  Tabs,
} from "~/components/ui";
import { CartItemVariant, getCartItemId, useCart } from "~/contexts/CartContext";
import { useNotifications } from "~/hooks/useNotifications";
import { useProducts } from "~/hooks/useProducts";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import {
  CLOTHING_AGE_GROUP,
  CLOTHING_GENDER,
  CLOTHING_SIZE_ADULT,
  CLOTHING_SIZE_KIDS,
  ClothingAgeGroup,
  ClothingGender,
  ClothingSize,
} from "~/lib/constants/options/CLOTHING";
import { formatPrice } from "~/lib/utils";
import { Locale } from "~/types";

interface VariantSelectorProps {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; stock?: number; value: string }>;
  value?: string;
}

const VariantSelector = ({ disabled, label, onChange, options, value }: VariantSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-on-surface text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          const isOutOfStock = option.stock === 0;
          const isDisabled = disabled || isOutOfStock;

          return (
            <button
              className={clsx(
                `rounded-full border px-4 py-2.5 text-sm font-medium transition-all`,
                isSelected
                  ? "border-primary bg-primary text-surface"
                  : `border-neutral/20 hover:border-neutral/40 active:bg-neutral/10 bg-transparent`,
                isDisabled && "cursor-not-allowed opacity-40",
                isOutOfStock && "line-through",
              )}
              disabled={isDisabled}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {/* Show low stock warning only for selected option */}
      {value &&
        options.find((o) => o.value === value)?.stock !== undefined &&
        (() => {
          const stock = options.find((o) => o.value === value)?.stock ?? 0;
          if (stock > 0 && stock <= 5) {
            return <p className={`text-xs text-orange-600 dark:text-orange-400`}>Only {stock} left</p>;
          }
          return null;
        })()}
    </div>
  );
};

export const ProductView = ({ slug }: { slug: string }) => {
  const locale = useLocale() as Locale;
  const i18n = useI18n();
  const { addItem, currency: cartCurrency } = useCart();
  const { showError } = useNotifications();
  const { useGetProduct } = useProducts();

  const { data: product, loading } = useGetProduct(slug);

  // Variant selection state
  const [selectedGender, setSelectedGender] = useState<ClothingGender | undefined>();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<ClothingAgeGroup | undefined>();
  const [selectedSize, setSelectedSize] = useState<ClothingSize | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  const normalizedVariants = useMemo(
    () =>
      (product?.variants ?? []).map((variant) => ({
        ...variant,
        ageGroup: (variant.ageGroup ?? "adult") as ClothingAgeGroup,
        gender: (variant.gender?.toLowerCase?.() ?? "") as ClothingGender,
      })),
    [product?.variants],
  );

  const hasVariants = Boolean(product?.variants?.length);

  // Check if product has color variants
  const hasColorVariants = useMemo(() => normalizedVariants.some((v) => v.color), [normalizedVariants]);

  // Get available options based on current selection
  const availableGenders = useMemo(() => {
    if (!normalizedVariants.length) return [];
    const genders = [...new Set(normalizedVariants.map((v) => v.gender))];
    return CLOTHING_GENDER.filter((g) => genders.includes(g.value)).map((g) => {
      const totalStock = normalizedVariants.filter((v) => v.gender === g.value).reduce((sum, v) => sum + v.stock, 0);
      return { label: g.label[locale], stock: totalStock, value: g.value };
    });
  }, [normalizedVariants, locale]);

  const availableAgeGroups = useMemo(() => {
    if (!normalizedVariants.length) return [];
    let filtered = selectedGender ? normalizedVariants.filter((v) => v.gender === selectedGender) : normalizedVariants;

    // If gender filtering produced nothing (possible casing mismatch), fall back to all variants.
    if (selectedGender && filtered.length === 0) {
      filtered = normalizedVariants;
    }

    const ageGroups = [...new Set(filtered.map((v) => v.ageGroup))];
    return CLOTHING_AGE_GROUP.filter((a) => ageGroups.includes(a.value)).map((a) => {
      const totalStock = filtered.filter((v) => v.ageGroup === a.value).reduce((sum, v) => sum + v.stock, 0);
      return { label: a.label[locale], stock: totalStock, value: a.value };
    });
  }, [normalizedVariants, selectedGender, locale]);

  const availableSizes = useMemo(() => {
    if (!normalizedVariants.length) return [];
    let filtered = normalizedVariants;
    if (selectedGender) filtered = filtered.filter((v) => v.gender === selectedGender);
    if (selectedGender && filtered.length === 0) filtered = normalizedVariants;
    if (selectedAgeGroup) filtered = filtered.filter((v) => v.ageGroup === selectedAgeGroup);

    const sizes = [...new Set(filtered.map((v) => v.size))];
    const sizeOptions = selectedAgeGroup === "kids" ? CLOTHING_SIZE_KIDS : CLOTHING_SIZE_ADULT;

    return sizeOptions
      .filter((s) => sizes.includes(s.value))
      .map((s) => {
        const variant = filtered.find((v) => v.size === s.value);
        return { label: s.label[locale], stock: variant?.stock ?? 0, value: s.value };
      });
  }, [product?.variants, selectedGender, selectedAgeGroup, locale]);

  // Get available colors based on current selection
  const availableColors = useMemo(() => {
    if (!normalizedVariants.length || !hasColorVariants) return [];
    let filtered = normalizedVariants;
    if (selectedGender) filtered = filtered.filter((v) => v.gender === selectedGender);
    if (selectedGender && filtered.length === 0) filtered = normalizedVariants;
    if (selectedAgeGroup) filtered = filtered.filter((v) => v.ageGroup === selectedAgeGroup);
    if (selectedSize) filtered = filtered.filter((v) => v.size === selectedSize);

    const colors = [...new Set(filtered.map((v) => v.color).filter(Boolean))] as string[];
    return colors.map((color) => {
      const totalStock = filtered.filter((v) => v.color === color).reduce((sum, v) => sum + v.stock, 0);
      // Capitalize first letter for display
      const label = color.charAt(0).toUpperCase() + color.slice(1);
      return { label, stock: totalStock, value: color };
    });
  }, [normalizedVariants, hasColorVariants, selectedGender, selectedAgeGroup, selectedSize]);

  // Get current variant stock
  const selectedVariant = useMemo(() => {
    if (!normalizedVariants.length || !selectedGender || !selectedAgeGroup || !selectedSize) return null;
    // If product has color variants, require color selection too
    if (hasColorVariants && !selectedColor) return null;
    return normalizedVariants.find(
      (v) =>
        v.gender === selectedGender &&
        v.ageGroup === selectedAgeGroup &&
        v.size === selectedSize &&
        (!hasColorVariants || v.color === selectedColor),
    );
  }, [normalizedVariants, selectedGender, selectedAgeGroup, selectedSize, hasColorVariants, selectedColor]);

  const isVariantSelected = !hasVariants || Boolean(selectedVariant);

  // Reset dependent selections when parent changes
  const handleGenderChange = useCallback((value: string) => {
    setSelectedGender(value as ClothingGender);
    setSelectedAgeGroup(undefined);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
  }, []);

  const handleAgeGroupChange = useCallback((value: string) => {
    setSelectedAgeGroup(value as ClothingAgeGroup);
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
      setSelectedAgeGroup(availableAgeGroups[0].value as ClothingAgeGroup);
    }
  }, [availableAgeGroups, selectedAgeGroup]);

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

  const description =
    locale === "uk"
      ? product?.description_uk || product?.description_en
      : product?.description_en || product?.description_uk;

  // Images are already normalized in useProducts hook
  const images = product?.images ?? [];

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <AnimatedEllipsis size="lg" />
      </div>
    );
  }

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

  // Use variant price if available, otherwise fall back to product price
  const effectivePrice = selectedVariant?.priceOverrideMinor ?? product.priceMinor;
  const priceLabel = formatPrice(effectivePrice, product.currency, locale);
  const mainImage = images[0];

  // Calculate stock - use variant stock if variants exist, otherwise product stock
  const currentStock = hasVariants ? (selectedVariant?.stock ?? 0) : (product.stock ?? 0);

  // Determine if add to cart should be enabled
  const canAddToCart = isVariantSelected && currentStock > 0;

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    // Check for currency mismatch with existing cart items
    if (cartCurrency && cartCurrency !== product.currency) {
      showError(
        locale === "uk"
          ? `Цей товар у ${product.currency}, але ваш кошик містить товари у ${cartCurrency}. Будь ласка, завершіть або очистіть поточне замовлення.`
          : `This item is priced in ${product.currency}, but your cart contains ${cartCurrency} items. Please complete or clear your current cart first.`,
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
      const genderLabel = CLOTHING_GENDER.find((g) => g.value === variant.gender)?.label[locale];
      const ageLabel = CLOTHING_AGE_GROUP.find((a) => a.value === variant.ageGroup)?.label[locale];
      if (genderLabel) variantParts.push(genderLabel);
      if (ageLabel) variantParts.push(ageLabel);
      variantParts.push(variant.size.toUpperCase());
      if (variant.color) {
        variantParts.push(variant.color.charAt(0).toUpperCase() + variant.color.slice(1));
      }
    }
    const variantLabel = variantParts.length ? ` (${variantParts.join(", ")})` : "";

    addItem({
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
  };

  // Calculate total stock across all variants
  const totalVariantStock = normalizedVariants.reduce((sum, v) => sum + v.stock, 0);

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
          {images.length ? (
            <ImageCarousel autoPlay={false} images={images} showDots />
          ) : (
            <div className={`bg-surface-tint flex h-full w-full items-center justify-center`}>
              <ShoppingCart className="text-neutral/30" size={72} />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          {/* Category tag */}
          {product.category && (
            <span className={`text-neutral/60 text-sm font-medium tracking-wide uppercase`}>{product.category}</span>
          )}

          {/* Title & Price */}
          <div className="space-y-3">
            <h1 className={`text-2xl leading-tight font-semibold md:text-3xl`}>{product.name}</h1>
            <p className="text-on-surface text-2xl font-semibold">{priceLabel}</p>
          </div>

          {/* Variant Selectors */}
          {hasVariants && (
            <div className="border-neutral/10 space-y-5 border-y py-6">
              <VariantSelector
                label={i18n("Gender")}
                onChange={handleGenderChange}
                options={availableGenders}
                value={selectedGender}
              />

              <VariantSelector
                disabled={!selectedGender}
                label={i18n("Age group")}
                onChange={handleAgeGroupChange}
                options={availableAgeGroups}
                value={selectedAgeGroup}
              />

              <VariantSelector
                disabled={!selectedAgeGroup}
                label={i18n("Size")}
                onChange={handleSizeChange}
                options={availableSizes}
                value={selectedSize}
              />

              {hasColorVariants && (
                <VariantSelector
                  disabled={!selectedSize}
                  label={i18n("Color")}
                  onChange={handleColorChange}
                  options={availableColors}
                  value={selectedColor}
                />
              )}

              {selectedVariant && selectedVariant.stock === 0 && (
                <p className="text-danger text-sm font-medium">{i18n("Out of stock for selected options")}</p>
              )}
            </div>
          )}

          {/* Stock indicator (simple) */}
          {!hasVariants && (
            <p className={clsx("text-sm", currentStock > 0 ? `text-neutral/70` : `text-danger font-medium`)}>
              {currentStock > 0 ? i18n("In stock") : i18n("Out of stock")}
            </p>
          )}

          {/* Add to Cart */}
          <div className="flex flex-col gap-3">
            <Button
              className="w-full py-3"
              color="primary"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              size="lg"
              variant="filled"
            >
              {hasVariants && !isVariantSelected ? i18n("Select options") : i18n("Add to cart")}
            </Button>
          </div>

          {/* Product Description */}
          {description && (
            <div className={`prose prose-sm text-neutral/80 dark:prose-invert max-w-none`}>
              <RichText>{description}</RichText>
            </div>
          )}

          {/* Badge */}
          {product.badge && (
            <span
              className={`bg-secondary/20 text-on-surface inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium`}
            >
              {product.badge}
            </span>
          )}
        </div>
      </section>

      {/* Details Accordion Section */}
      <section className="border-neutral/10 border-t pt-8">
        <Tabs defaultActiveKey="details">
          <TabPane tab={i18n("Product Details")}>
            <div className={`grid gap-6 py-4 md:grid-cols-2`}>
              <div className="space-y-3">
                <h3 className="text-base font-semibold">{i18n("About this product")}</h3>
                <p className="text-neutral/70 text-sm leading-relaxed">
                  {i18n(
                    "This is a placeholder description to keep the layout aligned with venues and events. Replace it once the backend schema for products is ready.",
                  )}
                </p>
              </div>
              <div className="space-y-3">
                <h4 className={`text-neutral/60 text-sm font-semibold tracking-wide uppercase`}>
                  {i18n("Quick info")}
                </h4>
                <ul className="text-neutral/70 space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>{i18n("Category")}</span>
                    <span className="text-on-surface font-medium">{product.category ?? i18n("Not set")}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>{i18n("Currency")}</span>
                    <span className="text-on-surface font-medium">{product.currency}</span>
                  </li>
                  {hasVariants && (
                    <li className="flex justify-between">
                      <span>{i18n("Total units")}</span>
                      <span className="text-on-surface font-medium">{totalVariantStock}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </TabPane>
          <TabPane tab={i18n("Shipping & Returns")}>
            <div className="text-neutral/70 space-y-3 py-4 text-sm">
              <p>
                {i18n(
                  "Checkout will be wired to Stripe/Hasura soon. For now this page demonstrates the UI flow and can be connected once the API is available.",
                )}
              </p>
              <p>
                {i18n("Need a custom option? Drop us a note via the contact form and mention the product slug:")}{" "}
                <code className={`bg-surface-tint rounded px-2 py-0.5 font-mono text-xs`}>{product.slug}</code>
              </p>
            </div>
          </TabPane>
        </Tabs>
      </section>
    </div>
  );
};
