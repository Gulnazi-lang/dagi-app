import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Child Safety Standards · DUD",
  robots: { index: true, follow: true },
};

export default function ChildSafetyPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-10 text-[14px] leading-relaxed text-ink">
      <a href="/" className="text-sm font-semibold text-accent">← DUD</a>
      <h1 className="mt-4 text-2xl font-bold">Child Safety Standards</h1>
      <p className="mt-1 text-[12.5px] text-muted">Last updated: 26 June 2026</p>

      <p className="mt-5">
        DUD ("Domā un Dari", the "App", available at https://dud.lv) is a social app that
        helps adults find people nearby for activities. DUD is intended exclusively for users
        aged 18 and older. This page describes our standards and practices to prevent child
        sexual abuse and exploitation (CSAE).
      </p>

      <Section title="Age restrictions">
        <p>
          DUD is strictly for users aged 18 and over. During registration we require users to
          confirm they meet this minimum age requirement. Accounts that we determine belong to
          minors will be terminated immediately.
        </p>
      </Section>

      <Section title="Prohibited content">
        <p>The following content is strictly prohibited on DUD:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Any content that sexually exploits or abuses minors (CSAM).</li>
          <li>Any content that grooms, solicits, or attempts to exploit children.</li>
          <li>Any communication intended to facilitate access to minors for exploitation.</li>
        </ul>
      </Section>

      <Section title="Reporting child safety concerns">
        <p>
          Users can report child safety concerns directly inside the app using the report
          function available on every user profile and in every chat. Reports are reviewed
          promptly by our moderation team.
        </p>
        <p className="mt-3">
          You may also contact us directly by email:{" "}
          <a className="text-accent" href="mailto:toliashvili@gmail.com">toliashvili@gmail.com</a>.
        </p>
        <p className="mt-3">
          Any confirmed CSAM is reported immediately to the National Center for Missing &amp;
          Exploited Children (NCMEC) CyberTipline and to the relevant national authorities in
          accordance with applicable law.
        </p>
      </Section>

      <Section title="Compliance">
        <p>
          DUD complies with all applicable child safety laws and regulations, including but not
          limited to the requirements of the jurisdictions in which the App is available. We
          cooperate fully with law enforcement investigations relating to child safety.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For questions or concerns about child safety on DUD, please contact:{" "}
          <a className="text-accent" href="mailto:toliashvili@gmail.com">toliashvili@gmail.com</a>.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="text-[15px] font-bold">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
