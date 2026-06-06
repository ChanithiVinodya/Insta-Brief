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
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              active
                ? 'bg-brand text-white shadow-md'
                : 'bg-surface border border-muted/30 text-muted hover:border-brand/50'
            }`}
          >
            {interest}
          </button>
        );
      })}
    </div>
  );
}
