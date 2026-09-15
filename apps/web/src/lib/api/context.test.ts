import { beforeEach, expect, it, vi } from "vitest";

import { Locale } from "~/types";
import { User_Status_Enum } from "~/types/graphql.generated";

import { getApiContext } from "./context";

const { auth, findById, getI18n } = vi.hoisted(() => ({ auth: vi.fn(), findById: vi.fn(), getI18n: vi.fn() }));
vi.mock("../auth", () => ({ auth }));
vi.mock("../models/user", () => ({
  UserModel: class {
    findById = findById;
  },
}));
vi.mock("~/i18n/getI18n", () => ({ getI18n }));
beforeEach(() => vi.resetAllMocks());

it.each([
  ["", Locale.EN],
  ["?locale=invalid", Locale.EN],
  ["?locale=uk", Locale.UK],
])("resolves locale for %s without loading authentication or translations", async (search, locale) => {
  expect(await getApiContext(new Request(`https://example.test/api${search}`))).toEqual({ locale });
  expect(auth).not.toHaveBeenCalled();
  expect(getI18n).not.toHaveBeenCalled();
});

it("passes the default locale to translations", async () => {
  const translate = vi.fn();
  getI18n.mockResolvedValue(translate);
  expect(await getApiContext(new Request("https://example.test/api"), { withI18n: true })).toEqual({
    i18n: translate,
    locale: Locale.EN,
  });
  expect(getI18n).toHaveBeenCalledWith({ locale: Locale.EN });
});

it("rejects missing authentication without a user lookup", async () => {
  auth.mockResolvedValue(null);
  await expect(getApiContext(new Request("https://example.test/api"), { withAuth: true })).rejects.toMatchObject({
    statusCode: 401,
  });
  expect(findById).not.toHaveBeenCalled();
});

it("rejects a stale session for an inactive account", async () => {
  auth.mockResolvedValue({ accessToken: "token", user: { id: "user" } });
  findById.mockResolvedValue({ id: "user", status: User_Status_Enum.Inactive });
  await expect(getApiContext(new Request("https://example.test/api"), { withAuth: true })).rejects.toMatchObject({
    statusCode: 403,
  });
});

it("uses current database account data for authenticated requests", async () => {
  auth.mockResolvedValue({ accessToken: "token", user: { id: "user", name: "Old name" } });
  const user = { id: "user", name: "Current name", status: User_Status_Enum.Active };
  findById.mockResolvedValue(user);
  expect(await getApiContext(new Request("https://example.test/api"), { withAuth: true })).toEqual({
    locale: Locale.EN,
    session: { accessToken: "token", user },
  });
  expect(findById).toHaveBeenCalledOnce();
});
