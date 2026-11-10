// Editable content for the static pages (/ventures/ and /vision/).
// Statuses are literal. Edit this file to change what the pages say.

export const SITE = 'https://flaredrift.vercel.app';
export const CONTACT_URL = 'https://mutasimifaz.vercel.app/contact';

export const nav = [
  { label: 'Selected work', href: '/#work' },
  { label: 'Playground', href: '/#playground' },
  { label: 'About', href: '/#about' },
  { label: 'Journal', href: '/#journal' },
  { label: 'Ventures', href: '/ventures/', route: 'ventures' },
  { label: 'Vision', href: '/vision/', route: 'vision' },
  { label: 'MINDTRACE', href: '/mindtrace/' },
];

export const pages = {
  ventures: {
    path: '/ventures/',
    title: 'Ventures & Independent Projects — Flaredrift',
    description:
      'Explore Flaredrift projects: Bhashora, iwritehere, Flare Lab and MINDTRACE, alongside creative coding experiments and independent digital concepts.',
    keywords:
      'Flaredrift ventures, Bhashora, Bengali English learning, iwritehere, Flare Lab, creative experiments, independent digital products',
    ogTitle: 'Ventures & Independent Projects — Flaredrift',
    ogDescription:
      'Explore launched Flaredrift projects, MINDTRACE and experiments in creative coding, interactive tools and independent digital products.',
  },
  vision: {
    path: '/vision/',
    title: 'Vision & Creative Direction — Flaredrift',
    description:
      'Explore the Flaredrift vision for creative coding, experimental websites, interactive experiences and useful digital products such as Flare Lab and MINDTRACE.',
    keywords:
      'Flaredrift vision, creative coding, experimental websites, interactive experiences, digital tools, independent creative lab',
    ogTitle: 'Vision & Creative Direction — Flaredrift',
    ogDescription:
      'Curiosity over convention. Flaredrift is an independent creative playground and laboratory.',
  },
};

export const launched = [
  {
    number: '01',
    name: 'iwritehere',
    kind: 'A virtual writing café',
    status: 'Live',
    description:
      'A quiet place to write with other people. Pick a seat in the virtual café, write in your own section of a shared page, and let others read along live. Publish drafts, create hashtags and start a private conversation for two.',
    facts: [['Format', 'Web app'], ['Status', 'Live'], ['Address', 'iwrite-here.web.app']],
    cta: { label: 'Visit iwritehere', href: 'https://iwrite-here.web.app/', external: true },
    art: 'write',
  },
  {
    number: '02',
    name: 'Flare Lab',
    kind: 'A creative photo-effects tool',
    status: 'Live',
    description:
      'Add sunlight, prism reflections and cinematic glow to your own photos. Place the light, stack layers, tune the atmosphere, compare against the original and export the result. It runs in your browser, on this site.',
    facts: [['Format', 'In-browser tool'], ['Status', 'Live'], ['Location', 'Playground, on the homepage']],
    cta: { label: 'Open Flare Lab', href: '/#flare-lab', external: false },
    art: 'flare',
  },
  {
    number: '03',
    name: 'Bhashora',
    kind: 'A Bengali-first learning platform',
    status: 'Live',
    description:
      'An approachable learning space for Bengali speakers to build English confidence and get practical digital and AI guidance in Bangla. Bhashora brings language learning and everyday digital help together in a Bengali-first experience.',
    facts: [['Format', 'Progressive web app'], ['Focus', 'English learning & digital help'], ['Language', 'Bangla-first']],
    cta: { label: 'Visit Bhashora', href: 'https://bhashora-learn.web.app/', external: true },
    art: 'bhashora',
  },
];

export const statusLegend = [
  ['In Development', 'Actively being built, not ready to use.'],
  ['Experimental', 'Playable, but rough edges are expected.'],
  ['Concept', 'An idea on paper. Nothing built yet.'],
];

export const experiments = [
  {
    number: 'E1',
    name: 'Flux Machine',
    status: 'Experimental',
    description:
      'A generative particle study with pointer response, an energy control, two colour palettes and pause, play and regenerate controls. Playable now.',
    cta: { label: 'Try it in the Playground', href: '/#playground' },
  },
  {
    number: 'E2',
    name: 'More Playground studies',
    status: 'In Development',
    description:
      'Further small interactive pieces in the spirit of Flux Machine: creative-coding studies that reward a few minutes of play.',
  },
  {
    number: 'E3',
    name: 'Unusual digital tools',
    status: 'Concept',
    description:
      'Small, single-purpose tools with an unexpected angle, the way Flare Lab turns a photo effect into a place to compose light.',
  },
  {
    number: 'E4',
    name: 'Experimental website formats',
    status: 'Concept',
    description:
      'Questions about what a website can be when it is treated as a place instead of a page: scroll, space, memory and surprise.',
  },
  {
    number: 'E5',
    name: 'MINDTRACE',
    status: 'In Development',
    description:
      'A local-first workspace for mapping decisions, organizing evidence, examining assumptions and making complex reasoning easier to inspect. Its first foundation is available to explore.',
    cta: { label: 'Open MINDTRACE', href: '/mindtrace/' },
  },
];

export const explores = [
  ['Creative coding', 'Code as a medium: generative studies, motion and systems that behave.'],
  ['Experimental websites', 'Sites that treat layout, scroll and typography as things to play with.'],
  ['Interactive experiences', 'Pieces that respond to the person using them.'],
  ['Unusual digital tools', 'Small utilities with a point of view.'],
  ['Independent digital products', 'Things made end to end, on independent terms.'],
];

export const principles = [
  {
    n: '01',
    title: 'Curiosity over convention',
    body:
      'Start from the question nobody asked. Conventions are good starting points and poor finish lines. When the standard answer is available, it is worth checking whether a stranger one is better.',
  },
  {
    n: '02',
    title: 'Function with personality',
    body:
      'A tool has to work first. Then it should feel like someone made it. Personality is not decoration. It is the reason a thing is remembered.',
  },
  {
    n: '03',
    title: 'Experimentation with purpose',
    body:
      'Every experiment asks a question. Some answer it and some replace it with a better one. Nothing is made just to fill space.',
  },
  {
    n: '04',
    title: 'Making things worth revisiting',
    body:
      'The measure is whether someone comes back: for the detail they missed, the mood, or the small surprise on the third visit.',
  },
];

export const manifesto =
  'Flaredrift is an independent creative playground and laboratory. It exists to see what happens when code, design and curiosity are given room to wander. Some experiments become tools. Some stay experiments. The ones worth revisiting are the ones worth keeping.';
