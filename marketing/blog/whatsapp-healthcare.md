---
draft: true
title: WhatsApp as Healthcare Infrastructure
subtitle: How a messaging app became our primary care delivery channel
author: Will Weiss
slug: whatsapp-healthcare
date: 2025-11-10
description: Why we built our patient care platform on top of WhatsApp and what we learned
tags: tech, product
hero_image: https://images.unsplash.com/photo-1587560699334-cc4ff634909a
---

Africa has over 600 million smartphone users. Nearly all of them have WhatsApp.

When we started building Virtual Hospitals Africa, we had a choice: build a native app and spend six months acquiring users, or meet patients where they already are. The answer was obvious.

## The Infrastructure Layer

WhatsApp isn't just a messaging app — it's the operating system of social life in sub-Saharan Africa. It's how people receive reminders from their children's schools, coordinate with their employers, and stay in touch with family across provinces. Using it as a healthcare delivery channel means we inherit that trust.

## What We Learned

Building on WhatsApp required rethinking what "healthcare software" means. There are no forms, no dashboards, no logins. There's just a conversation.

This forced us to write clinical logic that can express itself in plain language. Our rules engine outputs readable messages, not database rows. Our nurses review conversations, not tables.

## The Tradeoffs

WhatsApp gives us reach. It also gives us constraints. Messages have character limits. Images are compressed. We can't render charts or run JavaScript.

These constraints turned out to be features. They kept us focused on what actually matters: getting the right information to the right patient at the right time.
