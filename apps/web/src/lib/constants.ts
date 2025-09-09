import { UrlHelper } from "./url-helper";

export const constants = {
  audienceId: "afdc9356-46c0-42d3-8c73-83e271c96017",
  baseUrl: UrlHelper.getBaseUrl(),
  fromEmail: (locale = "en") =>
    `${locale === "en" ? "Mandrii" : "Мандрій"} <hello@${UrlHelper.getProductionHostname()}>`,
  posts: {
    enabledCategories: [
      {
        description:
          "Personal stories, family moments, everyday experiences. Reflections on changes, nostalgia, or cultural contrasts.",
        description_uk:
          "Особисті історії, сімейні моменти, повсякденні переживання. Роздуми про зміни, ностальгію або культурні контрасти.",
        name: "Life & Reflections",
        name_uk: "Життя та роздуми",
      },
      {
        description:
          "Observations about traditions, habits, and social norms. Cross-cultural comparisons and cultural commentary.",
        description_uk:
          "Спостереження про традиції, звички та суспільні норми. Порівняння культур і культурні коментарі.",
        name: "Culture & Society",
        name_uk: "Культура та суспільство",
      },
      {
        description: "Stories from trips, city walks, hidden gems, and impressions of new places.",
        description_uk:
          "Історії з подорожей, прогулянок містом, відкриття прихованих місць та враження від нових локацій.",
        name: "Travel & Places",
        name_uk: "Подорожі та місця",
      },
      {
        description: "Historical curiosities, architecture, and the connections between past and present.",
        description_uk: "Історичні цікавинки, архітектура та зв’язок між минулим і сучасністю.",
        name: "History & Heritage",
        name_uk: "Історія та спадщина",
      },
      {
        description: "Commentary on news, policies, elections, and social debates.",
        description_uk: "Коментарі до новин, політики, виборів та суспільних дискусій.",
        name: "Politics & Public Life",
        name_uk: "Політика та суспільне життя",
      },
      {
        description: "Tips and insights for parents, expats, newcomers, and everyday life hacks.",
        description_uk: "Поради та спостереження для батьків, емігрантів, новоприбулих і повсякденні лайфхаки.",
        name: "Advice & Practical Notes",
        name_uk: "Поради та практичні нотатки",
      },
      {
        description: "Witty takes on everyday absurdities, funny anecdotes, and playful commentary.",
        description_uk: "Дотепні нотатки про щоденні абсурди, смішні історії та іронічні коментарі.",
        name: "Humour & Irony",
        name_uk: "Гумор та іронія",
      },
      {
        description: "Weekly or monthly highlights, top lists, quotes, and curated selections.",
        description_uk: "Щотижневі чи щомісячні підбірки, топ-списки, цитати та тематичні добірки.",
        name: "Collections & Curations",
        name_uk: "Добірки та огляди",
      },
      {
        description: "Reading notes, reflections on books, podcasts, films, and new concepts.",
        description_uk: "Нотатки про прочитане, роздуми про книги, подкасти, фільми та нові ідеї.",
        name: "Books & Ideas",
        name_uk: "Книги та ідеї",
      },
      {
        description: "Personal creative work such as writing, photography, cooking, or other side projects.",
        description_uk: "Особисті творчі роботи: писання, фотографія, кулінарія чи інші проєкти.",
        name: "Creativity & Projects",
        name_uk: "Творчість та проєкти",
      },
      {
        description: "Posts about food, desserts, coffee culture, rituals, and everyday joys.",
        description_uk: "Пости про їжу, десерти, кавову культуру, ритуали та маленькі щоденні радощі.",
        name: "Food & Daily Pleasures",
        name_uk: "Їжа та щоденні радощі",
      },
      {
        description: "Thoughts on technology, AI, digital life, productivity, and future trends.",
        description_uk:
          "Роздуми про технології, штучний інтелект, цифрове життя, продуктивність та тренди майбутнього.",
        name: "Tech & Future",
        name_uk: "Технології та майбутнє",
      },
    ],
  },
  vercelBlobStorageUrl: "https://z9bwg0saanmopyjs.public.blob.vercel-storage.com",
};
