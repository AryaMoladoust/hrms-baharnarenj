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
- lantern theme toggle
- real guesthouse hero image
- date search/booking area
- room cards
- about/features/contact information

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

## Owner panel
Mobile-first. Most daily usage is expected to happen on a phone. Keep actions obvious, cards touch-friendly, and reports readable on small screens.

## CSS architecture
- `app/globals.css`: only global reset, root variables, base body/document rules.
- `*.module.css`: page/component-specific styling.
- Do not put all pages into one stylesheet.
- Avoid inline styles for reusable UI.
