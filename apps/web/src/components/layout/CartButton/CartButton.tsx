import clsx from "clsx";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

import { ActionButton } from "~/components/ui";
import { useCart } from "~/contexts/CartContext";
import { useI18n } from "~/i18n/useI18n";

interface CartButtonProps {
  onClick?: () => void;
}

export const CartButton = ({ onClick }: CartButtonProps) => {
  const i18n = useI18n();
  const router = useRouter();
  const { items } = useCart();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleClick = () => {
    router.push("/shop/cart");
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="relative">
      <ActionButton
        aria-label={i18n("Shopping bag")}
        data-testid="cart-button"
        icon={<ShoppingBag size={20} />}
        onClick={handleClick}
        tooltipPosition="bottom-start"
        variant="ghost"
      />
      {itemCount > 0 && (
        <span
          className={clsx(
            `absolute -top-px -right-px flex h-5 min-w-5 items-center justify-center`,
            "bg-primary text-surface rounded-full px-0.5 text-xs font-semibold",
          )}
          data-testid="cart-count"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </div>
  );
};
