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

const weekdays = [
  {
    full: {
      en: "Monday" as const,
      uk: "Понеділок",
    },
    short: {
      en: "Mon",
      uk: "Пн",
    },
  },
  {
    full: {
      en: "Tuesday" as const,
      uk: "Вівторок",
    },
    short: {
      en: "Tue",
      uk: "Вт",
    },
  },
  {
    full: {
      en: "Wednesday" as const,
      uk: "Середа",
    },
    short: {
      en: "Wed",
      uk: "Ср",
    },
  },
  {
    full: {
      en: "Thursday" as const,
      uk: "Четвер",
    },
    short: {
      en: "Thu",
      uk: "Чт",
    },
  },
  {
    full: {
      en: "Friday" as const,
      uk: "П'ятниця",
    },
    short: {
      en: "Fri",
      uk: "Пт",
    },
  },
  {
    full: {
      en: "Saturday" as const,
      uk: "Субота",
    },
    short: {
      en: "Sat",
      uk: "Сб",
    },
  },
  {
    full: {
      en: "Sunday" as const,
      uk: "Неділя",
    },
    short: {
      en: "Sun",
      uk: "Нд",
    },
  },
];

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
  DELIVERY: { iconName: "Package", label: { en: "Delivery", uk: "Доставка" } },
  DENTAL_CLINIC: { iconName: "Hospital", label: { en: "Dental clinic", uk: "Стоматологія" } },
  GROCERY_STORE: { iconName: "ShoppingCart", label: { en: "Grocery store", uk: "Продуктовий магазин" } },
  LIBRARY: { iconName: "Book", label: { en: "Library", uk: "Бібліотека" } },
  ORGANIZATION: { iconName: "Building", label: { en: "Organization", uk: "Організація" } },
  RESTAURANT: { iconName: "Utensils", label: { en: "Restaurant", uk: "Ресторан" } },
  SCHOOL: { iconName: "GraduationCap", label: { en: "School", uk: "Школа" } },
  SHOP: { iconName: "ShoppingBag", label: { en: "Shop", uk: "Крамниця" } },
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

const amenityOptions = [
  { icon: "Wifi", label: { en: "WiFi", uk: "WiFi" }, value: "wifi" },
  { icon: "ChefHat", label: { en: "Kitchen", uk: "Кухня" }, value: "kitchen" },
  { icon: "WashingMachine", label: { en: "Washing machine", uk: "Пральна машина" }, value: "washing_machine" },
  { icon: "Wind", label: { en: "Dryer", uk: "Сушарка" }, value: "dryer" },
  { icon: "Snowflake", label: { en: "Air conditioning", uk: "Кондиціонер" }, value: "air_conditioning" },
  { icon: "Flame", label: { en: "Heating", uk: "Опалення" }, value: "heating" },
  { icon: "Car", label: { en: "Parking", uk: "Паркування" }, value: "parking" },
  { icon: "Tv", label: { en: "TV", uk: "Телевізор" }, value: "tv" },
  { icon: "Laptop", label: { en: "Workspace", uk: "Робоче місце" }, value: "workspace" },
  { icon: "Waves", label: { en: "Pool", uk: "Басейн" }, value: "pool" },
  { icon: "Dumbbell", label: { en: "Gym", uk: "Тренажерний зал" }, value: "gym" },
  { icon: "PawPrint", label: { en: "Pet friendly", uk: "Дружній до тварин" }, value: "pet_friendly" },
  {
    icon: "Accessibility",
    label: { en: "Wheelchair accessible", uk: "Доступно для інвалідів" },
    value: "wheelchair_accessible",
  },
] as const;

