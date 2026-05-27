export type PerkRecord = {
  id: string;
  partnerName: string;
  category: "api" | "compute" | "tools" | "learning";
  offer: string;
  code: string;
  redemptionUrl: string | null;
  expiresAt: string | null;
  memberNotes: string | null;
  status: "active" | "expiring" | "archived";
};

export const fallbackPerks: PerkRecord[] = [
  {
    id: "perk-1",
    partnerName: "Anthropic",
    category: "api",
    offer: "$200 credits",
    code: "AICLUB-AT-200",
    redemptionUrl: "https://anthropic.com",
    expiresAt: "2026-08-01T00:00:00.000Z",
    memberNotes: "One per member.",
    status: "active",
  },
  {
    id: "perk-2",
    partnerName: "Cursor",
    category: "tools",
    offer: "Free Pro · 6mo",
    code: "AICLUB-CURSOR-PRO",
    redemptionUrl: "https://cursor.com",
    expiresAt: "2026-05-01T00:00:00.000Z",
    memberNotes: "Stanford email required.",
    status: "expiring",
  },
];
