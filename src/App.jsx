import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Menu,
  X,
  MoveUpRight
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FlareScene from './components/FlareScene';
import FluxMachine from './components/FluxMachine';
import Lightroom from './components/Lightroom';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    number: '01',
    name: 'iwritehere',
    category: 'A shared space for writing',
    description:
      'A quiet place to write with other people. Pick a seat in the virtual cafe, write in your own section of a shared page, and let others read along live. Publish drafts, create hashtags and start a private conversation for two.',
    note:
      'Made for the simple joy of putting words somewhere they can be found.',
    className: 'project-iwrite',
    live: 'https://iwrite-here.web.app/',
  },
  {
    number: '02',
    name: 'Wumpus Gallery',
    category: 'An archive for the community',
    description:
      'A collection of Wumpus animations preserved from the archives of distok.top, a site that is now closed. After seeing how much people enjoyed a single animation shared in 2022, the full collection was brought together so the community could keep enjoying it.',
    note:
      'An act of preservation. The animations are archived, not original creations.',
    className: 'project-wumpus',
    live: 'https://wumpusgallery.vercel.app/',
  }
];

function Header() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="header">
      <a className="wordmark" href="#home" aria-label="Flaredrift home">
  <img src="/Logo.svg" alt="Flaredrift" />
</a>

      <button
        className="menu-toggle"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X /> : <Menu />}
      </button>

      <nav className={open ? 'nav nav-open' : 'nav'}>
        <a href="#work" onClick={close}>Selected work</a>
        <a href="#playground" onClick={close}>Playground</a>
        <a href="#about" onClick={close}>About</a>
        <a href="#journal" onClick={close}>Journal</a>
        <a href="/mindtrace/" onClick={close}>MINDTRACE</a>
        <a href="/ventures/">Ventures</a>
        <a href="/vision/">Vision</a>
        <a className="nav-contact" href="#contact" onClick={close}>
          Get in touch <ArrowUpRight size={14} />
        </a>
      </nav>
    </header>
  );
}

function ProjectCard({ project, index }) {
  return (
    <motion.article
      className={`project-card ${project.className}`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.75, delay: index * 0.08 }}
    >
      <div className="project-visual">
        {index === 0 ? (
          <div className="write-art">
            <div className="write-orbit orbit-one" />
            <div className="write-orbit orbit-two" />

            <div className="write-window">
              <span className="window-label">
                THE QUIET ROOM / 001
              </span>

              <div className="fake-lines">
                <i />
                <i />
                <i />
                <i />
              </div>

              <span className="window-cursor" />
            </div>

            <span className="visual-index">A PLACE TO BEGIN</span>
          </div>
        ) : (
          <div className="wumpus-art">
            <div className="wumpus-circle circle-a" />
            <div className="wumpus-circle circle-b" />
            <div className="wumpus-circle circle-c" />

           <div className="h-64 w-64 ">
             <img
  className="wumpus-mascot"
  src="/wumpus.svg"
  alt="Wumpus mascot"
/>
           </div>
            <span className="visual-index">
              COLLECTED / PRESERVED
            </span>
          </div>
        )}

        <span className="project-number">
          {project.number} / 02
        </span>
      </div>

      <div className="project-info">
        <div>
          <span className="eyebrow">{project.category}</span>
          <h3>{project.name}</h3>
        </div>

        <p>{project.description}</p>

        <div className="project-note">
  <span className="note-mark" />
  {project.note}
</div>

<a
  className="text-link project-visit"
  href={project.live}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`Visit ${project.name}`}
>
  Visit project <ArrowUpRight size={15} />
</a>
      </div>
    </motion.article>
  );
}

