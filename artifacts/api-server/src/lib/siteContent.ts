export const defaultSiteContent = {
  announcement: "Preparing to launch in Abu Dhabi · Sample catalog only",
  heroEyebrow: "A new plant shop for Abu Dhabi",
  heroTitleMain: "Make room for",
  heroTitleEmphasis: "growing things.",
  heroDescription:
    "Nabaat is getting ready to open. We’re putting together a thoughtful selection of plants and flowers, with practical advice to help you choose well.",
  homeCtaLabel: "Explore sample plants",
  footerIntro:
    "Plants and flowers, with clear guidance for the spaces and seasons we live in.",
  footerNote:
    "Nabaat is preparing to launch in Abu Dhabi. Catalog and plant information shown here are illustrative samples, not a live offer.",
  contactTitle: "What are you looking for?",
  contactIntro:
    "Send an enquiry for the Nabaat team to review. Contact details and response times are still being confirmed.",
  contactAside:
    "Nabaat is preparing to launch in Abu Dhabi. Contact details, opening hours, delivery area and social links will be confirmed before launch.",
  email: "",
  phone: "",
  openingHours: "",
  deliveryArea: "",
  instagram: "",
  tiktok: "",
  storyTitle: "Meet Nabaat.",
  storyIntro:
    "A new plant and flower business preparing to launch in Abu Dhabi.",
} as const;

export type SiteContent = { [K in keyof typeof defaultSiteContent]: string };
