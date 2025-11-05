import { IconName } from "./icons/icons";
import { UrlHelper } from "./url-helper";

const countries = {
  es: {
    label: {
      en: "Spain",
      uk: "Іспанія",
    },
  },
  ge: {
    label: {
      en: "Georgia",
      uk: "Грузія",
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
  ACCOMMODATION: { iconName: "BedDouble", label: { en: "Accommodation", uk: "Житло" } },
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

const eventTypes: Record<
  string,
  {
    iconName: IconName;
    label: {
      en: string;
      uk: string;
    };
  }
> = {
  CELEBRATION: { iconName: "PartyPopper", label: { en: "Celebration", uk: "Свято" } },
  CHARITY: { iconName: "Gift", label: { en: "Charity", uk: "Благодійність" } },
  CONCERT: { iconName: "Music", label: { en: "Concert", uk: "Концерт" } },
  CONFERENCE: { iconName: "Building", label: { en: "Conference", uk: "Конференція" } },
  EXHIBITION: { iconName: "Palette", label: { en: "Exhibition", uk: "Виставка" } },
  FESTIVAL: { iconName: "CalendarHeart", label: { en: "Festival", uk: "Фестиваль" } },
  GATHERING: { iconName: "Users", label: { en: "Gathering", uk: "Зустріч" } },
  OTHER: { iconName: "Globe", label: { en: "Other", uk: "Інше" } },
  SCREENING: { iconName: "Clapperboard", label: { en: "Screening", uk: "Показ" } },
  SPORTS: { iconName: "Trophy", label: { en: "Sports", uk: "Спорт" } },
  THEATER: { iconName: "GalleryHorizontal", label: { en: "Theater", uk: "Театр" } },
  WORKSHOP: { iconName: "GraduationCap", label: { en: "Workshop", uk: "Майстер-клас" } },
};

const priceTypes: Record<
  "DONATION" | "FREE" | "PAID" | "SUGGESTED_DONATION" | "UNKNOWN",
  {
    label: {
      en: string;
      uk: string;
    };
  }
> = {
  DONATION: { label: { en: "Donation", uk: "Донат" } },
  FREE: { label: { en: "Free", uk: "Безкоштовно" } },
  PAID: { label: { en: "Paid", uk: "Платно" } },
  SUGGESTED_DONATION: { label: { en: "Suggested Donation", uk: "Рекомендований донат" } },
  UNKNOWN: { label: { en: "Price TBD", uk: "Ціна договірна" } },
};

export const constants = {
  audienceId: "afdc9356-46c0-42d3-8c73-83e271c96017",
  baseUrl: UrlHelper.getBaseUrl(),
  categories,
  eventTypes,
  fromEmail: (locale = "en") =>
    `${locale === "en" ? "Mandrii" : "Мандрій"} <hello@${UrlHelper.getProductionHostname()}>`,
  london_coordinates: {
    lat: 51.509865,
    lng: -0.118092,
  },
  priceTypes,
  vercelBlobStorageUrl: "https://yiiprxif648vopwe.public.blob.vercel-storage.com",
  whitelisted_countries: countries,
};
