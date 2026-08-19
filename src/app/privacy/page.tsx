import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · DUD",
  robots: { index: true, follow: true },
};

// Публичная страница политики конфиденциальности (нужна для Google Play и в целом).
// Доступна без входа (см. PUBLIC_PATHS в middleware). Английский — как базовый;
// перевод можно добавить позже.
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-10 text-[14px] leading-relaxed text-ink">
      <a href="/" className="text-sm font-semibold text-accent">← DUD</a>
      <h1 className="mt-4 text-2xl font-bold">Privacy Policy</h1>
      <p className="mt-1 text-[12.5px] text-muted">Last updated: 15 June 2026</p>

      <p className="mt-5">
        DUD (“Domā un Dari”, the “App”, available at https://dud.lv) helps you find people
        nearby to do activities with. This policy explains what data we collect, why, and your
        rights. The App is operated by the DUD team. Contact:{" "}
        <a className="text-accent" href="mailto:toliashvili@gmail.com">toliashvili@gmail.com</a>.
      </p>

      <Section title="What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Account:</b> your email address (via Google sign-in or email/password).</li>
          <li><b>Profile:</b> name, optional nickname, profile photo, a short “about you” text and
            a structured questionnaire (e.g. preferred time, languages you speak, interests), and
            your <b>city and district</b>.</li>
          <li><b>Activities (“wishes”):</b> the activity, date, time, city/district and search
            radius you choose.</li>
          <li><b>Reputation:</b> attendance and 👍/👌/👎 ratings other participants give after a
            meetup.</li>
          <li><b>Notifications:</b> if you enable push notifications, a device push subscription.</li>
          <li><b>Technical:</b> standard server logs needed to run and secure the service.</li>
        </ul>
        <p className="mt-2">
          We deliberately do <b>not</b> collect or show your precise address or GPS location — only
          city and district.
        </p>
      </Section>

      <Section title="How we use your data">
        <ul className="list-disc space-y-1 pl-5">
          <li>To match you with nearby people who want the same activity at a compatible time.</li>
          <li>To show your profile (name/nickname, photo, “about”, questionnaire, rating) to people
            you match with, so you can decide whether to team up.</li>
          <li>To send you notifications about invitations and chat messages (only if enabled).</li>
          <li>To keep the service safe (blocking, abuse reports).</li>
        </ul>
      </Section>

      <Section title="Who can see your data">
        <p>
          Your profile is visible to other signed-in users you match with (same activity, place and
          time). We do <b>not</b> sell your data and do <b>not</b> share it with advertisers. Data is
          stored and processed using <b>Supabase</b> (hosted in the EU) and emails are sent via{" "}
          <b>Brevo</b>. These providers process data on our behalf.
        </p>
      </Section>

      <Section title="Your rights (GDPR)">
        <p>
          You can access, correct or delete your data at any time. You can edit your profile and
          delete your wishes in the App. To delete your account and all associated data, contact{" "}
          <a className="text-accent" href="mailto:toliashvili@gmail.com">toliashvili@gmail.com</a>{" "}
          and we will remove it. You also have the right to lodge a complaint with your data
          protection authority.
        </p>
      </Section>

      <Section title="Data retention & security">
        <p>
          We keep your data while your account is active. When you delete your account, your profile,
          wishes and related data are removed. Connections are encrypted (TLS). Access to data is
          restricted by row-level security.
        </p>
      </Section>

      <Section title="Children">
        <p>DUD is not intended for children under 16. If you believe a child has provided us data,
          contact us and we will delete it.</p>
      </Section>

      <Section title="Changes">
        <p>We may update this policy. The “Last updated” date above reflects the latest version.</p>
      </Section>

      <p className="mt-8 text-[12.5px] text-muted">DUD — Domā un Dari · https://dud.lv</p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-1.5 text-base font-bold text-accent">{title}</h2>
      {children}
    </section>
  );
}
