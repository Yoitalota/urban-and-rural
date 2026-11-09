function initEditorialMenu(gsap, reducedMotion) {
  const dialog = document.getElementById("editorial-menu");
  const toggle = document.getElementById("nav-toggle");
  if (!dialog || !toggle) return;

  document.documentElement.classList.add("js-enabled");
  const closeButton = dialog.querySelector(".editorial-menu__close");
  const links = Array.from(dialog.querySelectorAll(".editorial-menu__links a"));
  const featuredImage = dialog.querySelector(".editorial-menu__feature img");
  const featuredTitle = dialog.querySelector(".editorial-menu__feature-title");
  const featuredMeta = dialog.querySelector(".editorial-menu__feature-meta");
  let returnFocus = null;

  function closeMenu() {
    if (!dialog.open) return;
    dialog.close();
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    document.documentElement.classList.remove("nav-open");
    window.requestAnimationFrame(() => {
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    });
  }

  toggle.addEventListener("click", () => {
    if (dialog.open) {
      closeMenu();
      return;
    }
    returnFocus = toggle;
    dialog.showModal();
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");
    document.documentElement.classList.add("nav-open");
    closeButton.focus();
    if (gsap && !reducedMotion.matches) {
      gsap.fromTo(dialog.querySelectorAll(".editorial-menu__links a, .editorial-menu__feature, .editorial-menu__contact"), {
        autoAlpha: 0,
        y: 12
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.045,
        ease: "power2.out",
        clearProps: "all"
      });
    }
  });

  closeButton.addEventListener("click", closeMenu);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMenu();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeMenu();
  });
  dialog.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  links.forEach((link) => {
    const updateFeature = () => {
      if (!featuredImage || !link.dataset.menuImage) return;
      featuredImage.src = link.dataset.menuImage;
      featuredImage.alt = link.dataset.menuAlt || `${link.textContent.trim()} section photograph`;
      featuredTitle.textContent = link.dataset.menuTitle || link.textContent.trim();
      featuredMeta.textContent = link.dataset.menuMeta || "";
    };
    link.addEventListener("pointerenter", updateFeature);
    link.addEventListener("focus", updateFeature);
  });
}

