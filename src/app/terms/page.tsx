import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · DUD",
  robots: { index: true, follow: true },
};

// Публичные условия использования (нужны для доверия и стора).
// Доступны без входа (см. PUBLIC_PATHS в middleware). Английский — базовый.
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-10 text-[14px] leading-relaxed text-ink">
      <a href="/" className="text-sm font-semibold text-accent">← DUD</a>
      <h1 className="mt-4 text-2xl font-bold">Terms of Service</h1>
      <p className="mt-1 text-[12.5px] text-muted">Last updated: 15 June 2026</p>

      <p className="mt-5">
        Welcome to DUD (“Domā un Dari”, the “App”, https://dud.lv). By creating an account or using
        the App you agree to these Terms. If you don’t agree, please don’t use the App. Contact:{" "}
        <a className="text-accent" href="mailto:toliashvili@gmail.com">toliashvili@gmail.com</a>.
      </p>

      <Section title="What DUD is">
        <p>
          DUD helps people nearby find each other to do activities together. You post a “wish” (an
          activity, place and time), see others with matching wishes, form a team and chat to arrange
          a meetup. DUD only connects people — it does not organize, supervise or take part in any
          meetup.
        </p>
      </Section>

      <Section title="Who can use it">
        <p>
          You must be at least 16 years old and able to enter into these Terms. You are responsible
          for keeping your account secure and for everything done through it.
        </p>
      </Section>

      <Section title="Your conduct">
        <ul className="list-disc space-y-1 pl-5">
          <li>Be respectful. No harassment, hate speech, threats, spam or illegal activity.</li>
          <li>Provide truthful profile information and honest attendance/ratings.</li>
          <li>Don’t impersonate others or collect other people’s data.</li>
          <li>Don’t use the App to promote violence or unlawful acts.</li>
        </ul>
        <p className="mt-2">
          We may suspend or remove accounts that break these rules. You can block users and send
          private reports to moderators inside the App.
        </p>
      </Section>

      <Section title="Meetups happen at your own risk">
        <p>
          Meetups are arranged and attended <b>entirely between users</b>. DUD does not verify users’
          identity, background or intentions and is <b>not responsible</b> for what happens before,
          during or after a meetup. Use common sense: meet in public places, tell someone where you
          are going, and stop if you feel unsafe. You participate at your own risk.
        </p>
      </Section>

      <Section title="Content">
        <p>
          You keep ownership of what you post (profile text, messages). By posting, you allow us to
          show it to other users as needed to run the service. Don’t post content you don’t have the
          right to share.
        </p>
      </Section>

      <Section title="Availability & changes">
        <p>
          The App is provided “as is”, without warranties. We may change, suspend or stop features at
          any time. We may update these Terms; the “Last updated” date shows the latest version, and
          continued use means you accept the changes.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the extent permitted by law, DUD and its team are not liable for any indirect or
          incidental damages, or for the conduct of other users or the outcome of any meetup.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          You can delete your account at any time (contact us). We may suspend or terminate access if
          you break these Terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these Terms:{" "}
          <a className="text-accent" href="mailto:toliashvili@gmail.com">toliashvili@gmail.com</a>.
          See also our{" "}
          <a className="text-accent" href="/privacy">Privacy Policy</a>.
        </p>
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
