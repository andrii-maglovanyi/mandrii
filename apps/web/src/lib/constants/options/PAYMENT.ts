export const PAYMENT = [
  { label: { en: "Cash", uk: "Готівка" }, value: "cash" },
  { label: { en: "Card (chip & PIN)", uk: "Картка (чіп і PIN)" }, value: "card" },
  {
    label: { en: "Contactless (card or phone)", uk: "Безконтактна оплата (картка або телефон)" },
    value: "contactless",
  },
  { label: { en: "Bank transfer", uk: "Банківський переказ" }, value: "bank_transfer" },
  { label: { en: "Online payment", uk: "Онлайн-оплата" }, value: "online_payment" },
] as const;
