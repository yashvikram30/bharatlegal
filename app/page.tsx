import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueIntake } from "@/components/intake/issue-intake";
import { Chakra } from "@/components/landing/chakra";
import { ClauseDemo } from "@/components/landing/clause-demo";

const statutes = [
  "Bharatiya Nyaya Sanhita",
  "Bharatiya Nagarik Suraksha Sanhita",
  "Consumer Protection Act, 2019",
  "Model Tenancy Act",
  "Right to Information Act",
  "Legal Services Authorities Act, 1987",
];

const heroPoints = [
  "Every answer cites the section it relies on",
  "Official free legal-aid offices, mapped",
  "Your documents stay tied to your account",
];

const commitments = [
  {
    title: "Statutory accuracy",
    body: "Every AI response names the sections and acts it relies on, so you can check them yourself.",
  },
  {
    title: "Clear storage choices",
    body: "Documents are processed for analysis. Signed-in users can open saved analysis history in their account.",
  },
  {
    title: "Advocate empowerment",
    body: "We prepare you for an informed conversation with your lawyer. We don’t replace one.",
  },
];

const tile =
  "group relative flex flex-col overflow-hidden rounded-2xl p-6 sm:p-8 transition-shadow duration-200 hover:shadow-hover-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const tileLight =
  "border border-forest-200 bg-card dark:border-forest-700/60 dark:bg-forest-900";

