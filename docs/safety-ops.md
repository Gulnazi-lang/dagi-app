# DUD Safety Operations

## Complaint Handling

### How users report
- In-app: profile card → 🚫 block button (auto-hides the person from future matches)
- Email: safety@dud.lv (forward to ops inbox)

### SLA
| Priority | Criteria | Response |
|----------|----------|----------|
| P1 — urgent | Threat of violence, minor involved | 4 h review, ban within 24 h |
| P2 — serious | Harassment, explicit unsolicited content | 48 h review |
| P3 — dispute | No-show, rude behavior, spam | 7 d review |

### Review steps
1. Read the complaint + check any chat history via Supabase → `teams`, `messages` tables
2. Check user's report count: `select count(*) from reports where target_id = '<uid>'`
3. Decision: warn / temporary ban / permanent ban
4. Execute ban: set `profiles.banned = true` (add column if not yet) — user can no longer log in
5. Reply to reporter within SLA window

---

## Ban Criteria

| Action | Consequence |
|--------|-------------|
| 3+ no-shows (confirmed by other team members) | 7-day ban |
| Harassment in chat | Permanent ban |
| Fake profile / bot | Permanent ban |
| Sharing explicit content | Permanent ban |
| Violent threats | Permanent ban + report to authorities if needed |

---

## No-Show Abuse

A no-show = user joined a team but didn't attend without cancelling.

**Detection:** After an event, team members rate each other. A "didn't come" rating counts as a no-show.

**Thresholds:**
- 2 no-shows → warning notification
- 3 no-shows in 30 days → 7-day ban
- 5 no-shows total → permanent ban

**Appeal:** user can email safety@dud.lv within 14 days.

---

## Harassment Policy

Any unwanted contact (outside the shared activity context) is harassment:
- Repeated messages after the other person left the team
- Asking for personal contact details after explicit refusal
- Offensive comments about gender, ethnicity, religion, appearance

**Response:** permanent ban on first confirmed harassment report.

---

## Country Rollout — Data & Safety Notes

| Market | Launch | Notes |
|--------|--------|-------|
| Latvia (LV) | Live | GDPR applies |
| Georgia (GE) | ~11 July 2026 | Georgian PDL applies (similar to GDPR); safety@dud.lv covers both |
| Germany (DE) | TBD | GDPR + German NetzDG (platform reporting obligations kick in at 2M users) |
| Global EN | TBD | US COPPA: do not knowingly allow under-13 users |

---

## Contacts

- Safety inbox: safety@dud.lv (monitored by founder during MVP phase)
- Supabase dashboard: app DB for user lookup
- Play Console: suspend app listing if critical safety issue arises before a fix is deployed
