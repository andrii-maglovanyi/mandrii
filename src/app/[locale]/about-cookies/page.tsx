"use client";

import { useLocale } from "next-intl";

import { MixpanelTracker } from "~/components/layout";

export default function AboutCookiesPage() {
  const locale = useLocale();
  const isEnglish = locale === "en";

  return (
    <>
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{isEnglish ? "What is a cookie?" : "Що таке cookies?"}</h1>
        <p>
          🍪 <strong>{isEnglish ? "A cookie" : "Cookie"}</strong>{" "}
          {isEnglish
            ? "is a tiny file stored on your computer or phone. It contains the website address and some data that your browser sends back to that website every time you visit it. Cookies are usually harmless and helpful and do not contain personal information or anything dangerous."
            : "- це крихітний файл, який зберігається на твоєму комп'ютері або телефоні. Він містить адресу вебсайту та деякі дані, які твій браузер відправляє назад на цей сайт щоразу, коли ти його відвідуєш. Cookies зазвичай є безпечними та корисними і не містять особистої інформації чи чогось небезпечного."}
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          {isEnglish ? "Why do I use cookies?" : "Чому я використовую cookies?"}
        </h2>
        <p>{isEnglish ? "For a few different purposes:" : "З кількох причин:"}</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            {isEnglish
              ? "To collect statistics with Mixpanel - it helps me understand how many visitors are there and what I'm doing right and wrong."
              : "Для збору статистики через Mixpanel - це допомагає мені зрозуміти, скільки у мене відвідувачів і що я роблю правильно чи неправильно."}
          </li>
          <li>
            {isEnglish
              ? "So far this is the only usage of cookies on this website. 🤔"
              : "Поки що це єдине використання cookies на цьому сайті. 🤔"}
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">
          {isEnglish
            ? "What if you don't want to use cookies?"
            : "Що робити, якщо ти не хочеш використовувати cookies?"}
        </h2>
        <p>
          {isEnglish
            ? "You can disable them in your browser's security settings. It is important to understand that you must apply the settings in all browsers you use (on your computer and your phone). If you decide to disable cookies, keep in mind that some features will no longer be available to you or may work unpredictably."
            : "Ти можеш вимкнути їх у налаштуваннях безпеки твого браузера. Важливо розуміти, що ці налаштування потрібно застосувати у всіх браузерах, які ти використовуєш (на комп'ютері та телефоні). Якщо ти вирішиш вимкнути cookies, май на увазі, що деякі функції можуть стати недоступними або працювати некоректно."}
        </p>
      </section>
      <MixpanelTracker event="Viewed About Cookies Page" />
    </>
  );
}
