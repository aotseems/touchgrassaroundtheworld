import Icon from "./components/Icon";
import type Grass from "./grass";
import "./GrassOfTheDay.css";

interface GrassOfTheDayProps {
  grass: Grass | null;
  apiNotice: string;
  onSelectGrass: (id: number) => void;
  onBrowseCatalog: () => void;
}

export default function GrassOfTheDay({
  grass,
  apiNotice,
  onSelectGrass,
  onBrowseCatalog,
}: GrassOfTheDayProps) {
  return (
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
          style={{ backgroundImage: `url("${grass?.imageUrl}")` }}
        >
          <span className="daily-image-label">
            TODAY&apos;S FIELD NOTE&nbsp; · &nbsp;NO. 001
          </span>
        </div>
        <div className="daily-copy">
          <span className="biome-tag">{grass?.biome}</span>
          <p className="eyebrow daily-location">
            <Icon name="pin" size={14} /> {grass?.location}
          </p>
          <h2>{grass?.name}</h2>
          <p>{grass?.brief}</p>
          <div className="daily-fact">
            <Icon name="sun" size={17} />
            <span>
              Take a moment to notice what&apos;s growing beneath your feet.
            </span>
          </div>
          <div className="daily-actions">
            {grass?.id && (
              <button
                className="button button-light"
                type="button"
                onClick={() => onSelectGrass(grass.id)}
              >
                View full field note <Icon name="arrow" size={15} />
              </button>
            )}
            <button
              className="button button-green"
              type="button"
              onClick={onBrowseCatalog}
            >
              Browse more grasses <Icon name="arrow" size={15} />
            </button>
          </div>
        </div>
      </article>
      {apiNotice && <p className="api-notice">{apiNotice}</p>}
    </section>
  );
}
