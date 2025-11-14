import { CreditCard, ShoppingBag } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback } from "react";

import { Checkbox, Separator } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { VenueFormData, VenueSchema } from "~/lib/validation/venue";
import { Locale } from "~/types";

type VenueShopDetails = NonNullable<VenueFormData["venue_shop_details"]>;
type VenueShopDetailsProps = Pick<FormProps<VenueSchema["shape"]>, "setValues" | "values">;

export const VenueShopDetails = ({ setValues, values }: VenueShopDetailsProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const shopData = values.venue_shop_details ?? {};

  const updateShopData = useCallback(
    (updates: Partial<VenueShopDetails>) => {
      setValues((prev) => {
        const currentShopDetails = prev.venue_shop_details ?? {};

        return {
          ...prev,
          venue_shop_details: {
            ...currentShopDetails,
            ...updates,
          },
        };
      });
    },
    [setValues],
  );

  const toggleProductCategory = useCallback(
    (category: (typeof constants.productCategoryOptions)[number]["value"]) => {
      const currentCategories = shopData.product_categories || [];
      const newCategories = currentCategories.includes(category)
        ? currentCategories.filter((c) => c !== category)
        : [...currentCategories, category];

      updateShopData({ product_categories: newCategories });
    },
    [shopData.product_categories, updateShopData],
  );

  const togglePaymentMethod = useCallback(
    (method: (typeof constants.paymentOptions)[number]["value"]) => {
      const currentMethods = shopData.payment_methods || [];
      const newMethods = currentMethods.includes(method)
        ? currentMethods.filter((m) => m !== method)
        : [...currentMethods, method];

      updateShopData({ payment_methods: newMethods });
    },
    [shopData.payment_methods, updateShopData],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <ShoppingBag size={20} />
          {i18n("Categories")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-3
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {constants.productCategoryOptions.map((category) => (
            <Checkbox
              checked={(shopData.product_categories || []).includes(category.value)}
              key={category.value}
              label={category.label[locale]}
              onChange={() => {
                toggleProductCategory(category.value);
              }}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <CreditCard size={20} />
          {i18n("Payment methods")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-3
          md:grid-cols-2
        `}>
          {constants.paymentOptions.map((method) => (
            <Checkbox
              checked={(shopData.payment_methods || []).includes(method.value)}
              key={method.value}
              label={i18n(method.label[locale])}
              onChange={() => {
                togglePaymentMethod(method.value);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