const beautyServiceOptions = [
  { label: { en: "Haircut", uk: "Стрижка" }, value: "haircut" },
  { label: { en: "Hair coloring", uk: "Фарбування волосся" }, value: "coloring" },
  { label: { en: "Hair styling", uk: "Стилізація волосся" }, value: "styling" },
  { label: { en: "Manicure", uk: "Манікюр" }, value: "manicure" },
  { label: { en: "Pedicure", uk: "Педикюр" }, value: "pedicure" },
  { label: { en: "Massage", uk: "Масаж" }, value: "massage" },
  { label: { en: "Facial treatment", uk: "Догляд за обличчям" }, value: "facial" },
  { label: { en: "Waxing", uk: "Депіляція воском" }, value: "waxing" },
  { label: { en: "Makeup application", uk: "Макіяж" }, value: "makeup" },
] as const;

const cuisineOptions = [
  { label: { en: "Ukrainian", uk: "Українська" }, value: "ukrainian" },
  { label: { en: "Georgian", uk: "Грузинська" }, value: "georgian" },
  { label: { en: "European", uk: "Європейська" }, value: "european" },
  { label: { en: "Asian", uk: "Азіатська" }, value: "asian" },
  { label: { en: "Italian", uk: "Італійська" }, value: "italian" },
  { label: { en: "French", uk: "Французька" }, value: "french" },
  { label: { en: "Mexican", uk: "Мексиканська" }, value: "mexican" },
  { label: { en: "Japanese", uk: "Японська" }, value: "japanese" },
  { label: { en: "Indian", uk: "Індійська" }, value: "indian" },
  { label: { en: "Other", uk: "Інше" }, value: "other" },
];

const priceRangeOptions = [
  { label: { en: "Budget", uk: "Бюджетний" }, value: "budget" },
  { label: { en: "Moderate", uk: "Помірний" }, value: "moderate" },
  { label: { en: "Upscale", uk: "Висококласний" }, value: "upscale" },
  { label: { en: "Fine Dining", uk: "Вишукана кухня" }, value: "fine_dining" },
] as const;

const featureOptions = [
  { label: { en: "Takeaway", uk: "На винос" }, value: "takeaway" },
  { label: { en: "Delivery", uk: "Доставка" }, value: "delivery" },
  { label: { en: "Outdoor seating", uk: "Літній майданчик" }, value: "outdoor_seating" },
  { label: { en: "Reservations required", uk: "Потрібне бронювання" }, value: "reservations_required" },
  { label: { en: "Reservations accepted", uk: "Приймаються бронювання" }, value: "reservations_accepted" },
  { label: { en: "Live sports", uk: "Трансляція спорту" }, value: "live_sports" },
  { label: { en: "Live music", uk: "Жива музика" }, value: "live_music" },
  { label: { en: "Kids menu", uk: "Дитяче меню" }, value: "kids_menu" },
  { label: { en: "Vegetarian options", uk: "Вегетаріанські страви" }, value: "vegetarian_options" },
  { label: { en: "Vegan options", uk: "Веганські страви" }, value: "vegan_options" },
  { label: { en: "Gluten-free options", uk: "Безглютенові страви" }, value: "gluten_free_options" },
] as const;

const curriculumOptions = [
  {
    label: {
      en: "Ukrainian Language (Speaking & Writing)",
      uk: "Українська мова (розмовна та писемна)",
    },
    value: "ukrainian_language",
  },
  {
    label: {
      en: "Ukrainian Studies (Culture, Traditions, Geography, History)",
      uk: "Українознавство (культура, традиції, географія, історія)",
    },
    value: "ukrainian_studies",
  },
  {
    label: {
      en: "Integrated Language & Culture",
      uk: "Інтегрований курс мови та культури",
    },
    value: "integrated",
  },
  { label: { en: "Arts (Music, Drawing, etc)", uk: "Мистецтво (музика, малювання, тощо)" }, value: "arts" },
  {
    label: {
      en: "STEM (Coding, Math, Physics, etc)",
      uk: "STEM (програмування, математика, фізика, тощо)",
    },
    value: "stem",
  },
  { label: { en: "Sports & Physical Activities", uk: "Спорт та фізичні активності" }, value: "sports" },
  { label: { en: "Cultural Events & Celebrations", uk: "Культурні заходи та свята" }, value: "cultural_events" },
] as const;

