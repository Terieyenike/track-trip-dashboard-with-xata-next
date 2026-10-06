import Link from "next/link";
import Image from "next/image";
import { Brand, Icon } from "@/components/TravelUI";
export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Brand />
        <div>
          <Link href="/explore">Travel stories</Link>
          <a href="#how-it-works">How it works</a>
          <a href="#features">The possibilities</a>
          <Link className="button" href="/sign-in">
            Sign in <Icon name="arrow" size={17} />
          </Link>
        </div>
      </nav>
      <section className="landing-hero">
        <div className="landing-copy">
          <div className="eyebrow">FOR YOUR INNER EXPLORER</div>
          <h1>
            A little planning.
            <br />A world of <em>memories.</em>
          </h1>
          <p>
            Plan each day, keep your budget in view, and bring the memories
            home. Your itinerary, packing checklist, and travel journal —
            beautifully together.
          </p>
          <div className="landing-actions">
            <Link href="/sign-up" className="button">
              Start your next chapter <Icon name="arrow" />
            </Link>
            <a href="#how-it-works" className="text-link">
              <span>Take a closer look</span> <Icon name="arrow" size={17} />
            </a>
          </div>
          <small>Your own account. Your trips, plans, and memories.</small>
        </div>
        <div className="landing-visual">
          <Image
            src="/assets/pexels-andrea-roman-291935393-15475219.jpg"
            alt="A winding road through hills, ready for your next adventure"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 50vw"
            className="cover"
          />
          <div className="floating-card">
            <span className="stat-icon">
              <Icon name="compass" />
            </span>
            <div>
              <small>YOUR NEXT CHAPTER</small>
              <strong>Somewhere unforgettable.</strong>
              <p>Make it more than a daydream.</p>
            </div>
          </div>
          <span className="landing-stamp">
            GO SOMEWHERE
            <br />
            <strong>new.</strong>
          </span>
        </div>
      </section>
      <div className="landing-ribbon">
        Less juggling tabs. More making memories.
        <span>One workspace. Every adventure.</span>
        <Icon name="globe" />
      </div>
      <section className="landing-section" id="features">
        <div className="eyebrow">A HOME FOR YOUR WANDERLUST</div>
        <h2>
          From the first idea
          <br />
          to the “remember when?”
        </h2>
        <div className="feature-grid">
          {[
            [
              "trips",
              "A real plan for every day",
              "Schedule places, meals, stays, and travel. Keep times, booking links, and estimated costs together.",
            ],
            [
              "notes",
              "Keep the moments that matter",
              "Capture meals, discoveries, and stories with photos and a personal rating.",
            ],
            [
              "globe",
              "Know your budget. Feel ready.",
              "Set a trip budget, check off your packing list, and download an itinerary to take with you.",
            ],
          ].map(([icon, title, copy]) => (
            <article key={title}>
              <span className="stat-icon">
                <Icon name={icon} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-section how-section" id="how-it-works">
        <div>
          <div className="eyebrow">A SIMPLE START</div>
          <h2>
            Good journeys
            <br />
            begin here.
          </h2>
          <Link href="/dashboard/trip/create" className="button">
            Plan your first trip <Icon name="arrow" />
          </Link>
        </div>
        <div className="steps">
          {[
            [
              "01",
              "Pick a place",
              "Create a trip, add your dates, and make space for inspiration.",
            ],
            [
              "02",
              "Make it your own",
              "Build your daily itinerary, add estimated costs, and tick off your essentials.",
            ],
            [
              "03",
              "Bring the memories home",
              "Collect photos and journal entries you’ll love coming back to.",
            ],
          ].map(([n, title, copy]) => (
            <article key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-cta">
        <Icon name="compass" size={36} />
        <h2>
          The world is waiting.
          <br />
          What’s your next chapter?
        </h2>
        <Link href="/dashboard" className="button light">
          Explore Track Trips <Icon name="arrow" />
        </Link>
        <p>A private workspace for your adventures</p>
      </section>
      <footer className="landing-footer">
        <Brand />
        <p>Made for the journey.</p>
        <span>© 2026 Track Trips</span>
      </footer>
    </main>
  );
}
