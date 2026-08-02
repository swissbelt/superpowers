(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
    // Safety net: never let content stay invisible because of a missed
    // intersection event (fast scroll, unusual scroll container, etc.).
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 1800);
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // Inquiry forms (Request a Quote / Apply to Partner)
  // Submissions are saved to Supabase (see js/config.js and sql/schema.sql).
  // Until js/config.js is filled in with a real project URL/key, submitting
  // shows a friendly "not configured yet" message instead of failing silently.
  document.querySelectorAll("form[data-inquiry-form]").forEach(function (form) {
    var panel = form.parentElement;
    var success = panel.querySelector(".form-success");
    var errorEl = panel.querySelector(".form-error");
    var submitBtn = form.querySelector('button[type="submit"]');

    function showError(message) {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.classList.add("is-visible");
      errorEl.focus();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var config = window.BCS_SUPABASE_CONFIG;
      if (!config || !config.url || config.url.indexOf("YOUR_SUPABASE") === 0) {
        showError(
          "This form isn't connected to a database yet. Please contact BCS directly, or see sql/schema.sql to finish setup."
        );
        return;
      }

      var data = new FormData(form);
      var payload = {
        form_type: form.dataset.formType,
        name: data.get("name") || null,
        email: data.get("email") || null,
        phone: data.get("phone") || null,
        company_or_agency: data.get("agency") || data.get("company") || null,
        title: data.get("title") || null,
        service: data.get("service") || null,
        trade: data.get("trade") || null,
        service_area: data.get("area") || null,
        message: data.get("message") || null,
      };

      if (errorEl) errorEl.classList.remove("is-visible");
      if (submitBtn) submitBtn.disabled = true;

      fetch(config.url.replace(/\/$/, "") + "/rest/v1/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.anonKey,
          Authorization: "Bearer " + config.anonKey,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Submission failed with status " + response.status);
          form.hidden = true;
          if (success) {
            success.classList.add("is-visible");
            success.focus();
          }
        })
        .catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          showError("Something went wrong submitting your request. Please try again, or contact BCS directly.");
        });
    });
  });

  // Footer year
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
