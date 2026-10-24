import Icon from "./components/Icon";
import type Grass from "./grass";
import "./Catalog.css";

interface GrassCardGridProps {
  grasses: Grass[];
  onSelectGrass: (id: number) => void;
}

interface CatalogProps extends GrassCardGridProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  apiNotice: string;
}

export function GrassCardGrid({ grasses, onSelectGrass }: GrassCardGridProps) {
  return (
    <div className="grass-grid">
      {grasses.map((grass, index) => (
        <article
          className="grass-card reveal"
          key={`${grass.id}-${grass.name}-${grass.location}`}
          onClick={() => onSelectGrass(grass.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectGrass(grass.id);
            }
          }}
          aria-label={`View field note for ${grass.name}`}
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
              onClick={(event) => {
                event.stopPropagation();
                onSelectGrass(grass.id);
              }}
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
              onClick={(event) => {
                event.stopPropagation();
                onSelectGrass(grass.id);
              }}
            >
              Explore this grass <Icon name="arrow" size={15} />
            </button>
          </div>
          <span className="card-index">0{index + 1}</span>
        </article>
      ))}
    </div>
  );
}

export default function Catalog({
  grasses,
  onSelectGrass,
  searchTerm,
  onSearchTermChange,
  apiNotice,
}: CatalogProps) {
  return (
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
          onChange={(event) => onSearchTermChange(event.target.value)}
        />
        <span>{grasses.length} NOTES</span>
      </label>
      {grasses.length ? (
        <GrassCardGrid grasses={grasses} onSelectGrass={onSelectGrass} />
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
}