const ageGroupOptions = [
  { label: { en: "Early childhood (3-4 years)", uk: "Ранній дитячий вік (3-4 роки)" }, value: "early_childhood" },
  { label: { en: "Preschool (4-6 years)", uk: "Дошкільний вік (4-6 років)" }, value: "preschool" },
  { label: { en: "Early primary (6-8 years)", uk: "Молодші класи (6-8 років)" }, value: "early_primary" },
  { label: { en: "Primary school (8-11 years)", uk: "Початкова школа (8-11 років)" }, value: "primary" },
  { label: { en: "Middle school (11-14 years)", uk: "Середня школа (11-14 років)" }, value: "middle" },
  { label: { en: "High school (14-16 years)", uk: "Старша школа (14-16 років)" }, value: "high_school" },
  { label: { en: "Senior high (16-18 years)", uk: "Випускні класи (16-18 років)" }, value: "senior_high" },
  { label: { en: "Adult education (18+ years)", uk: "Освіта для дорослих (18+ років)" }, value: "adult" },
] as const;

const languageOptions = [
  { label: { en: "Ukrainian", uk: "Українська" }, value: "ukrainian" },
  { label: { en: "English", uk: "Англійська" }, value: "english" },
  { label: { en: "Local language", uk: "Місцева мова" }, value: "local_language" },
  {
    label: { en: "Bilingual (Ukrainian + English)", uk: "Двомовна (українська + англійська)" },
    value: "bilingual_ukr_eng",
  },
  {
    label: { en: "Bilingual (Ukrainian + local)", uk: "Двомовна (українська + місцева)" },
    value: "bilingual_ukr_local",
  },
] as const;

const productCategoryOptions = [
  { label: { en: "Clothing", uk: "Одяг" }, value: "clothing" },
  { label: { en: "Books", uk: "Книги" }, value: "books" },
  { label: { en: "Electronics", uk: "Електроніка" }, value: "electronics" },
  { label: { en: "Groceries", uk: "Продукти харчування" }, value: "groceries" },
  { label: { en: "Gifts", uk: "Подарунки" }, value: "gifts" },
  { label: { en: "Home Goods", uk: "Товари для дому" }, value: "home_goods" },
  { label: { en: "Beauty Products", uk: "Косметика та краса" }, value: "beauty" },
  { label: { en: "Toys", uk: "Іграшки" }, value: "toys" },
  { label: { en: "Sports Equipment", uk: "Спортивне обладнання" }, value: "sports" },
  { label: { en: "Other", uk: "Інше" }, value: "other" },
] as const;

const paymentOptions = [
  { label: { en: "Cash", uk: "Готівка" }, value: "cash" },
  { label: { en: "Card (chip & PIN)", uk: "Картка (чіп і PIN)" }, value: "card" },
  {
    label: { en: "Contactless (card or phone)", uk: "Безконтактна оплата (картка або телефон)" },
    value: "contactless",
  },
  { label: { en: "Bank transfer", uk: "Банківський переказ" }, value: "bank_transfer" },
  { label: { en: "Online payment", uk: "Онлайн-оплата" }, value: "online_payment" },
] as const;

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
  ageGroupOptions,
  amenityOptions,
  audienceId: "afdc9356-46c0-42d3-8c73-83e271c96017",
  baseUrl: UrlHelper.getBaseUrl(),
  beautyServiceOptions,
  categories,
  cuisineOptions,
  curriculumOptions,
  eventTypes,
  featureOptions,
  fromEmail: (locale = "en") =>
    `${locale === "en" ? "Mandrii" : "Мандрій"} <hello@${UrlHelper.getProductionHostname()}>`,
  languageOptions,
  london_coordinates: {
    lat: 51.509865,
    lng: -0.118092,
  },
  paymentOptions,
  priceRangeOptions,
  priceTypes,
  productCategoryOptions,
  vercelBlobStorageUrl: "https://yiiprxif648vopwe.public.blob.vercel-storage.com",
  weekdays,
  whitelisted_countries: countries,
};
