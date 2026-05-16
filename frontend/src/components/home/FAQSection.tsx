import { HelpCircle, ChevronRight } from "lucide-react";

const faqs = [
  {
    question: "Can I register online?",
    answer: "Yes, you can register through our online portal. Simply fill out the registration form with your details and preferred course to get started.",
  },
  {
    question: "Do you support certificate verification?",
    answer: "Absolutely. Our platform features a robust verification system where employers or institutions can verify certificates using a unique ID or QR code.",
  },
  {
    question: "Are courses online or offline?",
    answer: "We offer flexible learning modes including both in-person campus classes and interactive online sessions to suit your schedule.",
  },
  {
    question: "How can I contact admission support?",
    answer: "You can reach our admission team via phone at +8809638349757, email at info.ydibd@gmail.com, or by visiting our campus directly.",
  },
  {
    question: "Is there any age limit for the courses?",
    answer: "Our courses are open to anyone passionate about learning. We have programs tailored for students, job seekers, and working professionals.",
  },
  {
    question: "Do you provide job placement support?",
    answer: "Yes, we have a dedicated career services cell that provides resume building, interview preparation, and job placement assistance to our graduates.",
  },
];

export function FAQSection() {
  return (
    <section className="relative bg-[#F9FBFC] py-24 lg:py-32 overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-theme-soft/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-primary/10 text-theme-primary text-xs font-bold uppercase tracking-widest mb-4">
            <HelpCircle size={14} className="text-theme-accent" />
            Got Questions?
          </div>
          <h2 className="text-[clamp(36px,5vw,52px)] font-black text-theme-dark tracking-tight mb-6">
            Everything you need to <span className="text-theme-accent">know.</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about our programs, registration, 
            and support services. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq) => (
            <article 
              className="group flex flex-col p-8 rounded-[32px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(27,60,83,0.08)] hover:-translate-y-1" 
              key={faq.question}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-theme-soft/20 text-theme-accent group-hover:bg-theme-soft group-hover:text-theme-dark transition-colors duration-300">
                  <ChevronRight size={14} className="transition-transform group-hover:rotate-90" />
                </div>
                <h3 className="text-xl font-black text-theme-dark leading-snug">
                  {faq.question}
                </h3>
              </div>
              <p className="pl-10 text-slate-600 leading-relaxed font-medium">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 font-bold">
            Still have questions? 
            <a href="tel:+8809638349757" className="ml-2 text-theme-primary hover:text-theme-accent transition-colors">
              Chat with our team &rarr;
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
