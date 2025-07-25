"use client";

import { useLocale } from "next-intl";

import { MixpanelTracker } from "~/components/layout";

export default function TheIdeaPage() {
  const locale = useLocale();
  const isEnglish = locale === "en";

  return (
    <>
      <header className="space-y-2">
        <p>
          {isEnglish
            ? `This is a space where I share stories, thoughts, and discoveries 
I find important - or just plain interesting - for the Ukrainian community. 
Whether you're in London, Amsterdam, Warsaw, or on a bus somewhere in between, 
you're welcome here.`
            : `Це простір, де я ділюся історіями, думками та знахідками, які 
вважаю важливими і просто цікавими для української спільноти - незалежно від 
того, де ти зараз: у Лондоні, Амстердамі, Варшаві чи в автобусі між ними.`}
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          {isEnglish ? "What's the idea?" : "У чому ідея?"}
        </h2>
        <p>
          {isEnglish
            ? `I write about travel and discovery, history, culture, social 
change, and also share news and real-life stories from countries where 
Ukrainians live - to help us stay connected and share experiences, no matter 
where we are.`
            : `Я пишу про подорожі й відкриття, історію, культуру, суспільні 
зміни й трансформації, а також новини й контексти життя 
українців у різних країнах, щоб ми могли залишатися на зв'язку та ділитися 
досвідом, де б не були.`}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          {isEnglish ? "Why does it matter?" : "Навіщо це потрібно?"}
        </h2>
        <p>
          {isEnglish
            ? `Ukrainian culture, language, and identity - all of it is under 
threat today. In times like these, it's important to stay together, share ideas, 
support one another, and remember: we're not just random people in line at the 
checkout in Aldi. We're a community.`
            : `Українська культура, мова, ідентичність - усе це сьогодні під 
загрозою. У такі моменти важливо залишатися разом, ділитися  ідеями, 
підтримувати одне одного і пам'ятати, що ми - не випадкові люди в черзі до каси 
у АТБ. Ми - спільнота.`}
        </p>
        <p>
          {isEnglish
            ? `This site is a small but warm hub of for ideas and discussion, 
collaboration and  inspiration as well as meeting others and feeling like you 
belong.`
            : `Цей сайт є маленьким, але теплим осередком для думок і дискусій, 
для співпраці і натхнення, а також для знайомств і відчуття приналежності.`}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          {isEnglish
            ? "Discover Ukrainian places"
            : "Відкривай українське поруч"}
        </h2>
        <p>
          {isEnglish
            ? `Looking for a taste of home, a familiar word, or a playlist of 
Ukrainian podcasts? Want to support fellow Ukrainians or simply find where to 
get a proper bowl of borscht?`
            : `Шукаєш смак рідного дому, знайоме слово чи плейлист українських 
подкастів?
Хочеш підтримати своїх або просто знайти, де продають нормальний борщ?`}
        </p>
        <p>
          {isEnglish
            ? `This site includes a map of Ukrainian places and events across 
Europe, along with helpful tips, trusted contacts, and inspiring initiatives.`
            : `Тут тобі допоможе мапа українських місць і подій по Європі.
А ще - поради, добрі контакти й цікаві ініціативи.`}
        </p>
        <ul className="mt-8 list-inside list-disc space-y-2">
          <li>
            {isEnglish
              ? "Explore Ukrainian places across Europe - from borscht to bookshelves, from coffee to concerts"
              : "Досліджуй українські місця по Європі - від борщу до книжкової полиці, від кави до концертів"}
          </li>
          <li>
            {isEnglish
              ? "Support your own - a kind word and a cheesecake latte go a long way"
              : "Підтримуй своїх - добрим словом і латте з сирником"}
          </li>
          <li>
            {isEnglish
              ? "Stay informed and share what you believe matters, just like grandma used to share her jam"
              : "Будь у курсі - ділись тим, що вважаєш важливим, як бабуся колись ділилась варенням"}
          </li>
          <li>
            {isEnglish
              ? "Send the link to a friend. Or your mom. Or that neighbour from Sheffield living in Kyiv - let them think you're in the know. Because you are"
              : "Кинь лінк другу. Або мамі. Або сусіду з Запоріжжя в Лондоні - хай думають, що ти в темі. Бо ти в темі"}
          </li>
          <li>
            {isEnglish
              ? "And hey - don't get lost. We're in this together 💛💙"
              : "І головне - не губись. Ми разом 💛💙"}
          </li>
        </ul>
      </section>
      <MixpanelTracker event="Viewed The Idea Page" />
    </>
  );
}