export default function App() {
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy > *', {
        y: 34,
        opacity: 0,
        duration: 1,
        stagger: 0.13,
        ease: 'power3.out',
        delay: 0.2
      });

      gsap.from('.hero-meta', {
        opacity: 0,
        y: 12,
        duration: 0.8,
        delay: 0.9
      });

      gsap.utils.toArray('.section-reveal').forEach((element) => {
        gsap.from(element, {
          y: 42,
          opacity: 0,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true
          }
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="site-shell" ref={pageRef}>
      <Header />

      <main>
        <section className="hero" id="home">
          <div className="hero-grid-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="hero-copy">
            <div className="eyebrow hero-kicker">
              <span className="status-dot" />
              AN INDEPENDENT CREATIVE IDENTITY
              <span className="kicker-line" />
            </div>

            <h1>
              Ideas
              <br />
              <span>in</span> motion
              <span className="hero-period">.</span>
            </h1>

            <p className="hero-description">
              A space for curious ideas, meaningful projects and things
              worth keeping in motion.
            </p>

            <a className="text-link" href="#work">
              Explore selected work <ArrowDownRight size={17} />
            </a>
            <a className="text-link" href="/mindtrace/">
              Explore MINDTRACE <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="hero-art">
            <FlareScene />

            <div className="art-caption">
              <span>FIG. 001</span>
              <span>FORM / FLOW / ENERGY</span>
            </div>

            <div className="art-cross cross-one" />
            <div className="art-cross cross-two" />
          </div>

          <div className="hero-meta">
            <span>INDEPENDENT BY NATURE</span>
            <span>CREATIVE WORKS &amp; DIGITAL CULTURE</span>
            <span>EST. 2026</span>
          </div>
        </section>

        <section className="work-section section-pad" id="work">
          <div className="section-heading section-reveal">
            <div>
              <span className="eyebrow">01 — SELECTED WORK</span>
              <h2>
                Things with
                <br />
                <em>a little meaning.</em>
              </h2>
            </div>

            <p>
              Not a catalogue. Just a few projects that carry a story,
              a feeling, or a reason to exist.
            </p>
          </div>

          <div className="projects-list">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.number}
                project={project}
                index={index}
              />
            ))}
          </div>
        </section>

        <section className="playground-section section-pad" id="playground">
          <div className="section-heading section-reveal">
            <div>
              <span className="eyebrow">02 — THE PLAYGROUND</span>
              <h2>Make a little<br /><em>something move.</em></h2>
            </div>
            <p>
              A small generative study. Move through the field, change its
              energy and colour, and make the motion your own.
            </p>
          </div>
          <div className="flux-intro-row">
            <span>EXPERIMENT 001</span>
            <span>AN INTERACTIVE STUDY IN MOTION</span>
          </div>
          <FluxMachine />
          <div className="lightroom-intro section-reveal" id="flare-lab">
            <div>
              <span className="eyebrow">EXPERIMENT 002 — FLARE LAB</span>
              <h3>Give light <em>some room.</em></h3>
            </div>
            <p>Shape sunlight, prism reflections and cinematic glow. Place the light, tune the atmosphere, and make the image yours.</p>
          </div>
          <Lightroom />
          <a className="text-link flux-back-link" href="#work">
            Back to selected work <ArrowDownRight size={16} />
          </a>
        </section>

        <section className="about-section section-pad" id="about">
          <div className="about-index section-reveal">
            <span className="eyebrow">03 — THE IDEA</span>
            <span className="big-index">FD—02</span>
          </div>

          <div className="about-content section-reveal">
            <h2>
              Not everything
              <br />
              needs a category.
            </h2>

            <p>
              Flaredrift is an independent creative identity founded by
              Mutasim Ifaz — a home for experiments, digital experiences,
              collected curiosities and ideas that deserve room to grow.
            </p>

            <p>
              Some things are made. Some are discovered. Some are simply
              worth preserving. Flaredrift makes space for all of them.
            </p>

            <div className="about-rule">
              <span />
              A CONTINUOUS WORK IN PROGRESS
            </div>
          </div>

          <div className="about-graphic" aria-hidden="true">
            <div className="geo-ring" />
            <div className="geo-square" />
            <div className="geo-dot" />
          </div>
        </section>

        <section className="journal-section section-pad" id="journal">
          <div className="journal-inner section-reveal">
            <span className="eyebrow">04 — JOURNAL / NOTES</span>

            <h2>
              Room for what
              <br />
              <span>comes next.</span>
            </h2>

            <p>
              Ideas, observations and small experiments will find their
              place here.
            </p>

            <span className="journal-stamp">
              MORE TO
              <br />
              COME <ArrowDownRight size={22} />
            </span>
          </div>
        </section>

        <section className="contact-section section-pad" id="contact">
          <span className="eyebrow section-reveal">
            05 — KEEP IN TOUCH
          </span>

          <div className="contact-row section-reveal">
            <h2>
              Something
              <br />
              <em>on your mind?</em>
            </h2>

            <a
              href="https://mutasimifaz.vercel.app/contact"
              target="_blank"
              rel="noreferrer"
              className="contact-link"
              aria-label="Contact Mutasim Ifaz"
            >
              <MoveUpRight size={34} />
            </a>
          </div>

          <div className="contact-bottom">
            <span>FLAREDRIFT / INDEPENDENT CREATIVE IDENTITY</span>

            <a
              href="https://mutasimifaz.vercel.app/"
              target="_blank"
              rel="noreferrer"
            >
              FOUNDED BY MUTASIM IFAZ <ArrowUpRight size={12} />
            </a>

            <a href="#home">BACK TO TOP ↑</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="wordmark" href="#home">
          FLAREDRIFT<span>.</span>
        </a>

        <span>Interactive Ideas in Motion — © 2026</span>
        <span>BUILT TO DRIFT.</span>
      </footer>
    </div>
  );
}
