export function WhatsAppButton() {
  const phone = "2348033377084";
  const message = encodeURIComponent(
    "Hello Crispy Munchies, I'd like to make an inquiry."
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-green px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-roast shadow-lg shadow-green/30 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:px-5"
      aria-label="Chat on WhatsApp"
    >
      <span aria-hidden>💬</span>
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}