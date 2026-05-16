const faqs = [
  {
    question: "Can I register online?",
    answer: "Yes. Use the registration page to submit your information and course interest.",
  },
  {
    question: "Do you support certificate verification?",
    answer: "The platform includes certificate verification and result lookup workflows.",
  },
  {
    question: "Are courses online or offline?",
    answer: "The institute can support both online and offline course management.",
  },
  {
    question: "How can I contact admission support?",
    answer: "Use the phone, email, or contact section on this homepage for assistance.",
  },
];

export function FAQSection() {
  return (
    <section className="bg-theme-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-theme-soft">FAQ</p>
          <h2 className="text-[clamp(32px,4vw,52px)] font-black leading-tight">Common questions</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article className="rounded-lg bg-white/10 p-6 ring-1 ring-white/15" key={faq.question}>
              <h3 className="text-lg font-black text-theme-soft">{faq.question}</h3>
              <p className="mt-3 leading-7 text-white/80">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
