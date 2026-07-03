# Subutai Salon Front Desk Demo

A dependency-free browser demo for a Newo.ai-style AI receptionist workflow.

The demo models a small salon AI employee that:

- answers high-intent missed calls,
- qualifies booking requests,
- uses a small business knowledge base,
- escalates risky cases,
- logs a staff handoff summary,
- estimates revenue protected.

## Run Locally

Open `index.html` in a browser.

No build step is required.

## Demo Story

Business: Maple & Main Studio, a small salon.

Problem: Staff miss calls while serving clients. Callers looking to book now become lost revenue when nobody answers.

AI employee mission:

- capture caller name and phone,
- identify intent and service,
- answer pricing and policy questions from known business rules,
- simulate booking against available slots,
- escalate complaints, refunds, allergies, and color corrections,
- produce a staff summary with next action and estimated lead value.

## Newo Platform Mapping

- Agent: salon receptionist persona and job role.
- AKB: services, pricing, hours, policies, and escalation rules.
- Flows: booking, FAQ, reschedule, complaint, and handoff paths.
- Skills: detail extraction, knowledge lookup, summarization, confirmation.
- Connectors: sandbox, web chat, voice, SMS, calendar, CRM/webhook.
- Analytics: captured lead, appointment request, escalation, revenue protected.

## Suggested Next Step

Recreate this behavior in Newo Vibe Creator, then test in Sandbox before enabling voice.
