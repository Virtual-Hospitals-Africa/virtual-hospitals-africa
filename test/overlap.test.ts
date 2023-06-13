import { assertEquals } from "std/testing/asserts.ts";
import { validateNoOverlap } from "../islands/set-availability-form.tsx";
import { AvailabilityJSON } from '../types.ts'

//no overlap : single time slot
Deno.test("validateNoOverlap should return null for non-overlapping time slots", () => {
    const input: AvailabilityJSON = {
      Sunday: [],
      Monday: [{start: { hour: 9, minute: 0, amPm: 'am' }, end: { hour: 5, minute: 0, amPm: 'pm' }}],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };
  
    const result = validateNoOverlap(input);
  
    assertEquals(result, null);
  });

  //no overlap : same time on different days
  Deno.test("validateNoOverlap should return null for non-overlapping time slots", () => {
    const input: AvailabilityJSON = {
      Sunday: [],
      Monday: [{start: { hour: 9, minute: 0, amPm: 'am' }, end: { hour: 5, minute: 0, amPm: 'pm' }}],
      Tuesday: [],
      Wednesday: [{start: { hour: 10, minute: 0, amPm: 'am' }, end: { hour: 12, minute: 0, amPm: 'pm' }}],
      Thursday: [],
      Friday: [],
      Saturday: [{start: { hour: 9, minute: 0, amPm: 'am' }, end: { hour: 5, minute: 0, amPm: 'pm' }}],
    };
  
    const result = validateNoOverlap(input);
  
    assertEquals(result, null);
  });

  //overlap:partially pattern 1 (9am-5pm and 4pm-6pm)
  Deno.test("validateNoOverlap should return overlapping times for partially overlapping time slots", () => {
    const input: AvailabilityJSON = {
      Sunday: [],
      Monday: [
        {start: { hour: 9, minute: 0, amPm: 'am' }, end: { hour: 5, minute: 0, amPm: 'pm' }},
        {start: { hour: 4, minute: 0, amPm: 'pm' }, end: { hour: 6, minute: 0, amPm: 'pm' }}
      ],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };
  
    const expectedOutput: AvailabilityJSON = {
      Sunday: [],
      Monday: [
        {start: { hour: 9, minute: 0, amPm: 'am' }, end: { hour: 5, minute: 0, amPm: 'pm' }},
        {start: { hour: 4, minute: 0, amPm: 'pm' }, end: { hour: 6, minute: 0, amPm: 'pm' }}
      ],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };
  
    const result = validateNoOverlap(input);
  
    assertEquals(result, expectedOutput);
  });

//overlap:partially pattern 2 (3pm-6pm and 10am-5pm)
  Deno.test("validateNoOverlap should return overlapping times for partially overlapping time slots", () => {
    const input: AvailabilityJSON = {
      Sunday: [],
      Monday: [],
      Tuesday: [{start: { hour: 3, minute: 0, amPm: 'pm' }, end: { hour: 6, minute: 0, amPm: 'pm' }}, 
      {start: { hour: 10, minute: 0, amPm: 'am' }, end: { hour: 5, minute: 0, amPm: 'pm' }}],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };
  
    const expectedOutput: AvailabilityJSON = {
        Sunday: [],
        Monday: [],
        Tuesday: [{start: { hour: 3, minute: 0, amPm: 'pm' }, end: { hour: 6, minute: 0, amPm: 'pm' }}, 
        {start: { hour: 10, minute: 0, amPm: 'am' }, end: { hour: 5, minute: 0, amPm: 'pm' }}],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
    };
  
    const result = validateNoOverlap(input);
  
    assertEquals(result, expectedOutput);
  });

  //overlap : partially pattern 3 (10am-3pm and 11am-2pm)

  Deno.test("validateNoOverlap should return overlapping times for partially overlapping time slots", () => {
    const input: AvailabilityJSON = {
      Sunday: [],
      Monday: [],
      Tuesday: [{start: { hour: 10, minute: 0, amPm: 'am' }, end: { hour: 3, minute: 0, amPm: 'pm' }}, 
      {start: { hour: 11, minute: 0, amPm: 'am' }, end: { hour: 2, minute: 0, amPm: 'pm' }}],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };
  
    const expectedOutput: AvailabilityJSON = {
        Sunday: [],
        Monday: [],
        Tuesday: [{start: { hour: 10, minute: 0, amPm: 'am' }, end: { hour: 3, minute: 0, amPm: 'pm' }}, 
        {start: { hour: 11, minute: 0, amPm: 'am' }, end: { hour: 2, minute: 0, amPm: 'pm' }}],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
    };
  
    const result = validateNoOverlap(input);

    assertEquals(result, expectedOutput);
  });

  //ovelap : completely same time
  Deno.test("validateNoOverlap should return overlapping times for partially overlapping time slots", () => {
    const input: AvailabilityJSON = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [{start: { hour: 10, minute: 0, amPm: 'am' }, end: { hour: 11, minute: 0, amPm: 'am' }}, 
      {start: { hour: 10, minute: 0, amPm: 'am' }, end: { hour: 11, minute: 0, amPm: 'am' }}],
    };
  
    const expectedOutput: AvailabilityJSON = {
        Sunday: [],
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [{start: { hour: 10, minute: 0, amPm: 'am' }, end: { hour: 11, minute: 0, amPm: 'am' }}, 
        {start: { hour: 10, minute: 0, amPm: 'am' }, end: { hour: 11, minute: 0, amPm: 'am' }}],
    };
  
    const result = validateNoOverlap(input);
  
    assertEquals(result, expectedOutput);
  });

  