import { Locale } from "~/types";

const postCategories = {
  "advice-and-practical-notes": {
    name: {
      en: "Advice & Practical Notes",
      uk: "Поради та практичні нотатки",
    },
  },
  "books-and-ideas": {
    name: {
      en: "Books & Ideas",
      uk: "Книги та ідеї",
    },
  },
  "collections-and-curations": {
    name: {
      en: "Collections & Curations",
      uk: "Добірки та огляди",
    },
  },
  "creativity-and-projects": {
    name: {
      en: "Creativity & Projects",
      uk: "Творчість та проєкти",
    },
  },
  "culture-and-society": {
    name: {
      en: "Culture & Society",
      uk: "Культура та суспільство",
    },
  },
  "food-and-daily-pleasures": {
    name: {
      en: "Food & Daily Pleasures",
      uk: "Їжа та щоденні радощі",
    },
  },
  "history-and-heritage": {
    name: {
      en: "History & Heritage",
      uk: "Історія та спадщина",
    },
  },
  "humour-and-irony": {
    name: {
      en: "Humour & Irony",
      uk: "Гумор та іронія",
    },
  },
  "life-and-reflections": {
    name: {
      en: "Life & Reflections",
      uk: "Життя та роздуми",
    },
  },
  "politics-and-public-life": {
    name: {
      en: "Politics & Public Life",
      uk: "Політика та суспільне життя",
    },
  },
  "tech-and-future": {
    name: {
      en: "Tech & Future",
      uk: "Технології та майбутнє",
    },
  },
  "travel-and-places": {
    name: {
      en: "Travel & Places",
      uk: "Подорожі та місця",
    },
  },
};

export type CategorySlug = keyof typeof postCategories;

export const getCategoryName = (slug: CategorySlug | undefined, locale: Locale) => {
  if (!slug) {
    return null;
  }
  return postCategories[slug]?.name[locale] || slug;
};
