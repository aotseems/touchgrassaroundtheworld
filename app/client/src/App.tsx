import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Icon from "./components/Icon";
import GrassDetailPage from "./components/GrassDetailPage";
import Catalog, { GrassCardGrid } from "./Catalog";
import EcoReminder, { EcoReminderBanner } from "./EcoReminder";
import GrassOfTheDay from "./GrassOfTheDay";
import GrassAroundMe from "./GrassAroundMe";
import TrailScale from "./TrailScale";
import Merchandise from "./Merchandise";
import ThemeSettings from "./components/ThemeSettings";
import {
  applyTheme,
  getSavedTheme,
  type ThemeConfig,
} from "./theme";
import type Grass from "./grass";

type PageId = "discover" | "daily" | "around-me" | "catalog" | "scale" | "eco" | "merchandise";

const navItems: { id: PageId; label: string; icon: string }[] = [
  { id: "discover", label: "Discover", icon: "compass" },
  { id: "daily", label: "Grass of the day", icon: "sun" },
  { id: "around-me", label: "Grass around me", icon: "radar" },
  { id: "catalog", label: "Grass catalog", icon: "leaf" },
  { id: "scale", label: "Trail scale", icon: "mountain" },
  { id: "eco", label: "Eco reminders", icon: "sprout" },
  { id: "merchandise", label: "Merchandise", icon: "shopping-bag" },
];

function App() {
  const [activePage, setActivePage] = useState<PageId>("discover");
  const [selectedGrassId, setSelectedGrassId] = useState<number | null>(null);
  const [grasses, setGrasses] = useState<Grass[]>([]);
  const [grassOfTheDay, setGrassOfTheDay] = useState<Grass | null>(null);
  const [apiNotice, setApiNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [completedReminders, setCompletedReminders] = useState<number[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>(() => getSavedTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    const fetchGrasses = async () => {
      try {
        const [catalogResponse, dailyResponse] = await Promise.allSettled([
          axios.get<Grass[]>("http://localhost:3000/grasses"),
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
  }, [activePage, grasses, searchTerm, selectedGrassId]);

  const navigate = (page: PageId) => {
    setSelectedGrassId(null);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openGrassDetail = (id: number) => {
    setSelectedGrassId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeGrassDetail = () => {
    setSelectedGrassId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleReminder = (index: number) => {
    setCompletedReminders((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  };

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
        <GrassCardGrid
          grasses={grasses.slice(0, 3)}
          onSelectGrass={openGrassDetail}
        />
      </section>

      <EcoReminderBanner onOpenReminders={() => navigate("eco")} />
    </>
  );

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
              className={`nav-item${activePage === item.id && selectedGrassId === null ? " active" : ""}`}
              key={item.id}
              type="button"
              aria-current={activePage === item.id && selectedGrassId === null ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.id === "daily" && <span className="nav-new">TODAY</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-theme-btn"
            onClick={() => setIsThemeModalOpen(true)}
            aria-label="Theme settings"
          >
            <Icon name="palette" size={16} />
            <span>Theme Settings</span>
            <span
              className="sidebar-theme-indicator"
              style={{ backgroundColor: theme.accent }}
              title={`Active theme: ${theme.name}`}
            />
          </button>

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
            {selectedGrassId !== null ? (
              <>
                <button
                  className="breadcrumb-button"
                  type="button"
                  onClick={closeGrassDetail}
                >
                  {navItems
                    .find((item) => item.id === activePage)
                    ?.label.toUpperCase()}
                </button>
                <span className="breadcrumb-slash">/</span>
                <span>
                  {grasses.find((g) => g.id === selectedGrassId)?.name.toUpperCase() ||
                    (grassOfTheDay?.id === selectedGrassId
                      ? grassOfTheDay.name.toUpperCase()
                      : `NOTE #${selectedGrassId}`)}
                </span>
              </>
            ) : (
              <span>
                {navItems
                  .find((item) => item.id === activePage)
                  ?.label.toUpperCase()}
              </span>
            )}
          </div>
          <div className="topbar-right">
            <button
              type="button"
              className="theme-btn"
              onClick={() => setIsThemeModalOpen(true)}
              title="Change website color theme"
            >
              <Icon name="palette" size={13} />
              <span>{theme.name}</span>
            </button>
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
              className={`mobile-nav-item${activePage === item.id && selectedGrassId === null ? " active" : ""}`}
              key={item.id}
              type="button"
              aria-current={activePage === item.id && selectedGrassId === null ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div
          className="page-content"
          key={selectedGrassId !== null ? `grass-${selectedGrassId}` : activePage}
        >
          {selectedGrassId !== null ? (
            <GrassDetailPage
              grassId={selectedGrassId}
              initialGrass={
                grasses.find((g) => g.id === selectedGrassId) ||
                (grassOfTheDay?.id === selectedGrassId ? grassOfTheDay : null)
              }
              allGrasses={grasses}
              onBack={closeGrassDetail}
              onSelectGrass={openGrassDetail}
            />
          ) : (
            activePage === "discover" ? (
              renderDiscover()
            ) : activePage === "daily" ? (
              <GrassOfTheDay
                grass={grassOfTheDay}
                apiNotice={apiNotice}
                onSelectGrass={openGrassDetail}
                onBrowseCatalog={() => navigate("catalog")}
              />
            ) : activePage === "around-me" ? (
              <GrassAroundMe />
            ) : activePage === "catalog" ? (
              <Catalog
                grasses={grasses}
                onSelectGrass={openGrassDetail}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                apiNotice={apiNotice}
              />
            ) : activePage === "scale" ? (
              <TrailScale />
            ) : activePage === "merchandise" ? (
              <Merchandise />
            ) : (
              <EcoReminder
                completedReminders={completedReminders}
                onToggleReminder={toggleReminder}
              />
            )
          )}
        </div>

        <footer className="main-footer">
          <span>TAKE THE SCENIC ROUTE.</span>
          <span>© TOUCH GRASS AROUND THE WORLD</span>
        </footer>
      </main>

      <ThemeSettings
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
}

export default App;
