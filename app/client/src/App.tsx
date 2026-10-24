import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import "./App.css";
import Icon from "./components/Icon";

type PageId = "discover" | "daily" | "catalog" | "scale" | "eco";

interface Grass {
  name: string;
  location: string;
  biome: string;
  latitude: number;
  longtitude: number;
  brief: string;
  description: string;
  imageUrl: string;
}

const navItems: { id: PageId; label: string; icon: string }[] = [
  { id: "discover", label: "Discover", icon: "compass" },
  { id: "daily", label: "Grass of the day", icon: "sun" },
  { id: "catalog", label: "Grass catalog", icon: "leaf" },
  { id: "scale", label: "Trail scale", icon: "mountain" },
  { id: "eco", label: "Eco reminders", icon: "sprout" },
];

function App() {
  const [activePage, setActivePage] = useState<PageId>("discover");
  const [grasses, setGrasses] = useState<Grass[]>([]);
  const [grassOfTheDay, setGrassOfTheDay] = useState<Grass | null>(null);
  const [apiNotice, setApiNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [completedReminders, setCompletedReminders] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchGrasses = async () => {
      try {
        const [catalogResponse, dailyResponse] = await Promise.allSettled([
          axios.get<Grass[]>("http://localhost:3000/places"),
          axios.get<Grass>("http://localhost:3000/grass-of-the-day"),
        ]);
        if (!isMounted) return;

        if (
          catalogResponse.status === "fulfilled" &&
          catalogResponse.value.data.length
        ) {
          setGrasses(catalogResponse.value.data);
        }
        if (
          dailyResponse.status === "fulfilled" &&
          dailyResponse.value.data?.name
        ) {
          setGrassOfTheDay(dailyResponse.value.data);
        }

        if (
          catalogResponse.status === "rejected" ||
          dailyResponse.status === "rejected"
        ) {
          setApiNotice(
            "Showing field notes while the live grass catalog reconnects.",
          );
        }
      } catch {
        if (isMounted) {
          setApiNotice(
            "Showing field notes while the live grass catalog reconnects.",
          );
        }
      }
    };

    void fetchGrasses();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [activePage, grasses, searchTerm]);

  const navigate = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredGrasses = grasses.filter((grass) =>
    `${grass.name} ${grass.location} ${grass.biome}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const renderCards = (items: Grass[]) => (
    <div className="grass-grid">
      {items.map((grass, index) => (
        <article
          className="grass-card reveal"
          key={`${grass.name}-${grass.location}`}
        >
          <div
            className="grass-card-image"
            style={{ backgroundImage: `url("${grass.imageUrl}")` }}
          >
            <span className="biome-tag">{grass.biome}</span>
            <button
              className="save-button"
              type="button"
              aria-label={`Save ${grass.name}`}
              onClick={() => navigate("daily")}
            >
              <Icon name="leaf" size={17} />
            </button>
          </div>
          <div className="grass-card-copy">
            <p className="eyebrow">{grass.location}</p>
            <h3>{grass.name}</h3>
            <p className="card-brief">{grass.brief}</p>
            <button
              className="text-link"
              type="button"
              onClick={() => navigate("daily")}
            >
              Explore this grass <Icon name="arrow" size={15} />
            </button>
          </div>
          <span className="card-index">0{index + 1}</span>
        </article>
      ))}
    </div>
  );

  const renderDiscover = () => (
    <>
      <section className="hero-panel reveal">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            <span className="live-dot" /> THE OUTDOORS ARE CALLING
          </p>
          <h1>
            Find your
            <br />
            <em>wild.</em>
          </h1>
          <p className="hero-description">
            A little more outside. A little less screen time. Discover the
            world's most beautiful places to slow down and touch grass.
          </p>
          <button
            className="button button-light"
            type="button"
            onClick={() => navigate("catalog")}
          >
            Explore the catalog <Icon name="arrow" size={16} />
          </button>
          <div className="hero-note">
            <Icon name="pin" size={15} /> A field guide for the curious
          </div>
        </div>
        <div className="hero-photo-caption">
          <span>46° 28&apos; N&nbsp; 11° 48&apos; E</span>
          <span>DOLOMITES, ITALY</span>
        </div>
        <div className="hero-photo-credit">A GOOD DAY TO GET LOST</div>
      </section>

      <section className="quick-stats reveal" aria-label="Explore the outdoors">
        <div>
          <span className="stat-value">08</span>
          <span className="stat-label">unique biomes</span>
        </div>
        <span className="stat-divider" />
        <div>
          <span className="stat-value">
            {String(grasses.length).padStart(2, "0")}
          </span>
          <span className="stat-label">field notes</span>
        </div>
        <span className="stat-divider" />
        <div>
          <span className="stat-value">∞</span>
          <span className="stat-label">ways to wander</span>
        </div>
        <button
          className="stat-link"
          type="button"
          onClick={() => navigate("scale")}
        >
          Find your next trail <Icon name="arrow" size={15} />
        </button>
      </section>

      <section className="content-section">
        <div className="section-heading reveal">
          <div>
            <p className="eyebrow">A WORLD OF GREEN</p>
            <h2>
              Somewhere worth
              <br />
              taking the long way.
            </h2>
          </div>
          <button
            className="text-link section-link"
            type="button"
            onClick={() => navigate("catalog")}
          >
            View all field notes <Icon name="arrow" size={15} />
          </button>
        </div>
        {renderCards(grasses.slice(0, 3))}
      </section>

      <section className="reminder-banner reveal">
        <div className="reminder-icon">
          <Icon name="sprout" size={21} />
        </div>
        <div>
          <p className="eyebrow">A GENTLE REMINDER</p>
          <p>Leave it better than you found it.</p>
        </div>
        <button
          className="text-link"
          type="button"
          onClick={() => navigate("eco")}
        >
          Trail etiquette <Icon name="arrow" size={15} />
        </button>
      </section>
    </>
  );

  const renderDaily = () => (
    <section className="page-section">
      <div className="page-title reveal">
        <p className="eyebrow">
          <span className="live-dot" /> YOUR DAILY DOSE OF OUTSIDE
        </p>
        <h1>
          Grass of
          <br />
          <em>the day.</em>
        </h1>
        <p>
          One small reason to look up, step out, and see the world a little
          differently.
        </p>
      </div>
      <article className="daily-feature reveal">
        <div
          className="daily-image"
          style={{ backgroundImage: `url("${grassOfTheDay?.imageUrl}")` }}
        >
          <span className="daily-image-label">
            TODAY&apos;S FIELD NOTE&nbsp; · &nbsp;NO. 001
          </span>
        </div>
        <div className="daily-copy">
          <span className="biome-tag">{grassOfTheDay?.biome}</span>
          <p className="eyebrow daily-location">
            <Icon name="pin" size={14} /> {grassOfTheDay?.location}
          </p>
          <h2>{grassOfTheDay?.name}</h2>
          <p>{grassOfTheDay?.brief}</p>
          <div className="daily-fact">
            <Icon name="sun" size={17} />
            <span>
              Take a moment to notice what's growing beneath your feet.
            </span>
          </div>
          <button
            className="button button-green"
            type="button"
            onClick={() => navigate("catalog")}
          >
            Browse more grasses <Icon name="arrow" size={15} />
          </button>
        </div>
      </article>
      {apiNotice && <p className="api-notice">{apiNotice}</p>}
    </section>
  );

  const renderCatalog = () => (
    <section className="page-section">
      <div className="page-title page-title-row reveal">
        <div>
          <p className="eyebrow">NOT ALL GRASS IS THE SAME</p>
          <h1>
            The field
            <br />
            <em>guide.</em>
          </h1>
        </div>
        <p>
          A growing collection of wild places and the greens that make them feel
          like nowhere else.
        </p>
      </div>
      <label className="search-box reveal">
        <Icon name="search" size={19} />
        <input
          aria-label="Search the grass catalog"
          placeholder="Search grasses, places, or biomes..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <span>{filteredGrasses.length} NOTES</span>
      </label>
      {filteredGrasses.length ? (
        renderCards(filteredGrasses)
      ) : (
        <div className="empty-state reveal">
          <Icon name="compass" size={28} />
          <h2>No trails found.</h2>
          <p>Try a different place, biome, or grass name.</p>
        </div>
      )}
      {apiNotice && <p className="api-notice">{apiNotice}</p>}
    </section>
  );

  const renderScale = () => (
    <section className="page-section">
      <div className="page-title reveal">
        <p className="eyebrow">PICK YOUR PACE</p>
        <h1>
          There's a trail
          <br />
          <em>for that.</em>
        </h1>
        <p>
          Big summit energy or a gentle leg-stretcher? Find a day outside that
          feels like yours.
        </p>
      </div>
      <div className="scale-list">
        {[
          {
            level: "01",
            name: "The wander",
            detail: "Easy does it",
            distance: "1–3 mi",
            note: "Gentle paths, forest loops & picnic-worthy meadows.",
            icon: "sprout",
          },
          {
            level: "02",
            name: "The rambler",
            detail: "A little further",
            distance: "3–7 mi",
            note: "Rolling hills, scenic lookouts & room to roam.",
            icon: "compass",
          },
          {
            level: "03",
            name: "The summit chaser",
            detail: "Earn those views",
            distance: "7–12 mi",
            note: "Steeper climbs, ridgeline views & a well-earned snack.",
            icon: "mountain",
          },
        ].map((trail) => (
          <article className="scale-card reveal" key={trail.level}>
            <span className="scale-number">{trail.level}</span>
            <span className="scale-icon">
              <Icon name={trail.icon} size={22} />
            </span>
            <div className="scale-copy">
              <p className="eyebrow">{trail.detail}</p>
              <h2>{trail.name}</h2>
              <p>{trail.note}</p>
            </div>
            <span className="scale-distance">{trail.distance}</span>
            <Icon name="chevron" size={18} />
          </article>
        ))}
      </div>
      <div className="safety-note reveal">
        <Icon name="sun" size={17} />
        <span>
          Always check local trail conditions and bring more water than you
          think you'll need.
        </span>
      </div>
    </section>
  );

  const renderEco = () => {
    const reminders = [
      "Stick to marked trails and give fragile plants room to grow.",
      "Pack out everything you pack in — including the little things.",
      "Give wildlife space. Quietly observe; never feed.",
      "Leave flowers, rocks, and good memories right where they belong.",
      "Share the trail kindly. A smile goes a long way.",
    ];

    return (
      <section className="page-section">
        <div className="page-title reveal">
          <p className="eyebrow">GOOD OUTSIDE, GOOD HUMAN</p>
          <h1>
            Take only
            <br />
            <em>the feeling.</em>
          </h1>
          <p>
            Little choices make a big difference. A pocket-sized guide to
            showing the outdoors some love.
          </p>
        </div>
        <div className="eco-layout">
          <div className="eco-list">
            {reminders.map((reminder, index) => {
              const isComplete = completedReminders.includes(index);
              return (
                <button
                  className={`eco-item reveal${isComplete ? " is-complete" : ""}`}
                  key={reminder}
                  type="button"
                  aria-pressed={isComplete}
                  onClick={() =>
                    setCompletedReminders((current) =>
                      isComplete
                        ? current.filter((item) => item !== index)
                        : [...current, index],
                    )
                  }
                >
                  <span className="eco-check">
                    <Icon name="check" size={16} />
                  </span>
                  <span className="eco-item-text">{reminder}</span>
                  <span className="eco-item-number">0{index + 1}</span>
                </button>
              );
            })}
          </div>
          <aside className="eco-card reveal">
            <span className="eco-card-icon">
              <Icon name="sprout" size={24} />
            </span>
            <p className="eyebrow">THE OUTDOORS ISN'T A BACKDROP</p>
            <h2>It's someone else's home, too.</h2>
            <p>
              Every trail is a shared space. Small acts of care help keep wild
              places wild for the next person who needs them.
            </p>
            <div className="eco-progress">
              <span
                style={{
                  width: `${(completedReminders.length / reminders.length) * 100}%`,
                }}
              />
            </div>
            <span className="progress-label">
              {completedReminders.length} OF {reminders.length} GOOD HABITS
              NOTED
            </span>
          </aside>
        </div>
      </section>
    );
  };

  const pageRenderers: Record<PageId, () => ReactNode> = {
    discover: renderDiscover,
    daily: renderDaily,
    catalog: renderCatalog,
    scale: renderScale,
    eco: renderEco,
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          type="button"
          onClick={() => navigate("discover")}
          aria-label="Touch grass home"
        >
          <span className="brand-mark">
            <Icon name="sprout" size={21} />
          </span>
          <span className="brand-name">
            touch grass<span>AROUND THE WORLD</span>
          </span>
        </button>

        <p className="nav-caption">YOUR FIELD GUIDE</p>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={`nav-item${activePage === item.id ? " active" : ""}`}
              key={item.id}
              type="button"
              aria-current={activePage === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.id === "daily" && <span className="nav-new">TODAY</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-orbit">
              <Icon name="sun" size={19} />
            </div>
            <p className="eyebrow">A THOUGHT FOR THE TRAIL</p>
            <p>
              Look up. Breathe in.
              <br />
              You're right where you need to be.
            </p>
          </div>
          <div className="sidebar-footer">
            <span className="footer-dot" /> MADE FOR THE OUTSIDE
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>FIELD GUIDE</span>
            <span className="breadcrumb-slash">/</span>
            <span>
              {navItems
                .find((item) => item.id === activePage)
                ?.label.toUpperCase()}
            </span>
          </div>
          <div className="topbar-right">
            <span className="weather-label">
              <Icon name="sun" size={15} /> PERFECTLY OUTSIDE WEATHER
            </span>
            <span className="topbar-avatar">✳</span>
          </div>
        </header>
        <div className="mobile-brand">
          <Icon name="sprout" size={20} />
          <span className="mobile-brand-copy">
            <span>touch grass</span>
            <span className="mobile-brand-sub">AROUND THE WORLD</span>
          </span>
        </div>
        <nav className="mobile-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={`mobile-nav-item${activePage === item.id ? " active" : ""}`}
              key={item.id}
              type="button"
              aria-current={activePage === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="page-content" key={activePage}>
          {pageRenderers[activePage]()}
        </div>

        <footer className="main-footer">
          <span>TAKE THE SCENIC ROUTE.</span>
          <span>© TOUCH GRASS AROUND THE WORLD</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
