"use client";

import { AppWindow, AtSign, CreditCard, Plug, Send, Users } from "lucide-react";
import React, { useState } from "react";
import { AccordionItem, MultipleAccordion, Table } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { getIcon } from "~/lib/icons/icons";

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
    electronics: {
      title: "Electronics",
      icon: <Plug size={20} />,
      items: [
        {
          name: "iPhone",
          usDefault: "Apple iPhone",
          untested: "Huawei, Xiaomi, Oppo",
          notRecommended: "Various no-name brands",
          recommended: "Samsung (South Korea), Fairphone (Netherlands)",
        },
        {
          name: "Laptop",
          usDefault: "MacBook, Dell, HP",
          untested: "Lenovo ThinkPad (Chinese ownership)",
          notRecommended: "Generic unbranded laptops",
          recommended: "Framework (upgradeable), ASUS (Taiwan), Acer (Taiwan)",
        },
        {
          name: "Tablet",
          usDefault: "iPad, Microsoft Surface",
          untested: "Huawei MatePad",
          notRecommended: "Low-quality Android tablets",
          recommended: "Samsung Galaxy Tab (South Korea)",
        },
        {
          name: "Smartwatch",
          usDefault: "Apple Watch, Fitbit",
          untested: "Amazfit, Huawei Watch",
          notRecommended: "Unknown brand fitness trackers",
          recommended: "Garmin (Switzerland), Withings (France), Samsung Galaxy Watch",
        },
      ],
    },
    webServices: {
      title: "Web Services",
      icon: <Send size={20} />,
      items: [
        {
          name: "Email",
          usDefault: "Gmail, Outlook, Yahoo",
          untested: "Mail.ru, Yandex Mail",
          notRecommended: "Temporary email services for primary use",
          recommended: "ProtonMail (Switzerland), Tutanota (Germany), Mailbox.org (Germany)",
        },
        {
          name: "Search Engine",
          usDefault: "Google, Bing",
          untested: "Baidu, Yandex",
          notRecommended: "Ad-heavy search engines",
          recommended: "DuckDuckGo (some US ties, privacy-focused), Qwant (France), Ecosia (Germany)",
        },
        {
          name: "Cloud Storage",
          usDefault: "Google Drive, Dropbox, OneDrive",
          untested: "Baidu Cloud",
          notRecommended: "Unknown providers with unclear privacy policies",
          recommended: "pCloud (Switzerland), Tresorit (Switzerland), IONOS (Germany)",
        },
        {
          name: "Video Streaming",
          usDefault: "Netflix, Hulu, Disney+",
          untested: "Various regional platforms",
          notRecommended: "Illegal streaming sites",
          recommended: "Arte (France/Germany), local broadcasters (BBC iPlayer, ARD, etc.)",
        },
        {
          name: "Music Streaming",
          usDefault: "Spotify (Swedish but US-listed), Apple Music, Pandora",
          untested: "QQ Music, NetEase Music",
          notRecommended: "Music piracy sites",
          recommended: "Deezer (France), Tidal (Norway), Qobuz (France)",
        },
        {
          name: "Video Calls",
          usDefault: "Zoom, Google Meet, Skype",
          untested: "WeChat, DingTalk",
          notRecommended: "Unencrypted or sketchy platforms",
          recommended: "Jitsi Meet (open source), Wire (Switzerland), Element (UK, Matrix protocol)",
        },
      ],
    },
    banking: {
      title: "Banking & Finance",
      icon: <CreditCard size={20} />,
      items: [
        {
          name: "Banking",
          usDefault: "Chase, Bank of America, Citibank",
          untested: "Various digital-only banks",
          notRecommended: "Unregulated financial services",
          recommended: "Local European banks, N26 (Germany), Revolut (UK), Bunq (Netherlands)",
        },
        {
          name: "Payment Processing",
          usDefault: "PayPal, Stripe, Square",
          untested: "Alipay, WeChat Pay",
          notRecommended: "Unverified payment processors",
          recommended: "Adyen (Netherlands), Klarna (Sweden), Mollie (Netherlands)",
        },
        {
          name: "Credit Cards",
          usDefault: "Visa, Mastercard, Amex",
          untested: "UnionPay (China)",
          notRecommended: "Cards with predatory terms",
          recommended: "Local bank cards, Maestro (Europe), V PAY (Europe)",
        },
        {
          name: "Investment Platform",
          usDefault: "Robinhood, E*TRADE, Charles Schwab",
          untested: "Various Asian platforms",
          notRecommended: "Unregulated crypto platforms",
          recommended: "Trade Republic (Germany), Scalable Capital (Germany), Degiro (Netherlands)",
        },
      ],
    },
    socialMedia: {
      title: "Social Media & Communication",
      icon: <Users size={20} />,
      items: [
        {
          name: "Social Network",
          usDefault: "Facebook, Instagram, X/Twitter",
          untested: "VK, Weibo",
          notRecommended: "Platforms with major security issues",
          recommended: "Mastodon (decentralized, open source), Diaspora (decentralized)",
        },
        {
          name: "Messaging",
          usDefault: "WhatsApp, Facebook Messenger, iMessage",
          untested: "Telegram (Dubai-based), WeChat",
          notRecommended: "Unencrypted messaging apps",
          recommended: "Signal (privacy-focused, US-based nonprofit), Threema (Switzerland), Wire (Switzerland)",
        },
        {
          name: "Professional Network",
          usDefault: "LinkedIn",
          untested: "Xing (more popular in DACH region)",
          notRecommended: "Fake professional networking sites",
          recommended: "Xing (Germany, DACH-focused)",
        },
        {
          name: "Video Platform",
          usDefault: "YouTube, Vimeo",
          untested: "Youku, Bilibili",
          notRecommended: "Sites with copyright violations",
          recommended: "PeerTube (decentralized, open source), Dailymotion (France)",
        },
      ],
    },
    software: {
      icon: <AppWindow size={20} />,
      title: "Software & Productivity",
      items: [
        {
          name: "Operating System",
          usDefault: "Windows, macOS",
          untested: "Various Chinese Linux distros",
          notRecommended: "Pirated OS versions",
          recommended: "Linux distributions (Ubuntu, Debian, Fedora - open source)",
        },
        {
          name: "Office Suite",
          usDefault: "Microsoft Office, Google Workspace",
          untested: "WPS Office",
          notRecommended: "Cracked office software",
          recommended: "LibreOffice (open source), OnlyOffice (Latvia), ONLYOFFICE Docs",
        },
        {
          name: "VPN",
          usDefault: "NordVPN, ExpressVPN",
          untested: "Free VPNs (often data harvesters)",
          notRecommended: "VPNs with no-logs policy violations",
          recommended: "Mullvad (Sweden), ProtonVPN (Switzerland), IVPN (Gibraltar)",
        },
        {
          name: "Password Manager",
          usDefault: "1Password, LastPass",
          untested: "Various free password managers",
          notRecommended: "Browser-only password storage",
          recommended: "Bitwarden (open source), KeePass (open source), Proton Pass (Switzerland)",
        },
        {
          name: "Web Browser",
          usDefault: "Chrome, Safari, Edge",
          untested: "Various Chromium forks",
          notRecommended: "Browsers with adware",
          recommended: "Firefox (Mozilla, open source), Brave (privacy-focused), Vivaldi (Norway)",
        },
      ],
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
              "Recommended" indicates products that are generally well-regarded and have clear European or non-US
              origins. Always research products based on your specific needs and privacy requirements.
            </p>
          </div>
        </div>

        <MultipleAccordion>
          {Object.entries(data).map(([key, category]) => (
            <AccordionItem key={key} icon={category.icon} title={category.title}>
              <Table
                columns={COLUMNS}
                dataSource={data[key].items}
                emptyStateBodyMessage={i18n(
                  "No events added yet. Click the button above to add the first one and start managing your events!",
                )}
                emptyStateHeading={i18n("No events added yet")}
                rowKey="name"
              />
            </AccordionItem>
          ))}
        </MultipleAccordion>

        <div className="mt-8 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Disclaimer</h3>
          <p className="text-sm text-gray-700">
            This list is for informational purposes. Company origins and ownership can change. Some "European" companies
            may have US investors or partnerships. Always verify current information and choose products based on your
            specific needs, privacy requirements, and values.
          </p>
        </div>
      </div>
    </>
  );
};
