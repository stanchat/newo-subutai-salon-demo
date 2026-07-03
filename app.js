const scenarios = [
  {
    title: "New haircut booking",
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
  revenueMetric: document.querySelector("#revenueMetric")
};

function money(value) {
  return `$${value.toLocaleString()}`;
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
  els.capturedMetric.textContent = state.captured;
  els.bookedMetric.textContent = state.booked;
  els.escalatedMetric.textContent = state.escalated;
  els.revenueMetric.textContent = money(state.revenue);
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

  const scenario = scenarios[Number(els.scenario.value)];
  let index = 0;
  els.callState.textContent = "In call";
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
  }, 650);
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

scenarios.forEach((scenario, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = scenario.title;
  els.scenario.appendChild(option);
});

els.runScenario.addEventListener("click", runScenario);
els.resetDemo.addEventListener("click", resetDemo);
resetDemo();
