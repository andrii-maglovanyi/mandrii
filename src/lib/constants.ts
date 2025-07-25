import { UrlHelper } from "./url-helper";

export const constants = {
  audienceId: "afdc9356-46c0-42d3-8c73-83e271c96017",
  baseUrl: UrlHelper.getBaseUrl(),
  fromEmail: (locale = "en") =>
    `${locale === "en" ? "Mandrii" : "Мандрій"} <no-reply@${UrlHelper.getHostname()}>`,
};
