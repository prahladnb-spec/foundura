/** The site's Atom feeds: what each one is called and where it lives. Text in the feeds is English. */
export const FEED_IDS = ["policy", "guides", "events", "rounds"] as const;
export type FeedId = (typeof FEED_IDS)[number];

export const FEED_TITLES: Record<FeedId, string> = {
  policy: "Foundura: startup policy news",
  guides: "Foundura: guides for founders",
  events: "Foundura: startup events",
  rounds: "Foundura: funding rounds",
};

export const feedPath = (id: FeedId) => `/feeds/${id}.xml`;
