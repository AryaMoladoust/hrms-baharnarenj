# UI / UX rules

## Visual direction
Modern, premium, calm, and clean. Iranian/Gilani inspiration should appear through restrained typography, patterns, materials, and color—not through excessive ornament.

Suggested palette direction:
- forest green
- cream
- wood/brown
- gold
- subtle نارنج orange accents

## Customer home
The home page is a single coherent landing/booking experience with:
- hamburger menu
- animated hero arch (`HeroScene`): the courtyard photo with depth layers, tilt, falling petals; motion rules are in the component's comments
- date search/booking area
- room cards
- about/features/contact information
- footer with the eNamad trust seal

Owner login belongs inside the hamburger menu, not as the dominant public header action.

## Room cards
Preferred layout:
```text
┌──────────────┬──────────────┐
│    بهار       │   تابستان    │
├──────────────┼──────────────┤
│    پاییز      │   زمستان     │
└──────────────┴──────────────┘
┌──────────────────────────────┐
│            سوئیت             │
└──────────────────────────────┘
```

Cards should be able to show image, availability, price, old/new price, and discount without becoming visually crowded.

The suite is a separate unit, not a fifth seasonal room. The home page and `/rooms` show the four seasonal rooms under their own heading, then a dashed divider labelled as the suite being separate, then the suite card (`RoomGroups`). The whole card, photo included, opens the room page.

## Owner panel
Mobile-first. Most daily usage is expected to happen on a phone. Keep actions obvious, cards touch-friendly, and reports readable on small screens.

## CSS architecture
- `app/globals.css`: only global reset, root variables, base body/document rules.
- `*.module.css`: page/component-specific styling.
- Do not put all pages into one stylesheet.
- Avoid inline styles for reusable UI.
