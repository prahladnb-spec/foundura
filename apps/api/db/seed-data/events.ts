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
}

const LOOP = { sourceUrl: "https://entrepreneurloop.com/?p=6345", sourceName: "Entrepreneur Loop" };
const DEALROOM = { sourceUrl: "https://dealroom.co/events/", sourceName: "Dealroom" };

export const EVENTS: EventSeed[] = [
  { name: "TiEcon Delhi-NCR 2026", startDate: "2026-12-02", endDate: "2026-12-03", city: "New Delhi — India Habitat Centre", country: "India", scope: "India", type: "Summit", status: "Confirmed", bestFor: "Founders and investors in NCR", sourceUrl: "https://startupfeed.in/?p=13938", sourceName: "StartupFeed" },
  { name: "GITEX Global 2026", startDate: "2026-12-07", endDate: "2026-12-11", city: "Dubai", country: "UAE", scope: "Global", type: "Expo", status: "To verify", bestFor: "Founders eyeing the Gulf market", sourceUrl: "https://technologymagazine.com/top10/top-10-technology-events", sourceName: "Technology Magazine" },
  { name: "FAST42 ranking (Inc42) — applications close", country: "India", scope: "India", type: "Award / ranking", status: "Confirmed", deadline: "2026-12-10", bestFor: "D2C brands with verified revenue growth", notes: "Reveal in Feb 2027; no paid spots", ...LOOP },
  { name: "CES 2027", startDate: "2027-01-06", endDate: "2027-01-09", city: "Las Vegas", country: "USA", scope: "Global", type: "Expo", status: "Confirmed", bestFor: "Hardware and consumer-tech startups", ...DEALROOM },
  { name: "Vibrant Gujarat Global Summit (11th edition)", startDate: "2027-01-10", endDate: "2027-01-12", city: "Gandhinagar — Mahatma Mandir", country: "India", scope: "India", type: "Summit", status: "Confirmed", bestFor: "Founders selling to industry or government", ...LOOP },
  { name: "National Startup Day", startDate: "2027-01-16", endDate: "2027-01-16", city: "Nationwide", country: "India", scope: "India", type: "Ecosystem day", status: "Confirmed", bestFor: "Local incubator and grant sessions", notes: "Usually free", ...LOOP },
  { name: "Grace Hopper Celebration India", startDate: "2027-01-20", endDate: "2027-01-20", city: "Bengaluru", country: "India", scope: "India", type: "Conference", status: "Listing only", bestFor: "Women founders and engineers", ...LOOP },
  { name: "Web Summit Qatar", startDate: "2027-01-31", endDate: "2027-02-03", city: "Doha", country: "Qatar", scope: "Global", type: "Conference", status: "To verify", bestFor: "Founders targeting the Gulf", ...DEALROOM },
  { name: "TiECon Pune", startDate: "2027-02-05", endDate: "2027-02-06", city: "Pune — The Westin, Koregaon Park", country: "India", scope: "India", type: "Conference", status: "Confirmed", bestFor: "Early-stage founders near Pune", notes: "Free", ...LOOP },
  { name: "MWC Barcelona · 4YFN", startDate: "2027-03-01", endDate: "2027-03-04", city: "Barcelona", country: "Spain", scope: "Global", type: "Expo", status: "To verify", bestFor: "Telecom, mobile and deep-tech startups", ...DEALROOM },
  { name: "Startup Mahakumbh Expo 6.0", startDate: "2027-03-12", endDate: "2027-03-13", city: "New Delhi — Bharat Mandapam", country: "India", scope: "India", type: "Expo", status: "Confirmed", bestFor: "Early-stage founders, students, exhibitors", notes: "Visitor pass free; delegate ₹500–₹15,000 + GST; Startup Pod ₹25,000", ...LOOP },
  { name: "Startup Hub Expo", startDate: "2027-03-23", endDate: "2027-03-25", city: "New Delhi — Bharat Mandapam", country: "India", scope: "India", type: "Expo", status: "Listing only", bestFor: "Hardware, IoT, fintech and telecom startups", ...LOOP },
  { name: "Web Summit Vancouver", startDate: "2027-05-25", endDate: "2027-05-28", city: "Vancouver Convention Centre", country: "Canada", scope: "Global", type: "Conference", status: "Confirmed", bestFor: "Founders targeting North America", sourceUrl: "https://startupstash.com/conferences/founder/", sourceName: "Startup Stash" },
  { name: "GITEX AI India", startDate: "2027-06-02", endDate: "2027-06-04", city: "Bengaluru — BIEC", country: "India", scope: "India", type: "Expo", status: "Confirmed", bestFor: "AI and deep-tech founders seeking investors", ...LOOP },
  { name: "VivaTech 2027", startDate: "2027-06-16", endDate: "2027-06-19", city: "Paris", country: "France", scope: "Global", type: "Expo", status: "To verify", bestFor: "Founders targeting Europe", ...DEALROOM },
];
