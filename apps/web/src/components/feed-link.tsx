import { FEED_TITLES, type FeedId, feedPath } from "@/lib/feeds";

/** Tells feed readers about the page's Atom feed; React places the tag in the document head. */
export function FeedLink({ id }: { id: FeedId }) {
  return <link rel="alternate" type="application/atom+xml" title={FEED_TITLES[id]} href={feedPath(id)} />;
}