function initProjectViewer(gsap, reducedMotion) {
  const dialog = document.getElementById("project-viewer");
  const gallery = document.querySelector(".work__gallery");
  if (!dialog || !gallery) {
    return;
  }

  const image = dialog.querySelector(".viewer__image");
  const title = dialog.querySelector("#viewer-title");
  const locationLabel = dialog.querySelector(".viewer__location");
  const description = dialog.querySelector(".viewer__description");
  const overview = dialog.querySelector(".viewer__overview");
  const thumbnails = dialog.querySelector(".viewer__thumbnails");
  const chapterTabs = Array.from(dialog.querySelectorAll("[data-viewer-chapter]"));
  const chapterPanels = Array.from(dialog.querySelectorAll("[data-viewer-panel]"));
  const previousPhoto = dialog.querySelector(".viewer__photo-nav--previous");
  const nextPhoto = dialog.querySelector(".viewer__photo-nav--next");
  const viewerMedia = dialog.querySelector(".viewer__media");
  const projects = Array.from(gallery.querySelectorAll(".work-project"));
  const projectSlugs = projects.map((project) => project.querySelector("h3").textContent
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""));
  let activeProject = 0;
  let activePhoto = 0;
  let returnFocus = null;
  let historyOpened = false;
  let touchStart = null;
  let activeChapter = "overview";

  function setChapter(chapter, moveFocus = false) {
    activeChapter = chapter;
    chapterTabs.forEach((tab) => {
      const selected = tab.dataset.viewerChapter === chapter;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus();
    });
    chapterPanels.forEach((panel) => {
      panel.hidden = panel.dataset.viewerPanel !== chapter;
    });
  }

  function writeHistory(mode) {
    const url = new URL(window.location.href);
    url.hash = `project/${projectSlugs[activeProject]}/${activePhoto + 1}`;
    const state = {
      ...(window.history.state && typeof window.history.state === "object" ? window.history.state : {}),
      projectViewer: { project: activeProject, photo: activePhoto }
    };

    if (mode === "push") {
      window.history.pushState(state, "", url);
      historyOpened = true;
    } else {
      window.history.replaceState(state, "", url);
    }
  }

  function renderPhoto(animate = true) {
    const project = projects[activeProject];
    const photos = Array.from(project.querySelectorAll(".work-project__photo img"));
    const selected = photos[activePhoto];
    if (!selected) {
      return;
    }

    image.src = selected.currentSrc || selected.src;
    image.alt = selected.alt;
    thumbnails.querySelectorAll(".viewer__thumb").forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === activePhoto));
    });

    const multiplePhotos = photos.length > 1;
    previousPhoto.hidden = !multiplePhotos;
    nextPhoto.hidden = !multiplePhotos;

    if (animate && gsap && !reducedMotion.matches) {
      gsap.fromTo(image, { autoAlpha: 0.55, scale: 0.985 }, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true
      });
    }
  }

  function renderProject(projectIndex, photoIndex = 0, animate = true) {
    activeProject = (projectIndex + projects.length) % projects.length;
    const project = projects[activeProject];
    const photos = Array.from(project.querySelectorAll(".work-project__photo img"));
    activePhoto = (photoIndex + photos.length) % photos.length;
    title.textContent = project.querySelector("h3").textContent.trim();

    const paragraphs = Array.from(project.querySelectorAll(".work-project__details p"));
    const site = paragraphs.find((paragraph) => paragraph.querySelector("strong")?.textContent.includes("Site:"));
    locationLabel.textContent = site ? site.textContent.replace(/^Site:\s*/, "") : "";
    overview.replaceChildren(...paragraphs
      .filter((paragraph) => paragraph === site || paragraph.querySelector("strong")?.textContent.includes("Client:"))
      .map((paragraph) => paragraph.cloneNode(true)));
    description.replaceChildren(...paragraphs
      .filter((paragraph) => paragraph.querySelector("strong")?.textContent.includes("Project Contact:"))
      .map((paragraph) => paragraph.cloneNode(true)));

    thumbnails.replaceChildren(...photos.map((photo, index) => {
      const thumbnail = document.createElement("button");
      thumbnail.className = "viewer__thumb";
      thumbnail.type = "button";
      thumbnail.setAttribute("aria-label", `Show photo ${index + 1}: ${photo.alt}`);
      thumbnail.setAttribute("aria-pressed", String(index === activePhoto));
      const thumbnailImage = document.createElement("img");
      thumbnailImage.src = photo.currentSrc || photo.src;
      thumbnailImage.alt = "";
      thumbnailImage.loading = "lazy";
      thumbnail.append(thumbnailImage);
      thumbnail.addEventListener("click", () => {
        activePhoto = index;
        renderPhoto();
        if (window.history.state?.projectViewer) {
          writeHistory("replace");
        }
      });
      return thumbnail;
    }));

    renderPhoto(animate);
    setChapter(activeChapter);
  }

  function restoreFocus() {
    if (!returnFocus?.isConnected) return;
    window.requestAnimationFrame(() => returnFocus.focus({ preventScroll: true }));
  }

  function openProject(projectIndex, photoIndex, trigger, historyMode = "push") {
    if (!dialog.open) {
      returnFocus = trigger || document.activeElement;
    }

    renderProject(projectIndex, photoIndex, false);
    if (!dialog.open) {
      dialog.showModal();
      if (gsap && !reducedMotion.matches) {
        gsap.fromTo(dialog.querySelector(".viewer-shell"), { autoAlpha: 0, y: 12 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    }

    if (historyMode) {
      writeHistory(historyMode);
    }
    dialog.querySelector(".viewer__close").focus();
  }

  function closeProject(fromHistory = false) {
    if (!dialog.open) {
      return;
    }
    if (!fromHistory && historyOpened && window.history.state?.projectViewer) {
      historyOpened = false;
      dialog.close();
      restoreFocus();
      window.history.back();
      return;
    }
    if (!historyOpened && window.location.hash.startsWith("#project/")) {
      const url = new URL(window.location.href);
      url.hash = "work";
      window.history.replaceState(window.history.state, "", url);
    }
    historyOpened = false;
    dialog.close();
    restoreFocus();
  }

  projects.forEach((project, projectIndex) => {
    const photos = Array.from(project.querySelectorAll(".work-project__photo"));
    photos.forEach((photo, photoIndex) => {
      const alt = photo.querySelector("img")?.alt || "project photo";
      photo.setAttribute("aria-label", `View ${alt}, photo ${photoIndex + 1} of ${photos.length}`);
      photo.addEventListener("click", () => openProject(projectIndex, photoIndex, photo));
    });
  });

  previousPhoto.addEventListener("click", () => {
    const photoCount = projects[activeProject].querySelectorAll(".work-project__photo").length;
    activePhoto = (activePhoto - 1 + photoCount) % photoCount;
    renderPhoto();
    if (window.history.state?.projectViewer) writeHistory("replace");
  });
  nextPhoto.addEventListener("click", () => {
    const photoCount = projects[activeProject].querySelectorAll(".work-project__photo").length;
    activePhoto = (activePhoto + 1) % photoCount;
    renderPhoto();
    if (window.history.state?.projectViewer) writeHistory("replace");
  });

  dialog.querySelectorAll("[data-project-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.projectStep);
      renderProject(activeProject + step);
      if (window.history.state?.projectViewer) writeHistory("replace");
    });
  });

  dialog.querySelector(".viewer__close").addEventListener("click", () => closeProject());
  chapterTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setChapter(tab.dataset.viewerChapter));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % chapterTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + chapterTabs.length) % chapterTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = chapterTabs.length - 1;
      else return;
      event.preventDefault();
      setChapter(chapterTabs[nextIndex].dataset.viewerChapter, true);
    });
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeProject();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeProject();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeProject();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousPhoto.click();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nextPhoto.click();
    }
  });

  viewerMedia.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    touchStart = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  viewerMedia.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch" || !touchStart) return;
    const deltaX = event.clientX - touchStart.x;
    const deltaY = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    (deltaX < 0 ? nextPhoto : previousPhoto).click();
  }, { passive: true });
  viewerMedia.addEventListener("pointercancel", () => { touchStart = null; }, { passive: true });

  window.addEventListener("popstate", (event) => {
    const viewerState = event.state?.projectViewer;
    if (viewerState) {
      historyOpened = true;
      openProject(viewerState.project, viewerState.photo, returnFocus, null);
    } else if (dialog.open) {
      closeProject(true);
    }
  });

  const directViewer = window.location.hash.match(/^#project\/([^/]+)\/(\d+)$/);
  if (directViewer) {
    const projectIndex = projectSlugs.indexOf(directViewer[1]);
    if (projectIndex >= 0) {
      openProject(projectIndex, Number(directViewer[2]) - 1, null, null);
    }
  }
}

