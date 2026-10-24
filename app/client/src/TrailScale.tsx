import Icon from "./components/Icon";
import "./TrailScale";

const trails = [
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
];

export default function TrailScale() {
  return (
    <section className="page-section">
      <div className="page-title reveal">
        <p className="eyebrow">PICK YOUR PACE</p>
        <h1>
          There&apos;s a trail
          <br />
          <em>for that.</em>
        </h1>
        <p>
          Big summit energy or a gentle leg-stretcher? Find a day outside that
          feels like yours.
        </p>
      </div>
      <div className="scale-list">
        {trails.map((trail) => (
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
          think you&apos;ll need.
        </span>
      </div>
    </section>
  );
}
