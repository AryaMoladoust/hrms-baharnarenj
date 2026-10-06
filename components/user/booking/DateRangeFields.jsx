'use client';

import { useState } from 'react';
import DateField from '@/components/user/booking/DateField';
import DateRangeSheet from '@/components/user/booking/DateRangeSheet';
import { usePreferences } from '@/components/providers/Preferences';

// Two date cards (check-in, check-out) plus the calendar sheet they open. Renders a fragment so the parent controls the layout.
export default function DateRangeFields({ range }) {
  const { t, lang } = usePreferences();
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState('in');
  const openAs = (which) => { setPicking(which); setOpen(true); };

  return (
    <>
      <DateField label={t('checkIn')} hint={range.checkIn && range.checkIn === range.minCheckIn ? t('today') : ''} value={range.checkIn} onOpen={() => openAs('in')} lang={lang} />
      <DateField label={t('checkOut')} hint={t('nights', { n: range.nights })} value={range.checkOut} onOpen={() => openAs('out')} lang={lang} />
      <DateRangeSheet open={open} picking={picking} onPicking={setPicking} range={range} onClose={() => setOpen(false)} />
    </>
  );
}
