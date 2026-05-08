export type EventStatus = "draft" | "published" | "past" | "cancelled";
export type EventType = "talk" | "hack" | "reading" | "social";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  talk: "Fireside Chat",
  hack: "Company Visit",
  reading: "Major Event",
  social: "Community Event",
};

export type EventRecord = {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  rsvpCount: number;
  capacity: number | null;
  rsvpUrl: string | null;
  eventType: EventType;
  description: string;
  agenda: Array<{ time: string; item: string }>;
  guestName: string | null;
  guestCompany: string | null;
  status: EventStatus;
  summary: string | null;
  photoUrl: string | null;
};

export const fallbackEvents: EventRecord[] = [
  {
    id: "1",
    slug: "fireside-chat-dr-fei-fei-li",
    title: "Fireside chat — Dr. Fei-Fei Li",
    startsAt: "2026-05-05T18:00:00.000Z",
    location: "Gates B01 + Zoom",
    rsvpCount: 124,
    capacity: 180,
    rsvpUrl: null,
    guestName: null,
    guestCompany: null,
    endsAt: null,
    status: "published",
    summary: null,
    photoUrl: null,
    eventType: "talk",
    description:
      "On building visual intelligence, from ImageNet to embodied agents.",
    agenda: [
      { time: "6:00", item: "Doors open + snacks" },
      { time: "6:15", item: "Intro from club leads" },
      { time: "6:25", item: "Conversation + audience Q&A" },
    ],
  },
  {
    id: "2",
    slug: "hack-night-building-agents",
    title: "Hack night: building agents",
    startsAt: "2026-05-09T16:00:00.000Z",
    location: "Huang Center",
    rsvpCount: 41,
    capacity: 100,
    rsvpUrl: null,
    guestName: null,
    guestCompany: null,
    endsAt: null,
    status: "published",
    summary: null,
    photoUrl: null,
    eventType: "hack",
    description: "Build and demo practical agent workflows in teams.",
    agenda: [
      { time: "4:00", item: "Kickoff + challenge prompts" },
      { time: "4:20", item: "Build session" },
      { time: "5:30", item: "Demos + feedback" },
    ],
  },
  {
    id: "3",
    slug: "reading-group-rlhf-papers",
    title: "Reading group — RLHF papers",
    startsAt: "2026-05-14T19:00:00.000Z",
    location: "Online",
    rsvpCount: 22,
    capacity: null,
    rsvpUrl: null,
    guestName: null,
    guestCompany: null,
    endsAt: null,
    status: "published",
    summary: null,
    photoUrl: null,
    eventType: "reading",
    description: "Discuss key RLHF papers and practical takeaways.",
    agenda: [
      { time: "7:00", item: "Paper summaries" },
      { time: "7:20", item: "Debate on methods and tradeoffs" },
      { time: "7:50", item: "Action items" },
    ],
  },
];

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