function TileLink({ label }: { label: string }) {
  return (
    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold">
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-forest-50 text-forest-950 dark:bg-forest-950 dark:text-forest-50">
      {/* Hero: deep forest in both themes, with the chakra drawing itself in behind */}
      <section className="relative overflow-hidden bg-forest-950 text-forest-50 dark:border-b dark:border-forest-800">
        <Chakra className="pointer-events-none absolute -right-48 -top-40 h-[46rem] w-[46rem] text-gold-400/[0.13] sm:-right-32 lg:-right-24 lg:-top-48 lg:h-[56rem] lg:w-[56rem]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_85%_20%,rgba(184,134,11,0.14),transparent_70%)]"
        />

        <div className="container relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          <div className="space-y-8">
            <div className="space-y-5">
              <h1 className="text-balance font-display text-4xl font-semibold leading-[1.06] tracking-tight text-forest-50 sm:text-5xl xl:text-[3.5rem]">
                Tell us what happened. We’ll help you find your next step.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-forest-100/80 sm:text-lg">
                Understand your rights, review a contract, prepare for a hearing, or reach official legal-aid services, with the law behind every answer.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button
                asChild
                size="lg"
                className="group border border-gold-300/40 bg-gold-500 px-6 font-bold text-forest-950 shadow-[0_0_32px_rgba(184,134,11,0.35)] transition-all duration-200 hover:bg-gold-400 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-gold-300"
              >
                <a href="#choose-your-situation" className="flex items-center gap-2">
                  <span>Get a clear next step</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Link
                href="/simplify"
                className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-gold-300 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              >
                Review a contract instead <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <ul className="space-y-2.5 border-t border-forest-100/15 pt-6 text-sm text-forest-100/80">
              {heroPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <IssueIntake />
        </div>
      </section>

      {/* Statutes the answers draw on */}
      <section className="border-b border-forest-200 bg-forest-100 dark:border-forest-800 dark:bg-forest-900">
        <div className="container mx-auto flex max-w-6xl flex-col gap-x-8 gap-y-3 px-4 py-6 sm:px-6 lg:flex-row lg:items-center">
          <p className="shrink-0 text-sm font-semibold text-forest-950 dark:text-forest-50">
            Answers draw on Indian law
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-forest-800/85 dark:text-forest-100/75">
            {statutes.map((name) => (
              <li key={name} className="flex items-center gap-2">
                <span aria-hidden="true" className="font-display text-gold-700 dark:text-gold-400">
                  §
                </span>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Showpiece: an annotated clause */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl space-y-3 sm:mb-14">
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-forest-950 dark:text-forest-50 sm:text-4xl">
              Most agreements hide the clause that costs you.
            </h2>
            <p className="text-base leading-relaxed text-forest-800/80 dark:text-forest-100/75">
              Tap a highlighted clause to see what BharatLegal tells you: how risky it is, what it means in plain words, and what the law says.
            </p>
          </div>
          <ClauseDemo />
        </div>
      </section>

      {/* The rest of the toolkit */}
      <section className="bg-forest-100/60 py-16 dark:bg-forest-900/40 sm:py-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl space-y-3 sm:mb-14">
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-forest-950 dark:text-forest-50 sm:text-4xl">
              From the first question to the final hearing.
            </h2>
            <p className="text-base leading-relaxed text-forest-800/80 dark:text-forest-100/75">
              Built for Indian citizens, consumers, tenants, and small businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Chatbot */}
            <Link href="/chat" className={`${tile} ${tileLight} md:col-span-2 md:flex-row md:gap-8`}>
              <div className="flex flex-1 flex-col">
                <h3 className="font-display text-2xl font-semibold text-forest-950 dark:text-forest-50">
                  AI Legal Chatbot
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-forest-800/80 dark:text-forest-100/75 sm:text-base">
                  Ask in plain language. Get explanations grounded in the Bharatiya Nyaya Sanhita and the procedure code, with precise section citations.
                </p>
                <TileLink label="Open the chatbot" />
              </div>
              <div className="mt-8 flex flex-1 flex-col justify-center gap-3 md:mt-0" aria-hidden="true">
                <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-forest-800 px-4 py-2.5 text-sm text-forest-50 dark:bg-forest-700">
                  Can the police arrest me without a warrant?
                </p>
                <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-forest-200 bg-forest-50 px-4 py-3 text-sm leading-relaxed text-forest-950 dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50">
                  In some cases, yes. The police can arrest without a warrant only in situations the law lists, and they must tell you the grounds.
                  <span className="mt-2 inline-block rounded bg-gold-200 px-2 py-0.5 text-xs font-semibold text-gold-900 dark:bg-gold-500/25 dark:text-gold-200">
                    BNSS Section 35
                  </span>
                </div>
              </div>
            </Link>

            {/* Case tracker */}
            <Link href="/dashboard" className={`${tile} ${tileLight}`}>
              <h3 className="font-display text-2xl font-semibold text-forest-950 dark:text-forest-50">
                Case Tracker
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-forest-800/80 dark:text-forest-100/75 sm:text-base">
                Keep case stages, hearing reminders, and milestone notes in one organized dashboard.
              </p>
              <ol className="relative mt-6 space-y-3 border-l border-forest-300 pl-5 text-sm dark:border-forest-600" aria-hidden="true">
                <li className="relative text-forest-800/70 dark:text-forest-100/60">
                  <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-forest-500" />
                  Notice received
                </li>
                <li className="relative text-forest-800/70 dark:text-forest-100/60">
                  <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-forest-500" />
                  Reply filed
                </li>
                <li className="relative font-semibold text-forest-950 dark:text-forest-50">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-gold-500 ring-4 ring-gold-500/20" />
                  Hearing in 12 days
                </li>
              </ol>
              <TileLink label="Track cases" />
            </Link>

            {/* Rights visualizer */}
            <Link href="/rights" className={`${tile} ${tileLight}`}>
              <h3 className="font-display text-2xl font-semibold text-forest-950 dark:text-forest-50">
                Rights Visualizer
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-forest-800/80 dark:text-forest-100/75 sm:text-base">
                See your statutory rights laid out for the situations people actually face.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-hidden="true">
                {["Arrest & detention", "Property & tenancy", "Consumer disputes", "Workplace"].map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-forest-300 bg-forest-50 px-3 py-1 text-xs font-medium text-forest-800 dark:border-forest-600 dark:bg-forest-950 dark:text-forest-100"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <TileLink label="Explore your rights" />
            </Link>

            {/* Find legal help: the one filled tile */}
            <Link
              href="/help"
              className={`${tile} bg-forest-800 text-forest-50 dark:border dark:border-forest-700/60 dark:bg-forest-800 md:col-span-2`}
            >
              <Chakra className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 text-gold-400/15" still />
              <h3 className="relative font-display text-2xl font-semibold text-white">Find Legal Help</h3>
              <p className="relative mt-3 max-w-lg text-sm leading-relaxed text-forest-100/85 sm:text-base">
                Reach verified District and State Legal Services Authorities, which offer free legal aid under the Legal Services Authorities Act, 1987.
              </p>
              <span className="relative mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-gold-300">
                Find assistance
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why we built it */}
      <section className="bg-forest-950 py-16 text-forest-50 dark:border-y dark:border-forest-800 sm:py-24">
        <div className="container mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-6 lg:col-span-7">
            <p className="font-display text-7xl font-semibold leading-none tracking-tight text-gold-400 sm:text-8xl">
              4.5 crore
            </p>
            <h2 className="text-balance font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">
              court cases are pending in India, and millions of people sign leases, bonds, and loan agreements without understanding the fine print.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-forest-100/80">
              Most legal AI is trained on US and UK law. BharatLegal was built to decode the Indian justice system and close the gap between statutory language and the people it governs.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-forest-400/60 bg-transparent font-medium text-white hover:border-gold-400 hover:bg-forest-900 hover:text-white focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <Link href="/about" className="flex items-center gap-2">
                Read our full story <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <dl className="divide-y divide-forest-100/15 border-y border-forest-100/15 lg:col-span-5 lg:self-center">
            {commitments.map((c) => (
              <div key={c.title} className="py-5">
                <dt className="font-display text-lg font-semibold text-white">{c.title}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-forest-100/75">{c.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-forest-950 dark:text-forest-50 sm:text-5xl">
              Know where you stand before you sign, reply, or appear.
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-forest-800/80 dark:text-forest-100/75">
              Ask the chatbot, check your rights, or find free legal aid in your state.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                asChild
                size="lg"
                className="bg-gold-500 px-6 font-bold text-forest-950 shadow-sm hover:bg-gold-400 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-gold-700"
              >
                <Link href="/chat">Start a free consultation</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-forest-800 bg-transparent px-6 font-semibold text-forest-800 hover:bg-forest-100 hover:text-forest-950 dark:border-forest-600 dark:text-forest-100 dark:hover:bg-forest-800 dark:hover:text-forest-50"
              >
                <Link href="/help">Find free legal aid</Link>
              </Button>
            </div>
          </div>
          <div className="lg:text-right">
            <p lang="hi" className="font-devanagari text-5xl font-semibold leading-tight text-forest-800 dark:text-gold-400 sm:text-6xl">
              न्याय सबके लिए
            </p>
            <p className="mt-2 text-sm text-forest-800/70 dark:text-forest-100/60">Justice for everyone</p>
          </div>
        </div>
      </section>
    </div>
  );
}
