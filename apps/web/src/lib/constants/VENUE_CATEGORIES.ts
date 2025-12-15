import { IconName } from "../icons/icons";

export const CATEGORIES: Record<
  string,
  {
    iconName: IconName;
    label: {
      en: string;
      uk: string;
    };
  }
> = {
  ACCOMMODATION: { iconName: "BedDouble", label: { en: "Accommodation", uk: "Житло" } },
  BEAUTY_SALON: { iconName: "Wand2", label: { en: "Beauty salon", uk: "Салон краси" } },
  CAFE: { iconName: "Coffee", label: { en: "Cafe", uk: "Кав'ярня" } },
  CATERING: { iconName: "ChefHat", label: { en: "Catering", uk: "Кейтеринг" } },
  CHURCH: { iconName: "Church", label: { en: "Church", uk: "Церква" } },
  CLUB: { iconName: "Music", label: { en: "Club", uk: "Клуб" } },
  CULTURAL_CENTRE: { iconName: "GalleryHorizontal", label: { en: "Cultural centre", uk: "Культурний центр" } },
  DELIVERY: { iconName: "Package", label: { en: "Delivery", uk: "Доставка" } },
  GROCERY_STORE: { iconName: "ShoppingCart", label: { en: "Grocery store", uk: "Продуктовий магазин" } },
  LEGAL_SERVICE: { iconName: "Scale", label: { en: "Legal service", uk: "Юридична допомога" } },
  LIBRARY: { iconName: "Book", label: { en: "Library", uk: "Бібліотека" } },
  MEDIA: { iconName: "Megaphone", label: { en: "Media", uk: "Медіа" } },
  MEDICAL: { iconName: "Hospital", label: { en: "Medical & Healthcare", uk: "Медицина та охорона здоров'я" } },
  ORGANIZATION: { iconName: "Building", label: { en: "Organization", uk: "Організація" } },
  RESTAURANT: { iconName: "Utensils", label: { en: "Restaurant", uk: "Ресторан" } },
  SCHOOL: { iconName: "GraduationCap", label: { en: "School", uk: "Школа" } },
  SHOP: { iconName: "ShoppingBag", label: { en: "Shop", uk: "Крамниця" } },
};
