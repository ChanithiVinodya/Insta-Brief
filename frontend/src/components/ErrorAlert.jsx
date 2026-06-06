export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-xl bg-terracotta/10 border border-terracotta/30 text-terracotta px-4 py-3 text-sm">
      {message}
    </div>
  );
}
