const views = {
  intake: "Opportunity Intake",
  template: "Vertical Template Selection",
  build: "Newo Build Plan",
  integrations: "Integration Mapping",
  qa: "QA Test Runner",
  golive: "Go-Live Readiness",
  outcomes: "Outcome Report"
};

const qaItems = [
  { label: "Booking request captures name, phone, service, and preferred time", done: true },
  { label: "Pricing answers come from AKB instead of invented values", done: true },
  { label: "Color correction routes to consultation/human review", done: true },
  { label: "Complaint/refund path escalates without overpromising", done: true },
  { label: "Session-ended staff summary is structured", done: true },
  { label: "Production booking credentials verified", done: false },
  { label: "Inbound phone routing tested end to end", done: false },
  { label: "Fallback human number confirmed", done: false }
];

const vibePrompt = `Create an AI employee for Maple & Main Studio, a salon using Vagaro.

Mission:
- Answer missed calls and web chats.
- Capture caller name, phone, requested service, preferred time, stylist preference, and urgency.
- Answer only from the salon knowledge base for prices, policies, hours, and availability.
- Simulate or create booking requests in Vagaro.
- Send confirmation by SMS.
- Create a CRM lead for marketing follow-up.
- Escalate complaints, refunds, allergy/medical issues, bridal parties, and color corrections.
- End every session with a structured staff summary and estimated revenue protected.

Use the Appointment-Based SMB template:
- booking flow
- pricing FAQ flow
- reschedule/cancel flow
- complaint escalation flow
- session-ended reporting flow`;

const payloads = {
  booking: {
    system: "Vagaro",
    action: "create_booking_request",
    customer: { name: "Monica Ray", phone: "+17735550142", new_client: true },
    service: { name: "Full highlights", duration_minutes: 150, estimated_value: 220 },
    requested_slot: { date: "2026-07-10", time: "15:00", stylist: "Lena" },
    status: "pending_confirmation"
  },
  crm: {
    system: "CRM",
    action: "upsert_lead",
    source: "Subutai AI receptionist",
    contact: { name: "Monica Ray", phone: "+17735550142" },
    tags: ["voice-ai", "full-highlights", "high-intent"],
    next_action: "Send color service nurture sequence"
  },
  sms: {
    system: "SMS",
    action: "send_confirmation",
    to: "+17735550142",
    body: "Maple & Main received your request for full highlights with Lena on Friday at 3:00 PM. We will confirm shortly."
  },
  handoff: {
    system: "Subutai outcome dashboard",
    action: "staff_handoff",
    priority: "normal",
    summary: "New full highlights request captured. Estimated value $220. Confirmation required in Vagaro.",
    owner_next_step: "Confirm or offer alternate time"
  }
};