function initInquiry() {
  const form = document.getElementById("inquiry-form");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".inquiry__step"));
  const progress = form.querySelector("#inquiry-progress");
  const progressFill = form.querySelector(".inquiry__progress-track span");
  const review = form.querySelector(".inquiry__review");
  const emailLink = form.querySelector(".inquiry__email");
  let currentStep = 0;

  function updateReview() {
    const values = new FormData(form);
    const rows = [
      ["Project type", values.get("projectType")],
      ["Location", values.get("location")],
      ["Project details", values.get("details") || "Not provided"],
      ["Name", values.get("name")],
      ["Email", values.get("email")]
    ];
    review.replaceChildren(...rows.flatMap(([label, value]) => {
      const term = document.createElement("dt");
      const definition = document.createElement("dd");
      term.textContent = label;
      definition.textContent = String(value || "");
      return [term, definition];
    }));

    const body = rows.map(([label, value]) => `${label}: ${value || "Not provided"}`).join("\n");
    const subject = `Project inquiry: ${values.get("projectType")}`;
    emailLink.href = `mailto:urbanandruralco@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function showStep(index, focus = true) {
    currentStep = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== currentStep; });
    progress.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    progressFill.style.transform = `scaleX(${(currentStep + 1) / steps.length})`;
    if (currentStep === steps.length - 1) updateReview();
    if (focus) steps[currentStep].querySelector("input, select, textarea, a, button")?.focus();
  }

  form.querySelectorAll(".inquiry__next").forEach((button) => {
    button.addEventListener("click", () => {
      const requiredFields = Array.from(steps[currentStep].querySelectorAll("input[required], select[required], textarea[required]"));
      const invalid = requiredFields.find((field) => !field.checkValidity());
      if (invalid) {
        invalid.reportValidity();
        invalid.focus();
        return;
      }
      showStep(currentStep + 1);
    });
  });
  form.querySelectorAll(".inquiry__back").forEach((button) => {
    button.addEventListener("click", () => showStep(currentStep - 1));
  });
  showStep(0, false);
}

function initDelayedImageExpansion(gsap, reducedMotion) {
  if (!gsap) {
    return;
  }

  const timers = new Map();
  const frames = document.querySelectorAll(".work-project__photo");

  function cancel(frame, reset = true) {
    window.clearTimeout(timers.get(frame));
    timers.delete(frame);
    if (reset && !reducedMotion.matches) {
      gsap.to(frame.querySelector("img"), {
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto"
      });
    }
  }

  function schedule(frame) {
    cancel(frame, false);
    if (reducedMotion.matches) {
      return;
    }
    const timer = window.setTimeout(() => {
      timers.delete(frame);
      if (frame.matches(":hover") || frame.matches(":focus-visible")) {
        gsap.to(frame.querySelector("img"), {
          scale: 1.12,
          duration: 0.7,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    }, 1500);
    timers.set(frame, timer);
  }

  frames.forEach((frame) => {
    frame.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" && window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) {
        schedule(frame);
      }
    });
    frame.addEventListener("pointerleave", () => cancel(frame));
    frame.addEventListener("focus", () => {
      if (frame.matches(":focus-visible")) schedule(frame);
    });
    frame.addEventListener("blur", () => cancel(frame));
    frame.addEventListener("click", () => cancel(frame, false));
  });

  reducedMotion.addEventListener("change", (event) => {
    if (!event.matches) return;
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    const images = Array.from(frames, (frame) => frame.querySelector("img"));
    gsap.killTweensOf(images);
    gsap.set(images, { clearProps: "transform" });
  });

  window.addEventListener("pagehide", () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    const images = Array.from(frames, (frame) => frame.querySelector("img"));
    gsap.killTweensOf(images);
    gsap.set(images, { scale: 1, clearProps: "transform" });
  });
}

function initActiveNavigation() {
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const links = Array.from(document.querySelectorAll(".site-nav a[href^='#'], .editorial-menu__links a[href^='#']"));
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  }, { rootMargin: "-25% 0px -65% 0px" });

  sections.forEach((section) => observer.observe(section));
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) observer.disconnect();
  });
}

function initScrollProgress() {
  const progress = document.querySelector(".scroll-progress__fill");
  if (!progress) return;

  let frame = 0;
  function update() {
    frame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.transform = `scaleX(${amount})`;
  }
  function scheduleUpdate() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    window.removeEventListener("scroll", scheduleUpdate);
    window.removeEventListener("resize", scheduleUpdate);
    if (frame) window.cancelAnimationFrame(frame);
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) update();
  });
  update();
}

function initMotionEffects(gsap, ScrollTrigger) {
  const heroBackground = document.querySelector(".hero__bg");
  const heroTitleLines = document.querySelectorAll(".hero__title-line > span");
  const heroContent = document.querySelectorAll(".hero .eyebrow, .hero__lead, .hero__actions, .hero__note");

  if (heroBackground && heroTitleLines.length) {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline.fromTo(heroBackground, { scale: 1.08 }, {
      scale: 1,
      duration: 1.5,
      ease: "power2.out"
    }, 0);
    heroTimeline.fromTo(heroTitleLines, { yPercent: 110 }, {
      yPercent: 0,
      duration: 0.75,
      stagger: 0.1
    }, 0.18);
    heroTimeline.fromTo(heroContent, { autoAlpha: 0, y: 12 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.08
    }, 0.42);
  }

  document.querySelectorAll(".section__title").forEach((heading) => {
    gsap.fromTo(heading, { autoAlpha: 0, y: 14 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.65,
      ease: "power2.out",
      scrollTrigger: { trigger: heading, start: "top 88%", once: true }
    });
  });

  const services = document.querySelector(".card-grid");
  if (services) {
    gsap.fromTo(services.querySelectorAll(".card"), { autoAlpha: 0, y: 18 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: { trigger: services, start: "top 86%", once: true }
    });
  }

  const team = document.querySelector(".team__grid");
  if (team) {
    gsap.fromTo(team.querySelectorAll(".team-card"), { autoAlpha: 0, y: 18 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: { trigger: team, start: "top 86%", once: true }
    });
  }

  document.querySelectorAll(".work-project").forEach((project) => {
    gsap.fromTo(project.querySelectorAll(".work-project__photo"), { autoAlpha: 0, y: 14 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: { trigger: project, start: "top 86%", once: true }
    });
  });

  if (window.matchMedia("(min-width: 981px) and (any-hover: hover) and (any-pointer: fine)").matches) {
    const aboutImage = document.querySelector(".split__media img");
    if (aboutImage) {
      gsap.fromTo(aboutImage, { yPercent: -2 }, {
        yPercent: 2,
        ease: "none",
        scrollTrigger: { trigger: ".split__media", start: "top bottom", end: "bottom top", scrub: 0.7 }
      });
    }
  }

}

function initMagneticButtons(gsap, reducedMotion) {
  if (!gsap || !window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) {
    return;
  }

  document.querySelectorAll("[data-magnetic]").forEach((button) => {
    const moveX = gsap.quickTo(button, "x", { duration: 0.35, ease: "power2.out" });
    const moveY = gsap.quickTo(button, "y", { duration: 0.35, ease: "power2.out" });
    button.addEventListener("pointermove", (event) => {
      if (reducedMotion.matches || event.pointerType !== "mouse") return;
      const bounds = button.getBoundingClientRect();
      moveX(Math.max(-5, Math.min(5, (event.clientX - bounds.left - bounds.width / 2) * 0.08)));
      moveY(Math.max(-4, Math.min(4, (event.clientY - bounds.top - bounds.height / 2) * 0.08)));
    });
    button.addEventListener("pointerleave", () => {
      moveX(0);
      moveY(0);
    });
  });

  reducedMotion.addEventListener("change", (event) => {
    if (!event.matches) return;
    const buttons = document.querySelectorAll("[data-magnetic]");
    gsap.killTweensOf(buttons);
    gsap.set(buttons, { clearProps: "transform" });
  });
}

function initMotion() {
  const { gsap, ScrollTrigger } = window;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  initInquiry();
  initEditorialMenu(gsap, reducedMotion);
  initProjectViewer(gsap, reducedMotion);
  initDelayedImageExpansion(gsap, reducedMotion);
  initActiveNavigation();
  initScrollProgress();
  initMagneticButtons(gsap, reducedMotion);

  if (!gsap || !ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  let motionActive = false;

  function updateMotion() {
    if (reducedMotion.matches) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      gsap.killTweensOf(".hero__bg, .hero__title-line > span, .hero .eyebrow, .hero__lead, .hero__actions, .hero__note, .section__title, .card, .work-project__photo, .work-project__photo img, .split__media img, .scroll-progress__fill");
      gsap.set(".hero__bg, .hero__title-line > span, .hero .eyebrow, .hero__lead, .hero__actions, .hero__note, .section__title, .card, .work-project__photo, .work-project__photo img, .split__media img", {
        clearProps: "transform,opacity,visibility"
      });
      gsap.set(".scroll-progress__fill", { scaleX: 0, clearProps: "transform" });
      motionActive = false;
      return;
    }
    if (motionActive) return;
    initMotionEffects(gsap, ScrollTrigger);
    motionActive = true;
  }

  updateMotion();
  reducedMotion.addEventListener("change", updateMotion);
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.killTweensOf(".hero__bg, .hero__title-line > span, .hero .eyebrow, .hero__lead, .hero__actions, .hero__note, .section__title, .card, .work-project__photo, .work-project__photo img, .split__media img, .scroll-progress__fill");
    motionActive = false;
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) updateMotion();
  });
}

const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

initMotion();
