import Icon from "./components/Icon";
import "./EcoReminder.css";

const reminders = [
  "Stick to marked trails and give fragile plants room to grow.",
  "Pack out everything you pack in — including the little things.",
  "Give wildlife space. Quietly observe; never feed.",
  "Leave flowers, rocks, and good memories right where they belong.",
  "Share the trail kindly. A smile goes a long way.",
];

interface EcoReminderProps {
  completedReminders: number[];
  onToggleReminder: (index: number) => void;
}

interface EcoReminderBannerProps {
  onOpenReminders: () => void;
}

export function EcoReminderBanner({
  onOpenReminders,
}: EcoReminderBannerProps) {
  return (
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
        onClick={onOpenReminders}
      >
        Trail etiquette <Icon name="arrow" size={15} />
      </button>
    </section>
  );
}

export default function EcoReminder({
  completedReminders,
  onToggleReminder,
}: EcoReminderProps) {
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
                onClick={() => onToggleReminder(index)}
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
          <p className="eyebrow">THE OUTDOORS ISN&apos;T A BACKDROP</p>
          <h2>It&apos;s someone else&apos;s home, too.</h2>
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
}
