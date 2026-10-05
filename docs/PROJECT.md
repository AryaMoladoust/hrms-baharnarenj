# Project — بهارنارنج

## Purpose
A real online reservation system for the guesthouse «بهارنارنج» in Rasht, Gilan. The system has a public customer experience and a separate owner/admin area.

## Accommodation
There are five units:
1. بهار (`bahar`)
2. تابستان (`tabestan`)
3. پاییز (`paeez`)
4. زمستان (`zemestan`)
5. سوئیت (`suite`)

Each room/unit can have its own gallery, availability state, price, and description.

## Customer flow
1. Customer enters the site.
2. Customer selects check-in and check-out dates. Initial defaults are today and tomorrow.
3. Availability is calculated for the selected date range.
4. Reserved units show a clear reserved/unavailable state and, where appropriate, the date they become available.
5. Customer selects a unit and completes the reservation form.
6. Payment is completed through the selected payment gateway.
7. Customer receives a tracking code / reservation result.
8. “رزروهای من” allows a customer to retrieve their reservations using name + national ID, with strong anti-enumeration protections.

## Owner flow
Owner enters through the hamburger menu → «ورود مالک» → owner login → owner dashboard.

Owner capabilities:
- View/manage reservations
- View room status
- Manage rooms and room information
- Change prices and percentage discounts/increases
- Add date-range price rules for seasons/holidays
- Record expenses such as groceries and electricity
- View daily, weekly, monthly, and arbitrary date-range financial reports
- See booking income, expenses, and net/profit
- Receive reservation/payment notifications in the web app

## Pricing
The design should support:
- Base room prices
- Percentage discounts
- Percentage price increases
- Date-range rules for seasonal/holiday pricing
- UI that can show old price, new price, and percentage change when applicable

## Localization and theme
- Persian + English
- RTL Persian / LTR English
- Light + dark theme
- Lantern icon is the visual metaphor for theme switching

## Product quality goals
Mobile-first, especially owner screens. The visual language should be modern and premium with subtle Iranian/Gilani inspiration, not cluttered or old-fashioned.
