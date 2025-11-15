import { IconName } from "../icons/icons";

export const EVENT_TYPES: Record<
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
