import { Mail, MapPin, PhoneCall } from "lucide-react";

const contacts = [
  {
    icon: PhoneCall,
    label: "Call Us",
    value: "+8809638349757, +8809696063511",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info.ydibd@gmail.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Bangladesh",
  },
];

export function ContactSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-theme-accent">Contact</p>
          <h2 className="text-[clamp(32px,4vw,52px)] font-black leading-tight text-theme-dark">
            Need help choosing a course?
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-theme-primary">
            Contact our admission team for course details, registration support, result
            information, and certificate verification.
          </p>
        </div>

        <div className="grid gap-4">
          {contacts.map((item) => (
            <article className="flex gap-4 rounded-lg border border-theme-soft/70 p-5" key={item.label}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-theme-soft text-theme-dark">
                <item.icon size={22} />
              </span>
              <div>
                <h3 className="font-black text-theme-dark">{item.label}</h3>
                <p className="mt-1 text-theme-primary">{item.value}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