const scenarios = [
  {
    title: "New haircut booking",
    qa: "Booking capture",
    lead: {
      name: "Tanya Ellis",
      phone: "(312) 555-0188",
      intent: "Book appointment",
      service: "Women's cut",
      outcome: "Appointment requested",
      next: "Confirm Tue 10:00 AM with Ava by SMS",
      value: 75,
      captured: 1,
      booked: 1,
      escalated: 0
    },
    turns: [
      ["caller", "Hi, do you have anything tomorrow for a women's cut?"],
      ["agent", "I can help with that. Are you a new or returning client, and do you have a stylist preference?"],
      ["caller", "New client. No stylist preference. My name is Tanya Ellis."],
      ["agent", "Thanks, Tanya. I have Tue 10:00 AM with Ava for a women's cut. What phone number should I use for the confirmation?"],
      ["caller", "312-555-0188."],
      ["agent", "Perfect. I have your request for Tue 10:00 AM with Ava. I will send the confirmation by SMS and the studio can follow up if anything changes."]
    ]
  },
  {
    title: "High-value color lead",
    qa: "Revenue protection",
    lead: {
      name: "Monica Ray",
      phone: "(773) 555-0142",
      intent: "Price and book",
      service: "Full highlights",
      outcome: "Appointment requested",
      next: "Send Friday 3:00 PM confirmation with prep instructions",
      value: 220,
      captured: 1,
      booked: 1,
      escalated: 0
    },
    turns: [
      ["caller", "I need full highlights this week. What does it cost?"],
      ["agent", "Full highlights start at $220 and usually take about two and a half hours. I can check the next available opening."],
      ["caller", "Friday afternoon would be great. This is Monica."],
      ["agent", "Friday 3:00 PM with Lena is available for highlights. Can I get your phone number for the confirmation?"],
      ["caller", "773-555-0142."],
      ["agent", "Thanks, Monica. I have Friday 3:00 PM with Lena requested for full highlights. I will send a confirmation and prep details by SMS."]
    ]
  },
  {
    title: "Color correction escalation",
    qa: "Escalation boundary",
    lead: {
      name: "Ari Lopez",
      phone: "(708) 555-0199",
      intent: "Urgent color help",
      service: "Color correction consultation",
      outcome: "Human escalation required",
      next: "Route to senior stylist for consultation review",
      value: 200,
      captured: 1,
      booked: 0,
      escalated: 1
    },
    turns: [
      ["caller", "Another salon messed up my hair and I need it fixed."],
      ["agent", "I'm sorry that happened. For color correction, Maple & Main requires a consultation so a senior stylist can assess the safest next step."],
      ["caller", "Can someone call me today? This is Ari."],
      ["agent", "Yes. I will collect your number and route this to a senior stylist as a priority consultation request."],
      ["caller", "708-555-0199."],
      ["agent", "Thanks, Ari. I have escalated this for a human callback. A stylist will review the situation before recommending any correction service."]
    ]
  },
  {
    title: "Complaint and refund",
    qa: "Refund guardrail",
    lead: {
      name: "Denise Carter",
      phone: "(224) 555-0116",
      intent: "Complaint",
      service: "Refund request",
      outcome: "Human escalation required",
      next: "Send manager summary and request callback",
      value: 0,
      captured: 1,
      booked: 0,
      escalated: 1
    },
    turns: [
      ["caller", "I want a refund. My color looks terrible."],
      ["agent", "I'm sorry you're dealing with that. I can make sure a manager gets the details and calls you back. I should not try to resolve a refund without the team reviewing it."],
      ["caller", "Fine. My name is Denise Carter."],
      ["agent", "Thank you, Denise. What number should the manager use?"],
      ["caller", "224-555-0116."],
      ["agent", "I have the request logged for manager follow-up. The salon will review your color concern and contact you directly."]
    ]
  }
];

const state = {
  captured: 0,
  booked: 0,
  escalated: 0,
  revenue: 0,
  timer: null
};

const els = {
  viewTitle: document.querySelector("#viewTitle"),
  pipelineStage: document.querySelector("#pipelineStage"),
  readinessScore: document.querySelector("#readinessScore"),
  readinessMini: document.querySelector("#readinessMini"),
  readinessRing: document.querySelector("#readinessRing"),
  qaPassed: document.querySelector("#qaPassed"),
  revenueProtected: document.querySelector("#revenueProtected"),
  scenario: document.querySelector("#scenario"),
  runScenario: document.querySelector("#runScenario"),
  resetDemo: document.querySelector("#resetDemo"),
  transcript: document.querySelector("#transcript"),
  callState: document.querySelector("#callState"),
  leadValue: document.querySelector("#leadValue"),
  leadName: document.querySelector("#leadName"),
  leadPhone: document.querySelector("#leadPhone"),
  leadIntent: document.querySelector("#leadIntent"),
  leadService: document.querySelector("#leadService"),
  leadOutcome: document.querySelector("#leadOutcome"),
  leadNext: document.querySelector("#leadNext"),
  capturedMetric: document.querySelector("#capturedMetric"),
  bookedMetric: document.querySelector("#bookedMetric"),
  escalatedMetric: document.querySelector("#escalatedMetric"),
  revenueMetric: document.querySelector("#revenueMetric"),
  ownerSummary: document.querySelector("#ownerSummary"),
  qaChecklist: document.querySelector("#qaChecklist"),
  payloadPreview: document.querySelector("#payloadPreview"),
  vibePrompt: document.querySelector("#vibePrompt"),
  exportBrief: document.querySelector("#exportBrief"),
  toast: document.querySelector("#toast")
};

function money(value) {
  return `$${value.toLocaleString()}`;
}

function setView(view) {
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === view);
  });
  document.querySelectorAll(".nav-step").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  els.viewTitle.textContent = views[view];
  els.pipelineStage.textContent = views[view].replace("Opportunity ", "").replace(" Selection", "");
}

function setPayload(key) {
  document.querySelectorAll(".payload-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.payload === key);
  });
  els.payloadPreview.textContent = JSON.stringify(payloads[key], null, 2);
}

