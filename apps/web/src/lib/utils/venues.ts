import { Venue_Category_Enum } from "~/types";

export const hasOperatingHours = (category?: Venue_Category_Enum) =>
  category &&
  [
    Venue_Category_Enum.BeautySalon,
    Venue_Category_Enum.Cafe,
    Venue_Category_Enum.CulturalCentre,
    Venue_Category_Enum.GroceryStore,
    Venue_Category_Enum.LegalService,
    Venue_Category_Enum.Library,
    Venue_Category_Enum.Medical,
    Venue_Category_Enum.Restaurant,
    Venue_Category_Enum.School,
    Venue_Category_Enum.Shop,
  ].includes(category);
