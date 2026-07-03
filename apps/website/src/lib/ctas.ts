export type PrintBackPageCta = { title: string; description: string };

export const printBackPageCtas: PrintBackPageCta[] = [
  {
    title: 'Join the build',
    description:
      "We're building an open, privacy-first social network in public: open source, non-profit, governed for users, not shareholders. Follow the work, try the demo, and join the community.",
  },
  {
    title: 'Real people. Real talk. Real build.',
    description:
      'The Civia Project is not a pitch deck or a policy paper. It is an NGO building a privacy-first social network for users, not shareholders. Stay close to the work.',
  },
  {
    title: 'Help shape what comes next',
    description:
      'This paper ends here. The platform does not. We welcome builders, critics, and citizens who want a social network that respects privacy and accountability. Connect with us online.',
  },
  {
    title: 'No ads. No outrage engine. No exit strategy.',
    description:
      'We are building a verified, privacy-first network as a non-profit, funded by grants and donations, never by venture capital. Follow the project and try the demo.',
  },
  {
    title: 'Reclaim the digital town square',
    description:
      'The social web was built for connection and captured for profit. We are building an alternative: real identity, local-only intent, and governance that does not depend on corporate good faith.',
  },
  {
    title: 'Built for people, not platforms',
    description:
      'We are not optimizing for engagement, outrage, or exit multiples. We are building a social network stewarded by a non-profit: open source, privacy-first, and accountable to users.',
  },
  {
    title: 'Your data stays yours',
    description:
      'Privacy is not a setting here. It is the architecture. Follow the build, try the demo, and join a community that treats the social web as a public good.',
  },
  {
    title: 'Make it real',
    description:
      'Principles on paper are not enough. We are establishing a non-profit to ship a privacy-first social network in the open. Follow the project, try the demo, and help us build it.',
  },
  {
    title: 'Built to outlast us',
    description:
      'We may not see the full shape of what we are building. That is the point. The Civia Project is a non-profit planting long-term roots: open source, privacy-first, governed for the public good, not for shareholders.',
  },
  {
    title: 'The long commit',
    description:
      'Real change in the social web will not arrive in a single release cycle. We are here for the long work: transparent code, non-profit stewardship, and a network designed for people who are not in the room yet.',
  },
  {
    title: 'Legacy, not leverage',
    description:
      'We are not optimizing for an acquisition or an IPO. We are planting something durable: a verified, privacy-first social network that future generations can audit, trust, and extend.',
  },
  {
    title: 'Not for us alone',
    description:
      'This is for the generations to come. We are building The Civia Project in public, open source, non-profit, privacy-first, so the next wave inherits a better covenant with the social web.',
  },
];

/** Stable CTA for static HTML (cache-friendly build output). */
export const defaultPrintBackPageCta = printBackPageCtas[0]!;
