export type SiteSettingsRecord = {
  headline: string;
  tagline: string;
  mission: string;
  email: string;
  discordUrl: string;
  instagramHandle: string;
  calendarFeedUrl: string;
  stats: {
    members: number;
    events: number;
    partners: number;
    newsletter: string;
  };
};

export const fallbackSiteSettings: SiteSettingsRecord = {
  headline: "Stanford AI Club.",
  tagline: "A community building, learning, and arguing about AI together.",
  mission:
    "Founded in 2022. Open to all Stanford students. We host weekly events, run reading groups, and ship side projects together.",
  email: "hello@aiclub",
  discordUrl: "discord.gg/aiclub",
  instagramHandle: "@stanford.aiclub",
  calendarFeedUrl: "ical://...",
  stats: {
    members: 240,
    events: 38,
    partners: 12,
    newsletter: "1.2k",
  },
};
