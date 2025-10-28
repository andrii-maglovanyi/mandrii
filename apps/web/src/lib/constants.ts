import { IconName } from "./icons/icons";
import { UrlHelper } from "./url-helper";

const countries = {
  ge: {
    label: {
      en: "Germany",
      uk: "Німеччина",
    },
  },
  nl: {
    label: {
      en: "Netherlands",
      uk: "Нідерланди",
    },
  },
  pl: {
    label: {
      en: "Poland",
      uk: "Польща",
    },
  },
  uk: {
    label: {
      en: "United Kingdom",
      uk: "Велика Британія",
    },
  },
};

const categories: Record<
  string,
  {
    iconName: IconName;
    label: {
      en: string;
      uk: string;
    };
  }
> = {
  BEAUTY_SALON: { iconName: "Wand2", label: { en: "Beauty salon", uk: "Салон краси" } },
  CAFE: { iconName: "Coffee", label: { en: "Cafe", uk: "Кав'ярня" } },
  CATERING: { iconName: "ChefHat", label: { en: "Catering", uk: "Кейтеринг" } },
  CHURCH: { iconName: "Church", label: { en: "Church", uk: "Церква" } },
  CLUB: { iconName: "Music", label: { en: "Club", uk: "Клуб" } },
  CULTURAL_CENTRE: { iconName: "GalleryHorizontal", label: { en: "Cultural centre", uk: "Культурний центр" } },
  DENTAL_CLINIC: { iconName: "Hospital", label: { en: "Dental clinic", uk: "Стоматологія" } },
  GROCERY_STORE: { iconName: "ShoppingCart", label: { en: "Grocery store", uk: "Продуктовий магазин" } },
  LIBRARY: { iconName: "Book", label: { en: "Library", uk: "Бібліотека" } },
  ORGANIZATION: { iconName: "Building", label: { en: "Organization", uk: "Організація" } },
  RESTAURANT: { iconName: "Utensils", label: { en: "Restaurant", uk: "Ресторан" } },
  SCHOOL: { iconName: "GraduationCap", label: { en: "School", uk: "Школа" } },
};

export const constants = {
  audienceId: "afdc9356-46c0-42d3-8c73-83e271c96017",
  baseUrl: UrlHelper.getBaseUrl(),
  categories,
  fromEmail: (locale = "en") =>
    `${locale === "en" ? "Mandrii" : "Мандрій"} <hello@${UrlHelper.getProductionHostname()}>`,
  london_coordinates: {
    lat: 51.509865,
    lng: -0.118092,
  },
  vercelBlobStorageUrl: "https://yiiprxif648vopwe.public.blob.vercel-storage.com",
  whitelisted_countries: countries,
};
