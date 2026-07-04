export interface SuccessTask {
  id: string;
  title: string;
  detail?: string;
  impact: string;
  action: string;
}

export interface SuccessBlock {
  key: string;
  title: string;
  timeLabel: string;
  tasks: SuccessTask[];
}

export const successPlaybook: SuccessBlock[] = [
  {
    key: "power-hour",
    title: "Power Hour · Prospecting",
    timeLabel: "8:00–9:00",
    tasks: [
      {
        id: "power-hour-1",
        title: "Call your 3 hottest leads first",
        detail: "Reach them before another agent does.",
        impact: "Mandate pipeline",
        action: "Call",
      },
      {
        id: "power-hour-2",
        title: "5 sphere / past-client calls",
        detail: "Check in, ask each for one referral.",
        impact: "Referrals",
        action: "Start",
      },
      {
        id: "power-hour-3",
        title: "10 circle-prospecting messages",
        detail: "Just listed / just sold to neighbours.",
        impact: "Seller leads",
        action: "Send",
      },
      {
        id: "power-hour-4",
        title: "Contact 2 private sellers or expired listings",
        detail: "They already want to sell.",
        impact: "Mandate pipeline",
        action: "Open",
      },
      {
        id: "power-hour-5",
        title: "Add 5 new prospects to the CRM",
        detail: "Keep the funnel full.",
        impact: "Database",
        action: "Add",
      },
    ],
  },
  {
    key: "sellers-mandates",
    title: "Sellers & Mandates",
    timeLabel: "9:00–11:00",
    tasks: [
      {
        id: "sellers-1",
        title: "Send feedback to all active mandates",
        detail: "Every seller, one tap.",
        impact: "Retention",
        action: "Send",
      },
      {
        id: "sellers-2",
        title: "Finish the next CMA",
        detail: "Comps are ready for tomorrow's appointment.",
        impact: "Win the mandate",
        action: "Open",
      },
      {
        id: "sellers-3",
        title: "Confirm tomorrow's listing presentation",
        impact: "Mandate pipeline",
        action: "Confirm",
      },
    ],
  },
  {
    key: "buyers-viewings",
    title: "Buyers & Viewings",
    timeLabel: "11:00–14:00",
    tasks: [
      {
        id: "buyers-1",
        title: "Match new listings to your buyer database",
        impact: "Faster sale",
        action: "Match",
      },
      {
        id: "buyers-2",
        title: "Confirm today's viewings",
        impact: "Offers",
        action: "Confirm",
      },
      {
        id: "buyers-3",
        title: "Follow up everyone who viewed yesterday",
        impact: "Offers",
        action: "Follow up",
      },
    ],
  },
  {
    key: "deals-pipeline",
    title: "Deals & Pipeline",
    timeLabel: "14:00–16:00",
    tasks: [
      {
        id: "deals-1",
        title: "Check suspensive-condition deadlines",
        detail: "Deals die on missed dates.",
        impact: "Save the deal",
        action: "Chase",
      },
      {
        id: "deals-2",
        title: "Chase an attorney or bond originator on a live transfer",
        impact: "Registrations",
        action: "Call",
      },
    ],
  },
  {
    key: "brand-growth",
    title: "Brand & Growth",
    timeLabel: "16:00–17:00",
    tasks: [
      {
        id: "brand-1",
        title: "Post one piece of content",
        detail: "Just sold / just listed builds the brand.",
        impact: "Inbound",
        action: "Post",
      },
      {
        id: "brand-2",
        title: "Ask one happy client for a testimonial",
        impact: "Brand equity",
        action: "Ask",
      },
    ],
  },
];
