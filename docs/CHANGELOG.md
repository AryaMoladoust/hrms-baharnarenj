# Changelog

## 2026-10-04 — Project memory foundation
- Added repository-wide AI guidance in `.github/copilot-instructions.md`.
- Added path-specific instructions for frontend, backend/domain, and documentation work.
- Added `AGENTS.md` as a concise entry point for AI agents.
- Added persistent project documents under `docs/`.
- Added `jsconfig.json` for the `@/*` import alias.
- Kept the starter intentionally backend-light; database/payment/auth modules remain scaffolds until implemented.

## Architecture decisions carried forward
- Customer and owner areas are separate.
- Business logic must remain independent from presentation.
- CSS Modules are preferred; global CSS stays small.
- Five units: بهار، تابستان، پاییز، زمستان، سوئیت.
- Customer reservation retrieval does not use OTP by default.
- Reservation retrieval must have anti-enumeration/rate-limit protections.
- Static room images can later migrate to object storage without changing the room UI contract.

## 2026-10-05 — Homepage Hero v1
- Added reusable user Header component.
- Added mobile-first homepage hero with guesthouse image, Persian copy, and booking date card.
- Check-in defaults to today and check-out defaults to tomorrow.
- Kept styles component-scoped with CSS Modules.
- Search button is visual only at this stage; availability logic will be connected later.

## 2026-11-04 — Home page: suite grouping, clickable photos, eNamad seal
- Room cards are now rendered by `components/user/room-card/RoomGroups.jsx` (used by the home page and `/rooms`): the four seasonal rooms form one labelled group, and the suite sits below a dashed divider that says it is a separate unit.
- Fixed: tapping a room's photo did nothing. The photo (`.img`, `z-index: 1`) sat above the stretched link of the card name. The link overlay is now `z-index: 2` and the "free nights" links inside the card `z-index: 3` (`RoomTile.module.css`).
- Added `components/user/footer/Footer.jsx` (brand line + eNamad trust seal). The seal addresses live in `lib/site.js` (`SITE.enamad`). The footer is rendered at the bottom of the home page by `AboutSection`.
- New i18n keys (fa + en): `roomsSeasonalTitle`, `roomsSeasonalText`, `roomsSuiteDivider`, `enamadAlt`.

