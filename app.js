const viewTitles = {
  network: "Network overview",
  deployment: "Customer deployment",
  library: "Asset library",
  ledger: "Value ledger",
  partners: "Solution partners"
};

const stages = {
  discovery: {
    title: "Discovery and fit",
    owner: "Owner: Maya",
    description: "Capture the owner's actual problem, establish a baseline, and agree on what evidence will count as value.",
    tasks: [
      ["Owner interview completed", true],
      ["Missed-call baseline documented", true],
      ["Success event agreed: accepted booking", true],
      ["Customer risk cap approved", true]
    ]
  },
  design: {
    title: "Solution design",
    owner: "Owner: Stanley",
    description: "Choose the smallest solution that can create the outcome and document why it is appropriate for this business.",
    tasks: [
      ["Appointment SMB template selected", true],
      ["Newo chosen against fit criteria", true],
      ["Human escalation rules approved", true],
      ["Provider-neutral event schema mapped", true]
    ]
  },
  build: {
    title: "Build and integrate",
    owner: "Owner: Stanley",
    description: "Configure the appointment-business blueprint in Newo, connect required systems, and preserve provider-neutral contracts.",
    tasks: [
      ["Agent, knowledge base, and scenarios configured", true],
      ["SMS confirmation connected", true],
      ["Vagaro booking contract mapped", false],
      ["Outcome event webhook verified", false]
    ]
  },
  qa: {
    title: "Trust QA",
    owner: "Owner: Quality reviewer",
    description: "Pressure-test accuracy, transparency, escalation, fallback, and the promises the AI is allowed to make.",
    tasks: [
      ["Standard happy-path pack passed", true],
      ["Pricing uncertainty handled honestly", true],
      ["Refund request routed to a human", true],
      ["Provider outage drill pending", false]
    ]
  },
  pilot: {
    title: "Controlled pilot",
    owner: "Owner: Advisor + FDE",
    description: "Launch to a limited call segment, watch every session, and tune without shifting risk onto the customer.",
    tasks: [
      ["Call forwarding window scheduled", false],
      ["Owner dashboard access prepared", true],
      ["Daily review owner assigned", true],
      ["Rollback criteria documented", true]
    ]
  },
  verify: {
    title: "Verify customer value",
    owner: "Owner: Customer",
    description: "Confirm outcomes with the business, release attributed rewards, and promote reusable improvements into the library.",
    tasks: [
      ["Accepted bookings reconciled", false],
      ["Customer value confirmed", false],
      ["Contributor payouts calculated", false],
      ["Template improvement published", false]
    ]
  }
};

const pageTitle = document.querySelector("#pageTitle");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function setView(view) {
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === view);
  });
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  pageTitle.textContent = viewTitles[view];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderStage(key) {
  const stage = stages[key];
  document.querySelector("#stageTitle").textContent = stage.title;
  document.querySelector("#stageOwner").textContent = stage.owner;
  document.querySelector("#stageDescription").textContent = stage.description;
  document.querySelector("#stageTasks").innerHTML = stage.tasks
    .map(([label, done]) => `<div class="task ${done ? "done" : ""}"><i>${done ? "✓" : ""}</i><span>${label}</span></div>`)
    .join("");
  document.querySelectorAll(".stage").forEach((button) => {
    button.classList.toggle("active", button.dataset.stage === key);
  });
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelectorAll(".stage").forEach((button) => {
  button.addEventListener("click", () => renderStage(button.dataset.stage));
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".asset").forEach((asset) => {
      asset.hidden = button.dataset.filter !== "all" && asset.dataset.kind !== button.dataset.filter;
    });
  });
});

document.querySelector("#runTrustTest").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const result = document.querySelector("#testResult");
  button.disabled = true;
  result.className = "test-result running";
  result.textContent = "Running 8 customer-trust scenarios...";
  window.setTimeout(() => {
    result.className = "test-result passed";
    result.innerHTML = "<strong>7 of 8 passed</strong><span>Provider outage fallback needs review before pilot.</span>";
    button.disabled = false;
  }, 1100);
});

document.querySelector("#simulateFailover").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const result = document.querySelector("#failoverResult");
  button.disabled = true;
  result.className = "test-result running";
  result.textContent = "Testing continuity contract...";
  window.setTimeout(() => {
    result.className = "test-result passed";
    result.innerHTML = "<strong>Core intake preserved</strong><span>Voice routing can move to fallback; booking becomes manager-confirmed.</span>";
    button.disabled = false;
  }, 1100);
});

document.querySelectorAll(".claim").forEach((button) => {
  button.addEventListener("click", () => {
    button.textContent = "Added to review";
    button.disabled = true;
    showToast("Project added to your review queue");
  });
});

document.querySelector("#copyVision").addEventListener("click", async () => {
  const brief = `Subutai Network OS

A trust-centered delivery network for SMB AI outcomes.

Three sides:
1. Customers work with trusted local advisors and approve measurable outcomes.
2. Independent collaborators opt into projects, use certified methods, and improve reusable assets.
3. Vetted solution partners plug into a provider-neutral delivery layer.

The operating system standardizes discovery, deployment, QA, pilot controls, outcome verification, asset reuse, attribution, and payouts. Contributors earn for verified customer value and receive residual rewards when their work is reused.`;

  try {
    await navigator.clipboard.writeText(brief);
    showToast("Vision brief copied");
  } catch {
    showToast("Clipboard access is unavailable");
  }
});

renderStage("build");
