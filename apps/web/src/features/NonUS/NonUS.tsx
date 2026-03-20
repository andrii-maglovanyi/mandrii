"use client";

import { AppWindow, CreditCard, Plug, Send, Users } from "lucide-react";
import React from "react";

import { AccordionItem, MultipleAccordion, Table } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

export const NonUS = () => {
  const i18n = useI18n();

  const COLUMNS = [
    {
      dataIndex: "name",
      key: "name",
      title: i18n("Service/Product"),
    },
    {
      dataIndex: "usDefault",
      key: "usDefault",
      title: i18n("Common US"),
    },
    {
      dataIndex: "recommended",
      key: "recommended",
      title: i18n("Recommended Alternatives"),
    },
  ];

  const data = {
    banking: {
      icon: <CreditCard size={20} />,
      items: [
        {
          name: "Banking",
          notRecommended: "Unregulated financial services",
          recommended: "Local European banks, N26 (Germany), Revolut (UK), Bunq (Netherlands)",
          untested: "Various digital-only banks",
          usDefault: "Chase, Bank of America, Citibank",
        },
        {
          name: "Payment Processing",
          notRecommended: "Unverified payment processors",
          recommended: "Adyen (Netherlands), Klarna (Sweden), Mollie (Netherlands)",
          untested: "Alipay, WeChat Pay",
          usDefault: "PayPal, Stripe, Square",
        },
        {
          name: "Credit Cards",
          notRecommended: "Cards with predatory terms",
          recommended: "Local bank cards, Maestro (Europe), V PAY (Europe)",
          untested: "UnionPay (China)",
          usDefault: "Visa, Mastercard, Amex",
        },
        {
          name: "Investment Platform",
          notRecommended: "Unregulated crypto platforms",
          recommended: "Trade Republic (Germany), Scalable Capital (Germany), Degiro (Netherlands)",
          untested: "Various Asian platforms",
          usDefault: "Robinhood, E*TRADE, Charles Schwab",
        },
      ],
      title: "Banking & Finance",
    },
    electronics: {
      icon: <Plug size={20} />,
      items: [
        {
          name: "iPhone",
          notRecommended: "Various no-name brands",
          recommended: "Samsung (South Korea), Fairphone (Netherlands)",
          untested: "Huawei, Xiaomi, Oppo",
          usDefault: "Apple iPhone",
        },
        {
          name: "Laptop",
          notRecommended: "Generic unbranded laptops",
          recommended: "Framework (upgradeable), ASUS (Taiwan), Acer (Taiwan)",
          untested: "Lenovo ThinkPad (Chinese ownership)",
          usDefault: "MacBook, Dell, HP",
        },
        {
          name: "Tablet",
          notRecommended: "Low-quality Android tablets",
          recommended: "Samsung Galaxy Tab (South Korea)",
          untested: "Huawei MatePad",
          usDefault: "iPad, Microsoft Surface",
        },
        {
          name: "Smartwatch",
          notRecommended: "Unknown brand fitness trackers",
          recommended: "Garmin (Switzerland), Withings (France), Samsung Galaxy Watch",
          untested: "Amazfit, Huawei Watch",
          usDefault: "Apple Watch, Fitbit",
        },
      ],
      title: "Electronics",
    },
    socialMedia: {
      icon: <Users size={20} />,
      items: [
        {
          name: "Social Network",
          notRecommended: "Platforms with major security issues",
          recommended: "Mastodon (decentralized, open source), Diaspora (decentralized)",
          untested: "VK, Weibo",
          usDefault: "Facebook, Instagram, X/Twitter",
        },
        {
          name: "Messaging",
          notRecommended: "Unencrypted messaging apps",
          recommended: "Signal (privacy-focused, US-based nonprofit), Threema (Switzerland), Wire (Switzerland)",
          untested: "Telegram (Dubai-based), WeChat",
          usDefault: "WhatsApp, Facebook Messenger, iMessage",
        },
        {
          name: "Professional Network",
          notRecommended: "Fake professional networking sites",
          recommended: "Xing (Germany, DACH-focused)",
          untested: "Xing (more popular in DACH region)",
          usDefault: "LinkedIn",
        },
        {
          name: "Video Platform",
          notRecommended: "Sites with copyright violations",
          recommended: "PeerTube (decentralized, open source), Dailymotion (France)",
          untested: "Youku, Bilibili",
          usDefault: "YouTube, Vimeo",
        },
      ],
      title: "Social Media & Communication",
    },
    software: {
      icon: <AppWindow size={20} />,
      items: [
        {
          name: "Operating System",
          notRecommended: "Pirated OS versions",
          recommended: "Linux distributions (Ubuntu, Debian, Fedora - open source)",
          untested: "Various Chinese Linux distros",
          usDefault: "Windows, macOS",
        },
        {
          name: "Office Suite",
          notRecommended: "Cracked office software",
          recommended: "LibreOffice (open source), OnlyOffice (Latvia), ONLYOFFICE Docs",
          untested: "WPS Office",
          usDefault: "Microsoft Office, Google Workspace",
        },
        {
          name: "VPN",
          notRecommended: "VPNs with no-logs policy violations",
          recommended: "Mullvad (Sweden), ProtonVPN (Switzerland), IVPN (Gibraltar)",
          untested: "Free VPNs (often data harvesters)",
          usDefault: "NordVPN, ExpressVPN",
        },
        {
          name: "Password Manager",
          notRecommended: "Browser-only password storage",
          recommended: "Bitwarden (open source), KeePass (open source), Proton Pass (Switzerland)",
          untested: "Various free password managers",
          usDefault: "1Password, LastPass",
        },
        {
          name: "Web Browser",
          notRecommended: "Browsers with adware",
          recommended: "Firefox (Mozilla, open source), Brave (privacy-focused), Vivaldi (Norway)",
          untested: "Various Chromium forks",
          usDefault: "Chrome, Safari, Edge",
        },
      ],
      title: "Software & Productivity",
    },
    webServices: {
      icon: <Send size={20} />,
      items: [
        {
          name: "Email",
          notRecommended: "Temporary email services for primary use",
          recommended: "ProtonMail (Switzerland), Tutanota (Germany), Mailbox.org (Germany)",
          untested: "Mail.ru, Yandex Mail",
          usDefault: "Gmail, Outlook, Yahoo",
        },
        {
          name: "Search Engine",
          notRecommended: "Ad-heavy search engines",
          recommended: "DuckDuckGo (some US ties, privacy-focused), Qwant (France), Ecosia (Germany)",
          untested: "Baidu, Yandex",
          usDefault: "Google, Bing",
        },
        {
          name: "Cloud Storage",
          notRecommended: "Unknown providers with unclear privacy policies",
          recommended: "pCloud (Switzerland), Tresorit (Switzerland), IONOS (Germany)",
          untested: "Baidu Cloud",
          usDefault: "Google Drive, Dropbox, OneDrive",
        },
        {
          name: "Video Streaming",
          notRecommended: "Illegal streaming sites",
          recommended: "Arte (France/Germany), local broadcasters (BBC iPlayer, ARD, etc.)",
          untested: "Various regional platforms",
          usDefault: "Netflix, Hulu, Disney+",
        },
        {
          name: "Music Streaming",
          notRecommended: "Music piracy sites",
          recommended: "Deezer (France), Tidal (Norway), Qobuz (France)",
          untested: "QQ Music, NetEase Music",
          usDefault: "Spotify (Swedish but US-listed), Apple Music, Pandora",
        },
        {
          name: "Video Calls",
          notRecommended: "Unencrypted or sketchy platforms",
          recommended: "Jitsi Meet (open source), Wire (Switzerland), Element (UK, Matrix protocol)",
          untested: "WeChat, DingTalk",
          usDefault: "Zoom, Google Meet, Skype",
        },
      ],
      title: "Web Services",
    },
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-4 text-4xl font-bold text-gray-800">🇪🇺 US Product & Service Alternatives</h1>
          <p className="mb-4 text-lg text-gray-600">
            Find European and non-US alternatives to popular American products and services. Support local businesses
            and diversify your digital ecosystem.
          </p>
          <div className="rounded border-l-4 border-blue-500 bg-blue-50 p-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This guide focuses on alternatives with an emphasis on European options.
              Recommended indicates products that are generally well-regarded and have clear European or non-US origins.
              Always research products based on your specific needs and privacy requirements.
            </p>
          </div>
        </div>

        <MultipleAccordion>
          {Object.entries(data).map(([key, category]) => (
            <AccordionItem icon={category.icon} key={key} title={category.title}>
              <Table
                columns={COLUMNS}
                dataSource={data[key as keyof typeof data].items}
                emptyStateBodyMessage={i18n(
                  "No events added yet. Click the button above to add the first one and start managing your events!",
                )}
                emptyStateHeading={i18n("No events added yet")}
                rowKey="name"
              />
            </AccordionItem>
          ))}
        </MultipleAccordion>

        <div className={`
          mt-8 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-6
        `}>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Disclaimer</h3>
          <p className="text-sm text-gray-700">
            This list is for informational purposes. Company origins and ownership can change. Some European companies
            may have US investors or partnerships. Always verify current information and choose products based on your
            specific needs, privacy requirements, and values.
          </p>
        </div>
      </div>
    </>
  );
};
