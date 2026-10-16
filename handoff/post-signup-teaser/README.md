# Post-sign-up teaser — hand-off for Claude Code

What this is: the screen a new founding member sees right after sign-up, while the
product is not live yet. ALMA walks them through four drawn screens (My company,
ESG questionnaire, ESG dashboard, Ecosystem) and offers one email on launch day. Nothing else can be done at this stage: there is no
company page to go to.

Reference implementation: `landing_page_v3/my-company.html` in this repo (search
for `teaser`). The three files beside this README are the same code, extracted so
it can be read and ported without the rest of the prototype:

| File          | What it holds                                                                                  |
|---------------|------------------------------------------------------------------------------------------------|
| `teaser.css`  | All teaser styles, on the design-system tokens (`--color-*`, `--ease-brand`, `--radius-pill`)  |
| `teaser.html` | The overlay markup: header with ALMA, the browser frame with 4 drawn screens, copy, the form   |
| `teaser.js`   | `teaser(fallback)`: stepping, the email field and its edit, validation, the done state, toast  |

## Where it sits in the flow

```
checkout → Welcome step (register.html#done) → my-company.html?page&welcome
   → founding-member thank-you (sphere)  button: "See what's coming"
   → TEASER (this)                       ends here until launch
```

Prototype wiring, in `my-company.html`:

```js
welcome(() => teaser(reveal), `<b>${name}</b>, your founding seat is saved. Next, let me show you what's coming soon.`)
```

`teaser()` clones ALMA's sphere composition from the page's `#empty .alma-media`
(`source`), so the real app needs its own ALMA component in `#teaser-alma` and in
the small `.m-alma .alma-media` inside screen 2.

## Behaviour to keep

- A "Log out" button fixed to the bottom of the screen, centred, dark: the only way out
  until launch. It signs the member out and goes back to the landing page. The tour keeps
  7.5rem of room at the bottom so the button never covers the form.
- Four screens, one visible at a time. Dots, prev/next arrows and ←/→ keys step
  through; the URL bar in the drawn frame changes with each (`data-url`).
- The footer form: one email field with the coral button under it, both flush
  right with the divider above them. The field is pre-filled with the sign-up
  email and locked (sunken fill, no border); a pencil icon inside it, on the
  right, unlocks it for a correction. With no email known it starts unlocked.
  Leaving the field with a valid address locks it again. Email only: there is no
  text-message option.
- Validation on submit: email regex. Error shows under the field, right-aligned,
  in `--color-critical`, never a browser alert; the field unlocks to fix it.
- On a valid submit: the form becomes the `You are on the list` chip, the note
  names the address, and a toast (ALMA's existing `.alma-toast` card from
  `css/esg.css`) says the same, dismissable, gone by itself after 8 s.
- Nothing is persisted in the prototype. In production, the submit is one API
  call: `{ email: string }`, scoped to the signed-in member.
- `prefers-reduced-motion` turns every transition off (already in the CSS).
- Phone layout: header stacks, the frame goes above the copy, the field and button go
  full width. Drawn screens scale with the frame
  (`container-type: inline-size`, `cqw` font size), so no breakpoints inside them.

## Copy (final)

- Eyebrow: ALMA
- Title: *While we get the doors open,* here is what is waiting for you.
- Lead: Four screens, and what your documents will turn into once we open.
- Screens: One page for everything about your company. / You bring the documents.
  I draft the answers. / A score, the red flags, and a plan. / Clients and suppliers,
  already here. (bodies in `teaser.html`)
- Note: **Going live for founding members first.** One email the day it opens,
  nothing else.
- Button: Notify me when it goes live → chip: You are on the list
- Toast: **You are on the list** — One email to *{address}*
  the day C‑MORE opens for founding members. Nothing else.
- Do not mention how many questions a questionnaire has; that is not fixed.

## Porting notes for the Laravel / Flux app

- The design system's tokens are the same names the prototype uses; the CSS
  should drop in once the token file is loaded. The two things it reaches outside
  itself for: `@keyframes rise` and `@keyframes alma-arrive` (intake step), and
  `.alma-toast`, `.dlg-alma`, `.dlg-x`, `@keyframes dlg-in` (esg.css). Copy those
  four small rules along if the target page does not have them.
- Natural split into components: `Teaser` (overlay + stepping), `TeaserScreen`
  ×4 (the drawn mockups, pure markup), `LaunchNotify` (the form, the chip, the
  toast). The drawn screens are static; only the form has state.
- The segmented toggle maps to Flux's radio group / `flux:radio.group variant="segmented"`;
  the address field to `flux:input`; the button to the primary button variant.
- Keep the drawn screens as markup, not images: they must follow the tokens in
  dark mode and any rebrand.
