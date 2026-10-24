import { useState, useMemo, useEffect } from "react";
import Icon from "./components/Icon";
import type Grass from "./grass";
import "./Catalog.css";

interface GrassCardGridProps {
  grasses: Grass[];
  onSelectGrass: (id: number) => void;
}

interface CatalogProps {
  grasses: Grass[];
  onSelectGrass: (id: number) => void;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  apiNotice?: string;
}

function getCountryFromLocation(location: string): string {
  if (!location) return "";
  const parts = location.split(",");
  return parts[parts.length - 1].trim();
}

export function GrassCardGrid({ grasses, onSelectGrass }: GrassCardGridProps) {
  return (
    <div className="grass-grid">
      {grasses.map((grass, index) => (
        <article
          className="grass-card reveal is-visible"
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
  searchTerm: externalSearchTerm,
  onSearchTermChange,
  apiNotice,
}: CatalogProps) {
  const [internalSearch, setInternalSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedBiome, setSelectedBiome] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  const effectiveSearchTerm =
    externalSearchTerm !== undefined ? externalSearchTerm : internalSearch;

  const handleSearchChange = (value: string) => {
    if (onSearchTermChange) {
      onSearchTermChange(value);
    } else {
      setInternalSearch(value);
    }
  };

  // Derive unique countries and biomes dynamically from data
  const countries = useMemo(() => {
    const set = new Set<string>();
    grasses.forEach((g) => {
      const country = getCountryFromLocation(g.location);
      if (country) set.add(country);
    });
    return Array.from(set).sort();
  }, [grasses]);

  const biomes = useMemo(() => {
    const set = new Set<string>();
    grasses.forEach((g) => {
      if (g.biome) set.add(g.biome);
    });
    return Array.from(set).sort();
  }, [grasses]);

  // Apply filtering and sorting
  const filteredGrasses = useMemo(() => {
    return grasses
      .filter((grass) => {
        // Search term matching
        const matchesSearch =
          effectiveSearchTerm.trim() === "" ||
          `${grass.name} ${grass.location} ${grass.biome} ${grass.brief}`
            .toLowerCase()
            .includes(effectiveSearchTerm.toLowerCase());

        // Country filter matching
        const grassCountry = getCountryFromLocation(grass.location);
        const matchesCountry =
          selectedCountry === "all" ||
          grassCountry.toLowerCase() === selectedCountry.toLowerCase();

        // Biome filter matching
        const matchesBiome =
          selectedBiome === "all" ||
          grass.biome.toLowerCase() === selectedBiome.toLowerCase();

        return matchesSearch && matchesCountry && matchesBiome;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "country-asc": {
            const countryA = getCountryFromLocation(a.location);
            const countryB = getCountryFromLocation(b.location);
            const diff = countryA.localeCompare(countryB);
            return diff !== 0 ? diff : a.location.localeCompare(b.location);
          }
          case "biome-asc":
            return a.biome.localeCompare(b.biome);
          case "default":
          default:
            return a.id - b.id;
        }
      });
  }, [grasses, effectiveSearchTerm, selectedCountry, selectedBiome, sortBy]);

  // Reveal animation observer for dynamically filtered cards
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
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".reveal:not(.is-visible)")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [filteredGrasses]);

  const hasActiveFilters =
    effectiveSearchTerm.trim() !== "" ||
    selectedCountry !== "all" ||
    selectedBiome !== "all" ||
    sortBy !== "default";

  const resetFilters = () => {
    handleSearchChange("");
    setSelectedCountry("all");
    setSelectedBiome("all");
    setSortBy("default");
  };

  return (
    <section className="page-section">
      <div className="page-title page-title-row reveal is-visible">
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

      {/* Main Search Bar */}
      <div className="search-box-wrapper reveal is-visible">
        <label className="search-box">
          <Icon name="search" size={19} />
          <input
            aria-label="Search the grass catalog"
            placeholder="Search grasses, places, biomes, or notes..."
            value={effectiveSearchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
          {effectiveSearchTerm && (
            <button
              className="search-clear-btn"
              type="button"
              onClick={() => handleSearchChange("")}
              aria-label="Clear search text"
            >
              <Icon name="x" size={14} />
            </button>
          )}
          <span>{filteredGrasses.length} NOTES</span>
        </label>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="catalog-toolbar reveal is-visible">
        {/* Country Filter */}
        <div className="filter-group">
          <span className="filter-icon">
            <Icon name="pin" size={15} />
          </span>
          <select
            className="filter-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            aria-label="Filter by country"
          >
            <option value="all">All Countries ({countries.length})</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <span className="filter-chevron">
            <Icon name="chevron" size={14} />
          </span>
        </div>

        {/* Biome Filter */}
        <div className="filter-group">
          <span className="filter-icon">
            <Icon name="leaf" size={15} />
          </span>
          <select
            className="filter-select"
            value={selectedBiome}
            onChange={(e) => setSelectedBiome(e.target.value)}
            aria-label="Filter by biome"
          >
            <option value="all">All Biomes ({biomes.length})</option>
            {biomes.map((biome) => (
              <option key={biome} value={biome}>
                {biome}
              </option>
            ))}
          </select>
          <span className="filter-chevron">
            <Icon name="chevron" size={14} />
          </span>
        </div>

        {/* Sort By */}
        <div className="filter-group">
          <span className="filter-icon">
            <Icon name="filter" size={14} />
          </span>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort grasses"
          >
            <option value="default">Default Catalog Order</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="country-asc">Country: A to Z</option>
            <option value="biome-asc">Biome: A to Z</option>
          </select>
          <span className="filter-chevron">
            <Icon name="chevron" size={14} />
          </span>
        </div>
      </div>

      {/* Quick Biome Filter Chips */}
      <div className="catalog-chips-row reveal is-visible">
        <span className="chips-label">QUICK BIOMES:</span>
        <div className="catalog-chips">
          <button
            className={`catalog-chip${selectedBiome === "all" ? " is-active" : ""}`}
            type="button"
            onClick={() => setSelectedBiome("all")}
          >
            All
          </button>
          {biomes.map((biome) => (
            <button
              key={biome}
              className={`catalog-chip${selectedBiome === biome ? " is-active" : ""}`}
              type="button"
              onClick={() =>
                setSelectedBiome(selectedBiome === biome ? "all" : biome)
              }
            >
              {biome}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Tags & Count Bar */}
      {hasActiveFilters && (
        <div className="active-filters-bar reveal is-visible">
          <div className="active-filters-list">
            <span className="active-label">Active:</span>

            {selectedCountry !== "all" && (
              <span className="filter-pill">
                <Icon name="pin" size={11} />
                <span>Country: {selectedCountry}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCountry("all")}
                  aria-label="Remove country filter"
                >
                  <Icon name="x" size={11} />
                </button>
              </span>
            )}

            {selectedBiome !== "all" && (
              <span className="filter-pill">
                <Icon name="leaf" size={11} />
                <span>{selectedBiome}</span>
                <button
                  type="button"
                  onClick={() => setSelectedBiome("all")}
                  aria-label="Remove biome filter"
                >
                  <Icon name="x" size={11} />
                </button>
              </span>
            )}

            {effectiveSearchTerm.trim() !== "" && (
              <span className="filter-pill">
                <Icon name="search" size={11} />
                <span>&ldquo;{effectiveSearchTerm}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Remove search query"
                >
                  <Icon name="x" size={11} />
                </button>
              </span>
            )}

            {sortBy !== "default" && (
              <span className="filter-pill">
                <Icon name="filter" size={11} />
                <span>Sorted</span>
                <button
                  type="button"
                  onClick={() => setSortBy("default")}
                  aria-label="Reset sorting"
                >
                  <Icon name="x" size={11} />
                </button>
              </span>
            )}

            <button
              className="clear-all-button"
              type="button"
              onClick={resetFilters}
            >
              <Icon name="refresh" size={12} /> Reset all
            </button>
          </div>

          <span className="filter-results-count">
            Showing {filteredGrasses.length} of {grasses.length} field notes
          </span>
        </div>
      )}

      {/* Grid or Empty State */}
      {filteredGrasses.length ? (
        <GrassCardGrid
          grasses={filteredGrasses}
          onSelectGrass={onSelectGrass}
        />
      ) : (
        <div className="empty-state reveal is-visible">
          <Icon name="compass" size={32} />
          <h2>No trails or field notes found</h2>
          <p>
            No grasses match your current combination of filters
            {selectedCountry !== "all" ? ` in ${selectedCountry}` : ""}
            {selectedBiome !== "all" ? ` (${selectedBiome} biome)` : ""}.
          </p>
          <button
            className="button button-green"
            type="button"
            onClick={resetFilters}
            style={{ marginTop: "18px" }}
          >
            <Icon name="refresh" size={15} /> Clear filters and show all
          </button>
        </div>
      )}

      {apiNotice && <p className="api-notice">{apiNotice}</p>}
    </section>
  );
}
