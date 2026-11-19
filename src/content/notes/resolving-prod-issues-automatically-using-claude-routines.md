---
title: "Resolving Prod Issues Automatically Using Claude Routines"
description: "A simple setup using Pino, Papertrail, and Claude routines to investigate production 5xx errors and raise pull requests automatically."
date: "2026-11-19"
displayDate: "NOV 19, 2026"
tag: "APPLIED AI"
readTime: "2 MIN READ"
---

## // THE ORIGINAL SETUP

At work, we had a simple setup for production alerts: whenever a service threw a 5xx error, it logged it via `pino`. Those logs were shipped to Papertrail (now SolarWinds Papertrail), and from there we had an alert rule that fired a webhook message into our Google Chat room.

It worked fine to let us know something broke, but someone still had to manually jump in, read through the log, locate the file in the repo, figure out what went wrong, and write a PR to fix it.

## // AUTOMATING IT WITH CLAUDE ROUTINES

We started wondering: instead of just pinging the chat room, could an agent pick up the alert, investigate the issue, and open a pull request for it?

To do this, we hooked into Claude routines. Now, along with sending the usual Google Chat alert, we also trigger a routine with the error details and stack trace.

<div class="pipeline-box">
  <div class="pipeline-step">
    <span class="pipeline-num">[01]</span>
    <span>5xx error occurs &rarr; logged via Pino &rarr; sent to Papertrail</span>
  </div>
  <div class="pipeline-arrow">&darr;</div>
  <div class="pipeline-step">
    <span class="pipeline-num">[02]</span>
    <span>Papertrail fires Google Chat alert + sends error payload to Claude routine</span>
  </div>
  <div class="pipeline-arrow">&darr;</div>
  <div class="pipeline-step">
    <span class="pipeline-num">[03]</span>
    <span>Claude inspects the repo, traces the stack trace, and writes a draft fix</span>
  </div>
  <div class="pipeline-arrow">&darr;</div>
  <div class="pipeline-step">
    <span class="pipeline-num">[04]</span>
    <span>Pushes a branch, opens a draft PR, and replies back in the same Google Chat thread with a summary and the PR link</span>
  </div>
</div>

## // HOW IT ACTUALLY HELPS

When an error drops in the channel now, we get the initial alert first. Shortly after, a reply appears in the thread with a short summary of what happened, what file caused it, and a draft PR ready for review.

It does not blindly merge anything into production. A human still looks over the diff, makes sure the fix makes sense, and merges it. But instead of spending 15 minutes finding the offending line and writing boilerplate, the on-call engineer just reviews the code.