function addBubble(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role === "agent" ? "agent" : "caller"}`;
  bubble.innerHTML = `<strong>${role === "agent" ? "AI receptionist" : "Caller"}</strong>${text}`;
  els.transcript.appendChild(bubble);
  els.transcript.scrollTop = els.transcript.scrollHeight;
}

function renderLead(lead) {
  els.leadValue.textContent = money(lead.value);
  els.leadName.textContent = lead.name;
  els.leadPhone.textContent = lead.phone;
  els.leadIntent.textContent = lead.intent;
  els.leadService.textContent = lead.service;
  els.leadOutcome.textContent = lead.outcome;
  els.leadNext.textContent = lead.next;
}

function updateMetrics() {
  const passed = qaItems.filter((item) => item.done).length;
  const readiness = Math.round((passed / qaItems.length) * 100);
  els.capturedMetric.textContent = state.captured;
  els.bookedMetric.textContent = state.booked;
  els.escalatedMetric.textContent = state.escalated;
  els.revenueMetric.textContent = money(state.revenue);
  els.revenueProtected.textContent = money(state.revenue);
  els.qaPassed.textContent = `${passed}/${qaItems.length}`;
  els.readinessScore.textContent = `${readiness}%`;
  els.readinessMini.textContent = `${readiness}%`;
  els.readinessRing.textContent = `${readiness}%`;
  els.ownerSummary.textContent = state.captured
    ? `${state.captured} lead(s) captured, ${state.booked} appointment request(s), ${state.escalated} escalation(s), and ${money(state.revenue)} in estimated revenue protected during QA simulation.`
    : "Run QA call scenarios to populate outcome reporting. This is where Subutai proves that the AI receptionist captured high-intent demand instead of letting it roll to voicemail.";
}

function clearTranscript() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  els.transcript.innerHTML = "";
  els.callState.textContent = "Idle";
}

function resetLead() {
  els.leadValue.textContent = "$0";
  els.leadName.textContent = "-";
  els.leadPhone.textContent = "-";
  els.leadIntent.textContent = "-";
  els.leadService.textContent = "-";
  els.leadOutcome.textContent = "-";
  els.leadNext.textContent = "-";
}

function runScenario() {
  clearTranscript();
  resetLead();
  setView("qa");

  const scenario = scenarios[Number(els.scenario.value)];
  let index = 0;
  els.callState.textContent = scenario.qa;
  els.runScenario.disabled = true;

  state.timer = setInterval(() => {
    const turn = scenario.turns[index];
    addBubble(turn[0], turn[1]);
    index += 1;

    if (index >= scenario.turns.length) {
      clearInterval(state.timer);
      state.timer = null;
      renderLead(scenario.lead);
      state.captured += scenario.lead.captured;
      state.booked += scenario.lead.booked;
      state.escalated += scenario.lead.escalated;
      state.revenue += scenario.lead.value;
      updateMetrics();
      els.callState.textContent = "Logged";
      els.runScenario.disabled = false;
    }
  }, 620);
}

function resetDemo() {
  clearTranscript();
  resetLead();
  state.captured = 0;
  state.booked = 0;
  state.escalated = 0;
  state.revenue = 0;
  updateMetrics();
  els.runScenario.disabled = false;
}

function renderChecklist() {
  els.qaChecklist.innerHTML = "";
  qaItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = item.done ? "done" : "";
    li.textContent = item.label;
    els.qaChecklist.appendChild(li);
  });
}

function copyBrief() {
  const brief = `Subutai Deployment Console Demo

Positioning:
This demo shows how Subutai can turn an SMB opportunity into a repeatable Newo AI voice receptionist deployment.

Workflow:
1. Intake business, tools, pain, lead value, and success metrics.
2. Select a vertical template.
3. Map the customer workflow to Newo agent, AKB, flows, skills, and connectors.
4. Define integration payloads for booking, CRM, SMS, and handoff.
5. Run QA scenarios before go-live.
6. Track readiness and outcome reporting.

Current customer example:
Maple & Main Studio, an appointment-based salon using Vagaro.`;

  navigator.clipboard?.writeText(brief).then(() => {
    els.toast.classList.add("show");
    setTimeout(() => els.toast.classList.remove("show"), 1400);
  });
}

document.querySelectorAll(".nav-step").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelectorAll(".payload-tab").forEach((button) => {
  button.addEventListener("click", () => setPayload(button.dataset.payload));
});

scenarios.forEach((scenario, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = scenario.title;
  els.scenario.appendChild(option);
});

els.vibePrompt.textContent = vibePrompt;
els.exportBrief.addEventListener("click", copyBrief);
els.runScenario.addEventListener("click", runScenario);
els.resetDemo.addEventListener("click", resetDemo);
renderChecklist();
setPayload("booking");
resetDemo();
