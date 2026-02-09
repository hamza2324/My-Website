const qs = (sel, parent = document) => parent.querySelector(sel);
const qsa = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

window.addEventListener("DOMContentLoaded", () => {
  const year = qs("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // Nav hide/show on scroll
  let lastY = window.scrollY;
  const nav = qs(".nav");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y > lastY && y > 120) nav?.classList.add("hidden");
    else nav?.classList.remove("hidden");
    lastY = y;
  });

  // Mobile nav toggle
  const navToggle = qs("[data-nav-toggle]");
  const navLinks = qs(".nav-links");
  navToggle?.addEventListener("click", () => navLinks?.classList.toggle("open"));

  // ROI calculator with smooth number transition
  const roiForm = qs("[data-roi-form]");
  if (roiForm) {
    const calcBtn = qs("[data-roi-calc]", roiForm);
    const output = qs("[data-roi-output]", roiForm);
    const animateValue = (el, start, end) => {
      const duration = 600;
      const startTime = performance.now();
      const step = (t) => {
        const progress = Math.min((t - startTime) / duration, 1);
        const val = Math.round(start + (end - start) * progress);
        el.textContent = `$${val.toLocaleString()}`;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    calcBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const hours = parseFloat(qs("[name='hours']", roiForm)?.value || 0);
      const rate = parseFloat(qs("[name='rate']", roiForm)?.value || 0);
      const weeks = parseFloat(qs("[name='weeks']", roiForm)?.value || 4);
      const savings = Math.round(hours * rate * weeks);
      if (output) {
        const current = parseInt(output.textContent.replace(/[^0-9]/g, "")) || 0;
        animateValue(output, current, savings);
      }
    });
  }

  // FAQ accordion
  qsa(".faq-item").forEach((item) => {
    const btn = qs("button", item);
    if (!btn) return;
    btn.addEventListener("click", () => item.classList.toggle("open"));
  });

  // Counters
  qsa("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const tick = () => {
      current += step;
      if (current >= target) current = target;
      el.textContent = current.toLocaleString();
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
  });

  // Lightbox
  const lightbox = qs(".lightbox");
  const lightboxImg = qs(".lightbox img");
  qsa("[data-lightbox]").forEach((el) => {
    el.addEventListener("click", () => {
      const src = el.getAttribute("data-lightbox");
      if (lightboxImg && src) lightboxImg.src = src;
      lightbox?.classList.add("open");
    });
  });
  lightbox?.addEventListener("click", () => lightbox.classList.remove("open"));

  // Contact multi-step form
  const stepper = qs("[data-stepper]");
  if (stepper) {
    const steps = qsa(".form-step", stepper);
    const dots = qsa(".form-progress span", stepper);
    const successMsg = qs("[data-form-success]", stepper);
    let currentStep = 0;

    const renderStep = () => {
      steps.forEach((step, idx) => step.classList.toggle("active", idx === currentStep));
      dots.forEach((dot, idx) => dot.classList.toggle("active", idx === currentStep));
    };

    qsa("[data-step-next]", stepper).forEach((btn) => {
      btn.addEventListener("click", () => {
        currentStep = Math.min(currentStep + 1, steps.length - 1);
        renderStep();
      });
    });

    qsa("[data-step-prev]", stepper).forEach((btn) => {
      btn.addEventListener("click", () => {
        currentStep = Math.max(currentStep - 1, 0);
        renderStep();
      });
    });

    stepper.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const action = form.getAttribute("action");
      if (!action) return form.submit();
      const formData = new FormData(form);
      try {
        const res = await fetch(action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          successMsg?.classList.add("show");
          form.reset();
          currentStep = 0;
          renderStep();
        } else {
          form.submit();
        }
      } catch (err) {
        form.submit();
      }
    });

    renderStep();
  }
});
