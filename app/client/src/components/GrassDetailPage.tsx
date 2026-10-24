import { useEffect, useState } from "react";
import axios from "axios";
import Icon from "./Icon";
import type Grass from "../grass";
import "./GrassDetailPage.css";

interface GrassDetailPageProps {
  grassId: number;
  initialGrass?: Grass | null;
  allGrasses?: Grass[];
  onBack: () => void;
  onSelectGrass?: (id: number) => void;
}

export default function GrassDetailPage({
  grassId,
  initialGrass,
  allGrasses = [],
  onBack,
  onSelectGrass,
}: GrassDetailPageProps) {
  const [grass, setGrass] = useState<Grass | null>(
    initialGrass && initialGrass.id === grassId ? initialGrass : null,
  );
  const [loading, setLoading] = useState<boolean>(
    !initialGrass || initialGrass.id !== grassId,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`saved_grass_${grassId}`) === "true";
    } catch {
      return false;
    }
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);

  // Query grass from the server database using the endpoint from app/server/src/index.ts
  useEffect(() => {
    let isMounted = true;

    const fetchGrassById = async () => {
      try {
        const response = await axios.get<Grass>(
          `http://localhost:3000/grass-by-id?id=${grassId}`,
        );
        if (isMounted) {
          setGrass(response.data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Failed to load grass by ID:", err);
        // If we don't already have the grass from props, show an error state
        if (!initialGrass || initialGrass.id !== grassId) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            setError(
              `Field note #${grassId} could not be found in the catalog.`,
            );
          } else {
            setError(
              "Could not connect to the database. Showing offline view if available.",
            );
          }
        }
        setLoading(false);
      }
    };

    void fetchGrassById();

    return () => {
      isMounted = false;
    };
  }, [grassId, initialGrass]);

  const toggleSave = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      localStorage.setItem(`saved_grass_${grassId}`, String(nextSaved));
    } catch {
      // ignore
    }
  };

  const copyCoordinates = async (coords: string) => {
    try {
      await navigator.clipboard.writeText(coords);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Find next and previous grass for pagination
  const currentIndex = allGrasses.findIndex((g) => g.id === grassId);
  const prevGrass = currentIndex > 0 ? allGrasses[currentIndex - 1] : null;
  const nextGrass =
    currentIndex >= 0 && currentIndex < allGrasses.length - 1
      ? allGrasses[currentIndex + 1]
      : null;

  if (loading && !grass) {
    return (
      <section className="grass-detail-page">
        <div className="detail-top-bar">
          <button className="detail-back-button" type="button" onClick={onBack}>
            <Icon name="arrow-left" size={16} /> Back to field guide
          </button>
        </div>
        <div className="detail-loading-state">
          <span className="live-dot" />
          <p>Consulting the field archives...</p>
        </div>
      </section>
    );
  }

  if (error && !grass) {
    return (
      <section className="grass-detail-page">
        <div className="detail-top-bar">
          <button className="detail-back-button" type="button" onClick={onBack}>
            <Icon name="arrow-left" size={16} /> Back to field guide
          </button>
        </div>
        <div className="empty-state">
          <Icon name="compass" size={32} />
          <h2>Field note unavailable</h2>
          <p>{error}</p>
          <button
            className="button button-green"
            type="button"
            onClick={onBack}
            style={{ marginTop: 20 }}
          >
            <Icon name="arrow-left" size={15} /> Return to catalog
          </button>
        </div>
      </section>
    );
  }

  if (!grass) {
    return null;
  }

  const longitude = grass.longitude ?? grass.longtitude ?? 0;
  const latitude = grass.latitude ?? 0;
  const latFormatted = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? "N" : "S"}`;
  const lngFormatted = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? "E" : "W"}`;
  const coordinatesString = `${latFormatted}  ${lngFormatted}`;

  const descriptionText = grass.description;

  return (
    <article className="grass-detail-page">
      {/* Top action bar */}
      <div className="detail-top-bar">
        <button
          className="detail-back-button"
          type="button"
          onClick={onBack}
          aria-label="Back to catalog"
        >
          <Icon name="arrow-left" size={16} />
          <span>Back to field guide</span>
        </button>

        <div className="detail-actions">
          <button
            className={`detail-action-button${isSaved ? " is-active" : ""}`}
            type="button"
            onClick={toggleSave}
            title={isSaved ? "Saved to journal" : "Save to field journal"}
          >
            <Icon name="leaf" size={15} />
            <span>{isSaved ? "Saved" : "Save note"}</span>
          </button>

          <button
            className="detail-action-button"
            type="button"
            onClick={() => void copyCoordinates(coordinatesString)}
            title="Copy coordinates"
          >
            <Icon name="pin" size={15} />
            <span>{copied ? "Copied!" : "Coordinates"}</span>
          </button>
        </div>
      </div>

      {/* Hero photography header */}
      <header className="detail-hero">
        <div
          className="detail-hero-media"
          style={{ backgroundImage: `url("${grass.imageUrl}")` }}
        >
          <div className="detail-hero-overlay" />
          <div className="detail-hero-badges">
            <span className="biome-tag">{grass.biome}</span>
            <span className="detail-catalog-no">
              FIELD NOTE NO. {String(grass.id).padStart(3, "0")}
            </span>
          </div>
          <div className="detail-hero-coordinates">
            <Icon name="pin" size={13} />
            <span>{coordinatesString}</span>
          </div>
        </div>

        <div className="detail-hero-header">
          <p className="eyebrow detail-location-eyebrow">
            <Icon name="pin" size={13} /> {grass.location}
          </p>
          <h1 className="detail-title">{grass.name}</h1>
          <p className="detail-lead">{grass.brief}</p>
        </div>
      </header>

      {/* Key specifications strip */}
      <section className="detail-specs-strip" aria-label="Field specifications">
        <div className="spec-item">
          <span className="spec-label">BIOME</span>
          <span className="spec-value">{grass.biome}</span>
        </div>
        <span className="spec-separator" />
        <div className="spec-item">
          <span className="spec-label">LOCATION</span>
          <span className="spec-value">{grass.location}</span>
        </div>
        <span className="spec-separator" />
        <div className="spec-item">
          <span className="spec-label">COORDINATES</span>
          <span className="spec-value spec-coords">{coordinatesString}</span>
        </div>
        <span className="spec-separator" />
        <div className="spec-item">
          <span className="spec-label">CATALOG ID</span>
          <span className="spec-value">
            #{String(grass.id).padStart(3, "0")}
          </span>
        </div>
      </section>

      {/* Two-column detailed layout */}
      <div className="detail-body-grid">
        <div className="detail-main-col">
          {/* Botanical Field Notes */}
          <section className="detail-card">
            <p className="eyebrow">BOTANICAL FIELD OBSERVATION</p>
            <h2>Living in the wild</h2>
            <div className="detail-prose">
              <p>{descriptionText}</p>
              <p className="detail-field-quote">
                “Tread softly here. Each blade is shaped by rain, altitude, and
                untamed winds.”
              </p>
            </div>
          </section>

          {/* Sensory Profile */}
          <section className="detail-card">
            <p className="eyebrow">UNDERFOOT SENSATIONS</p>
            <h2>What it feels like</h2>
            <div className="detail-sensory-grid">
              <div className="sensory-item">
                <div className="sensory-icon">
                  <Icon name="leaf" size={18} />
                </div>
                <div>
                  <h4>Texture & Density</h4>
                  <p>
                    Plush yet resilient, cushioning every step and returning to
                    form when the breeze sweeps through.
                  </p>
                </div>
              </div>
              <div className="sensory-item">
                <div className="sensory-icon">
                  <Icon name="sun" size={18} />
                </div>
                <div>
                  <h4>Light & Morning Dew</h4>
                  <p>
                    Best experienced in early dawn or late golden hour when dew
                    refracts ambient mountain light.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Touch Grass Logging */}
          <section className="detail-touch-card">
            <div className="touch-card-copy">
              <p className="eyebrow">DAILY OUTDOOR RITUAL</p>
              <h3>Have you touched this grass?</h3>
              <p>
                Take off your boots, step off the screen, and feel the natural
                grounding of the earth.
              </p>
            </div>
            <button
              className={`touch-button${touched ? " is-touched" : ""}`}
              type="button"
              onClick={() => setTouched(!touched)}
            >
              <Icon name={touched ? "check" : "sprout"} size={19} />
              <span>
                {touched ? "Touched & Grounded" : "I touched this grass"}
              </span>
            </button>
          </section>
        </div>

        {/* Sidebar Column */}
        <aside className="detail-sidebar-col">
          {/* Habitat notes */}
          <div className="detail-side-card">
            <div className="side-card-icon">
              <Icon name="mountain" size={20} />
            </div>
            <p className="eyebrow">HABITAT GUIDE</p>
            <h3>Trekking notes</h3>
            <ul className="side-note-list">
              <li>
                <strong>Best season:</strong> Late spring through mid-autumn
              </li>
              <li>
                <strong>Trail grade:</strong> Varied terrain, natural footpaths
              </li>
              <li>
                <strong>Footwear:</strong> Lightweight hiking shoes or barefoot
                in clear clearings
              </li>
            </ul>
          </div>

          {/* Eco reminder */}
          <div className="detail-side-card eco-accent">
            <div className="side-card-icon">
              <Icon name="sprout" size={20} />
            </div>
            <p className="eyebrow">STEWARDSHIP</p>
            <h3>Leave it better</h3>
            <p>
              Alpine and delicate grasses take seasons to recover from heavy
              trampling. Keep to designated trails and leave wildflowers intact.
            </p>
          </div>

          {/* Related grass navigation */}
          {(prevGrass || nextGrass) && onSelectGrass && (
            <div className="detail-side-card nav-card">
              <p className="eyebrow">CONTINUE WANDERING</p>
              <h3>Next field notes</h3>
              <div className="adjacent-grass-links">
                {prevGrass && (
                  <button
                    className="adjacent-grass-button"
                    type="button"
                    onClick={() => onSelectGrass(prevGrass.id)}
                  >
                    <span className="adjacent-label">← PREVIOUS</span>
                    <span className="adjacent-title">{prevGrass.name}</span>
                  </button>
                )}
                {nextGrass && (
                  <button
                    className="adjacent-grass-button"
                    type="button"
                    onClick={() => onSelectGrass(nextGrass.id)}
                  >
                    <span className="adjacent-label">NEXT →</span>
                    <span className="adjacent-title">{nextGrass.name}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Footer navigation */}
      <footer className="detail-footer-nav">
        <button className="button button-light" type="button" onClick={onBack}>
          <Icon name="arrow-left" size={16} /> Return to catalog
        </button>
      </footer>
    </article>
  );
}
