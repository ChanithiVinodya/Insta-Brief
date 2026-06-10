const SUGGESTED = [
  'technology', 'science', 'business', 'health', 'politics',
  'sports', 'entertainment', 'environment', 'world', 'finance',
  'education', 'culture', 'startup', 'ai', 'climate',
];

export default function InterestPicker({ selected, onChange }) {
  const toggle = (interest) => {
    const lower = interest.toLowerCase();
    if (selected.includes(lower)) {
      onChange(selected.filter((i) => i !== lower));
    } else {
      onChange([...selected, lower]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTED.map((interest) => {
        const active = selected.includes(interest);
        return (
          <button
            key={interest}
            type="button"
            onClick={() => toggle(interest)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all border ${
              active
                ? 'bg-[var(--gold)] text-[var(--ink)] border-[var(--gold)] shadow-md'
                : 'bg-[var(--paper2)] border-[var(--paper3)] text-[var(--muted)] hover:border-[var(--gold)]'
            }`}
          >
            {interest}
          </button>
        );
      })}
    </div>
  );
}
