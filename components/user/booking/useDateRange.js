'use client';

import { useEffect, useState } from 'react';
import { addDays, nightsBetween, toInputDate } from '@/lib/dates';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

// Today -> tomorrow by default, or the dates passed in the URL. Set on the client so the visitor's timezone decides "today".
export function useDateRange(initial = {}) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    const today = toInputDate(new Date());
    const from = ISO.test(initial.checkIn || '') && initial.checkIn >= today ? initial.checkIn : today;
    const to = ISO.test(initial.checkOut || '') && initial.checkOut > from ? initial.checkOut : addDays(from, 1);
    setCheckIn(from);
    setCheckOut(to);
  }, [initial.checkIn, initial.checkOut]);

  const changeCheckIn = (value) => {
    if (!value) return;
    setCheckIn(value);
    if (checkOut <= value) setCheckOut(addDays(value, 1));
  };
  const changeCheckOut = (value) => value && setCheckOut(value);

  const ready = Boolean(checkIn && checkOut);
  return {
    checkIn, checkOut, ready,
    nights: ready ? nightsBetween(checkIn, checkOut) : 1,
    minCheckIn: toInputDate(new Date()),
    minCheckOut: ready ? addDays(checkIn, 1) : undefined,
    changeCheckIn, changeCheckOut,
  };
}
