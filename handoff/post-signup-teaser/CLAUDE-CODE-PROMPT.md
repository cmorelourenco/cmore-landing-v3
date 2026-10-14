# Prompt for Claude Code

Run from the root of the app repo (not this prototype repo), with this folder
reachable, e.g. copied to `design/post-signup-teaser/`. Paste the block below.

---

Implement the post-sign-up teaser screen from the design hand-off in
`design/post-signup-teaser/` (README.md first, then teaser.html, teaser.css,
teaser.js — they are the reference implementation, taken from the prototype
`pillar-design/landing_page_v3/my-company.html`).

Context: C-MORE is not live yet. After a founding member finishes sign-up and
sees the founding-member thank-you screen, the button "See what's coming" opens
this teaser. It is the end of the sign-up flow for now: there is no company page
to continue to. ALMA presents four drawn screens one at a time, and the footer
offers the member one email on launch day.

Do this:

1. Read the hand-off. Keep the copy exactly as written in README.md. Never state
   how many questions a questionnaire has.
2. Build it with our stack and design system: tokens already exist under the
   same names the CSS uses (`--color-coral`, `--color-graphite`, `--ease-brand`,
   `--radius-pill` …). Split into `Teaser` (overlay, stepping, keyboard),
   four static `TeaserScreen` partials (the drawn mockups, markup only, no
   images), and `LaunchNotify` (email field with its edit icon, validation, done
   chip, toast). Use our existing ALMA component where the prototype clones her
   spheres (`#teaser-alma` and the small one inside screen 2).
3. Pre-fill the email from the signed-in member and show it locked, with a
   pencil icon inside the field that unlocks it for a correction. Email only:
   no text-message option.
4. On submit, validate (email regex), then POST
   `{ email }` to a new endpoint on the member's account
   (`launch_notifications` table: member_id, email, created_at, unique on
   member_id). Show the done chip, update the note, show the toast (reuse the
   existing ALMA toast card). If the member already has a row, render the done
   state on load.
5. Wire it into the flow after the founding-member thank-you; rename that
   screen's button to "See what's coming" and its lead to
   "{FirstName}, your founding seat is saved. Next, let me show you what's coming soon."
6. Respect `prefers-reduced-motion`, keyboard access (arrows step, focus
   visible), and the phone layout described in the README.
7. Add tests: validation, pre-fill, the POST payload, the done state on reload.
8. Run the app, open the flow, and screenshot desktop (1280×800) and phone
   (390×844) of screen 1, screen 2, the error state and the toast; attach them
   to the PR.

Open a PR titled "Post-sign-up teaser: ALMA walkthrough + launch notification"
describing what was ported and anything from the hand-off you had to change.
