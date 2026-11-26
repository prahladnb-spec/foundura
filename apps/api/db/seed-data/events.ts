/** Starter events, taken from the Startup Events Tracker sheet (checked 22 Nov 2026). */
export interface EventSeed {
  name: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  country: string;
  scope: "India" | "Global";
  type: string;
  status: string;
  deadline?: string;
  bestFor?: string;
  notes?: string;
  sourceUrl?: string;
  sourceName?: string;
  format?: "In person" | "Online" | "Hybrid";
}

const LOOP = { sourceUrl: "https://entrepreneurloop.com/?p=6345", sourceName: "Entrepreneur Loop" };
const DEALROOM = { sourceUrl: "https://dealroom.co/events/", sourceName: "Dealroom" };

export const EVENTS: EventSeed[] = [
  { name: "TiEcon Delhi-NCR 2026", startDate: "2026-12-02", endDate: "2026-12-03", city: "New Delhi — India Habitat Centre", country: "India", scope: "India", type: "Summit", status: "Confirmed", bestFor: "Founders and investors in NCR", sourceUrl: "https://startupfeed.in/?p=13938", sourceName: "StartupFeed" },
  { name: "GITEX Global 2026", startDate: "2026-12-07", endDate: "2026-12-11", city: "Dubai", country: "UAE", scope: "Global", type: "Expo", status: "To verify", bestFor: "Founders eyeing the Gulf market", sourceUrl: "https://technologymagazine.com/top10/top-10-technology-events", sourceName: "Technology Magazine" },
  { name: "FAST42 ranking (Inc42) — applications close", country: "India", scope: "India", type: "Award / ranking", status: "Confirmed", deadline: "2026-12-10", bestFor: "D2C brands with verified revenue growth", notes: "Reveal in Feb 2027; no paid spots", ...LOOP },
  { name: "CES 2027", startDate: "2027-01-06", endDate: "2027-01-09", city: "Las Vegas", country: "USA", scope: "Global", type: "Expo", status: "Confirmed", bestFor: "Hardware and consumer-tech startups", ...DEALROOM },
  { name: "Vibrant Gujarat Global Summit (11th edition)", startDate: "2027-01-10", endDate: "2027-01-12", city: "Gandhinagar — Mahatma Mandir", country: "India", scope: "India", type: "Summit", status: "Confirmed", bestFor: "Founders selling to industry or government", ...LOOP },
  { name: "World Health Expo (WHX) Dubai", startDate: "2027-01-25", endDate: "2027-01-28", city: "Dubai Exhibition Centre and Dubai World Trade Centre", country: "UAE", scope: "Global", type: "Expo", status: "Confirmed", bestFor: "MedTech and health startups seeking distributors in the Gulf", notes: "Formerly Arab Health", sourceUrl: "https://www.worldhealthexpo.com/events/healthcare/dubai/", sourceName: "World Health Expo" },
  { name: "SXSW 2027", startDate: "2027-03-15", endDate: "2027-03-21", city: "Austin", country: "USA", scope: "Global", type: "Conference", status: "Confirmed", bestFor: "Consumer, media and deep-tech founders; SXSW Pitch", notes: "Innovation conference 15 to 20 March", sourceUrl: "https://sxsw.com/", sourceName: "SXSW" },
  { name: "LEAP 2027", startDate: "2027-04-12", endDate: "2027-04-15", city: "Riyadh — RECC Malham", country: "Saudi Arabia", scope: "Global", type: "Expo", status: "Confirmed", bestFor: "AI and deep-tech founders seeking Gulf investors", sourceUrl: "https://mcit.gov.sa/en/node/256607", sourceName: "Ministry of Communications and IT, Saudi Arabia" },
  { name: "London Tech Week 2027", startDate: "2027-06-07", endDate: "2027-06-11", city: "London — Olympia", country: "UK", scope: "Global", type: "Conference", status: "Confirmed", bestFor: "Founders expanding to the UK and Europe", notes: "Expo and stages 7 to 9 June; fringe events across London to 11 June", sourceUrl: "https://londontechweek.com/", sourceName: "London Tech Week" },
  { name: "Web Summit 2027", startDate: "2027-11-08", endDate: "2027-11-11", city: "Lisbon", country: "Portugal", scope: "Global", type: "Conference", status: "To verify", bestFor: "Founders raising from European and US investors", sourceUrl: "https://websummit.com/", sourceName: "Web Summit" },
  { name: "MEDICA 2027", startDate: "2027-11-15", endDate: "2027-11-18", city: "Düsseldorf", country: "Germany", scope: "Global", type: "Expo", status: "To verify", bestFor: "MedTech startups seeking European distributors", sourceUrl: "https://www.medica-tradefair.com/", sourceName: "MEDICA" },
  { name: "National Startup Day", startDate: "2027-01-16", endDate: "2027-01-16", city: "Nationwide", country: "India", scope: "India", type: "Ecosystem day", status: "Confirmed", bestFor: "Local incubator and grant sessions", notes: "Usually free. National Startup Awards 6.0 winners are due to be announced on the day", ...LOOP },
  { name: "Grace Hopper Celebration India", startDate: "2027-01-20", endDate: "2027-01-20", city: "Bengaluru", country: "India", scope: "India", type: "Conference", status: "Listing only", bestFor: "Women founders and engineers", ...LOOP },
  { name: "Web Summit Qatar", startDate: "2027-01-31", endDate: "2027-02-03", city: "Doha", country: "Qatar", scope: "Global", type: "Conference", status: "To verify", bestFor: "Founders targeting the Gulf", ...DEALROOM },
  { name: "South Summit Madrid 2027 Startup Competition — applications close", country: "Spain", scope: "Global", type: "Pitch competition", status: "To verify", deadline: "2027-01-31", bestFor: "Startups from any country and stage looking for European investors", notes: "Free to apply, in English; finalists pitch at South Summit Madrid, 2 to 4 June 2027", sourceUrl: "https://hub.causo.ai/events/south-summit", sourceName: "Causo event hub" },
  { name: "The Liveability Challenge 2027 — submissions close", country: "Singapore", scope: "Global", type: "Challenge", status: "Confirmed", deadline: "2027-02-12", bestFor: "Climate-tech startups (decarbonisation, cooling, oceans) with a solution ready to pilot", notes: "Finalists pitch in Singapore in May 2027", sourceUrl: "https://www.theliveabilitychallenge.org", sourceName: "The Liveability Challenge" },
  { name: "TiECon Pune", startDate: "2027-02-05", endDate: "2027-02-06", city: "Pune — The Westin, Koregaon Park", country: "India", scope: "India", type: "Conference", status: "Confirmed", bestFor: "Early-stage founders near Pune", notes: "Free", ...LOOP },
  { name: "MWC Barcelona · 4YFN", startDate: "2027-03-01", endDate: "2027-03-04", city: "Barcelona", country: "Spain", scope: "Global", type: "Expo", status: "To verify", bestFor: "Telecom, mobile and deep-tech startups", ...DEALROOM },
  { name: "Startup Mahakumbh Expo 6.0", startDate: "2027-03-12", endDate: "2027-03-13", city: "New Delhi — Bharat Mandapam", country: "India", scope: "India", type: "Expo", status: "Confirmed", bestFor: "Early-stage founders, students, exhibitors", notes: "Visitor pass free; delegate ₹500–₹15,000 + GST; Startup Pod ₹25,000", ...LOOP },
  { name: "Startup Hub Expo", startDate: "2027-03-23", endDate: "2027-03-25", city: "New Delhi — Bharat Mandapam", country: "India", scope: "India", type: "Expo", status: "Listing only", bestFor: "Hardware, IoT, fintech and telecom startups", ...LOOP },
  { name: "Web Summit Vancouver", startDate: "2027-05-25", endDate: "2027-05-28", city: "Vancouver Convention Centre", country: "Canada", scope: "Global", type: "Conference", status: "Confirmed", bestFor: "Founders targeting North America", sourceUrl: "https://startupstash.com/conferences/founder/", sourceName: "Startup Stash" },
  { name: "GITEX AI India", startDate: "2027-06-02", endDate: "2027-06-04", city: "Bengaluru — BIEC", country: "India", scope: "India", type: "Expo", status: "Confirmed", bestFor: "AI and deep-tech founders seeking investors", ...LOOP },
  { name: "VivaTech 2027", startDate: "2027-06-16", endDate: "2027-06-19", city: "Paris", country: "France", scope: "Global", type: "Expo", status: "To verify", bestFor: "Founders targeting Europe", ...DEALROOM },
];
