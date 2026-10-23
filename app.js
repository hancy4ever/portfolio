const projects = window.PORTFOLIO_PROJECTS || [];
const grid = document.querySelector("#project-grid");
const lightbox = document.querySelector("#lightbox");
let visibleProjectIndices = projects.map((_, index) => index);
let lightboxPosition = 0;
let lightboxScale = 1;

function escapeHTML(value = "") {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function projectCover(project) {
  return project.cover || project.image || project.images?.[0] || "";
}

function projectImages(project) {
  const images = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
  return images.length ? images : [project.image].filter(Boolean);
}

function bilibiliEmbed(url) {
  const match = url && url.match(/(BV[\w]+)/i);
  return match ? `https://player.bilibili.com/player.html?bvid=${match[1]}&page=1&high_quality=1&qn=80&quality=80&danmaku=0&autoplay=0` : "";
}

function renderProjects(filter = "interactive") {
  const visible = filter === "art"
    ? projects.filter(item => item.category === "painting" || item.category === "modeling")
    : projects.filter(item => item.category === filter);
  visibleProjectIndices = visible.map(item => projects.indexOf(item));
  grid.innerHTML = visible.map(project => `
    <article class="project-card reveal visible" data-index="${projects.indexOf(project)}" tabindex="0" aria-label="查看${escapeHTML(project.title)}详情">
      <div class="card-image">
        <img src="${escapeHTML(projectCover(project))}" alt="${escapeHTML(project.title)}项目封面" loading="lazy" />
        <div class="card-hover"><span>点击放大观看</span><b>＋</b></div>
      </div>
      <div class="card-info">
        <h3>${escapeHTML(project.title)}</h3>
      </div>
    </article>`).join("");
}

function smoothScrollTo(element) {
  element.scrollIntoView({ behavior: "auto", block: "start" });
}

function activateProjectView(filter, shouldScroll = false) {
  const currentFilter = document.querySelector(".filter.active")?.dataset.filter;
  document.querySelectorAll(".filter").forEach(button => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  if (currentFilter !== filter) renderProjects(filter);
  if (shouldScroll) smoothScrollTo(document.querySelector("#works"));
}

function updateLightbox() {
  const index = visibleProjectIndices[lightboxPosition];
  const project = projects[index];
  if (!project) return;
  lightboxScale = 1;
  const gallery = document.querySelector("#lightbox-gallery");
  const video = document.querySelector("#lightbox-video");
  const videoWrap = document.querySelector("#lightbox-video-wrap");
  const scrollNote = document.querySelector("#lightbox-scroll-note");
  const videoUrl = bilibiliEmbed(project.bilibili);
  video.src = "";
  gallery.innerHTML = projectImages(project).map((image, imageIndex) => `
    <section class="lightbox-media lightbox-image-wrap">
      <img class="lightbox-project-image" src="${escapeHTML(image)}" alt="${escapeHTML(project.title)} 图片 ${imageIndex + 1}" />
    </section>`).join("");
  if (videoUrl) {
    videoWrap.hidden = false;
    video.src = videoUrl;
    scrollNote.hidden = false;
  } else {
    videoWrap.hidden = true;
    scrollNote.hidden = true;
  }
  document.querySelector("#lightbox-zoom").textContent = "100%";
  document.querySelector("#lightbox-title").textContent = project.title;
  document.querySelector("#lightbox-description").textContent = project.description;
  const actions = [];
  if (project.bilibili) actions.push(`<a class="action-bilibili" href="${escapeHTML(project.bilibili)}" target="_blank" rel="noreferrer">打开 B站视频 <span>↗</span></a>`);
  if (project.projectUrlZh) actions.push(`<a class="action-game action-game-zh" href="${escapeHTML(project.projectUrlZh)}" target="_blank" rel="noreferrer">中文版网页 <span>↗</span></a>`);
  if (project.projectUrlEn) actions.push(`<a class="action-game action-game-en" href="${escapeHTML(project.projectUrlEn)}" target="_blank" rel="noreferrer">海外版网页 <span>↗</span></a>`);
  if (project.projectUrl) actions.push(`<a href="${escapeHTML(project.projectUrl)}" target="_blank" rel="noreferrer">项目链接 ↗</a>`);
  document.querySelector("#lightbox-actions").innerHTML = actions.join("");
  document.querySelector("#lightbox-canvas").scrollTop = 0;
}

function openLightbox(index) {
  lightboxPosition = Math.max(0, visibleProjectIndices.indexOf(index));
  updateLightbox();
  lightbox.showModal();
  document.body.classList.add("modal-open");
}

function setZoom(nextScale) {
  lightboxScale = Math.min(4, Math.max(.5, nextScale));
  document.querySelectorAll(".lightbox-project-image").forEach(image => {
    image.style.transform = `scale(${lightboxScale})`;
  });
  document.querySelector("#lightbox-zoom").textContent = `${Math.round(lightboxScale * 100)}%`;
}

projects.forEach(project => {
  const countKey = project.category === "interactive" ? "interactive" : "art";
  const el = document.querySelector(`#count-${countKey}`);
  if (el) el.textContent = String(Number(el.textContent) + 1).padStart(2, "0");
});
renderProjects("interactive");

document.querySelectorAll("[data-project-view]").forEach(button => {
  button.addEventListener("click", () => activateProjectView(button.dataset.projectView, true));
});

document.querySelectorAll('.site-header a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    smoothScrollTo(target);
  });
});

document.querySelector(".filters").addEventListener("click", event => {
  const button = event.target.closest(".filter");
  if (!button) return;
  activateProjectView(button.dataset.filter);
});
grid.addEventListener("click", event => { const card = event.target.closest(".project-card"); if (card) openLightbox(Number(card.dataset.index)); });
grid.addEventListener("keydown", event => { if ((event.key === "Enter" || event.key === " ") && event.target.matches(".project-card")) openLightbox(Number(event.target.dataset.index)); });
lightbox.addEventListener("click", event => {
  const action = event.target.closest("[data-lightbox-action]")?.dataset.lightboxAction;
  if (action === "close") lightbox.close();
  if (action === "zoom-in") setZoom(lightboxScale + .25);
  if (action === "zoom-out") setZoom(lightboxScale - .25);
  if (action === "reset") setZoom(1);
  if (action === "fullscreen") {
    if (!document.fullscreenElement) lightbox.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
});
lightbox.addEventListener("wheel", event => {
  if (!event.ctrlKey) return;
  event.preventDefault();
  setZoom(lightboxScale + (event.deltaY < 0 ? .15 : -.15));
}, { passive: false });
lightbox.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  setZoom(1);
  document.querySelector("#lightbox-video").src = "";
});
document.addEventListener("keydown", event => {
  if (!lightbox.open) return;
  if (event.key === "+" || event.key === "=") setZoom(lightboxScale + .25);
  if (event.key === "-") setZoom(lightboxScale - .25);
  if (event.key === "0") setZoom(1);
});

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

const introHero = document.querySelector(".intro-hero");
let targetIntroProgress = 0;
let currentIntroProgress = 0;
let introMotionFrame = 0;

function renderIntroMotion() {
  currentIntroProgress += (targetIntroProgress - currentIntroProgress) * .12;
  introHero?.style.setProperty("--intro-shift", `${(-54 * currentIntroProgress).toFixed(2)}px`);
  introHero?.style.setProperty("--intro-opacity", (1 - .76 * currentIntroProgress).toFixed(4));
  if (Math.abs(targetIntroProgress - currentIntroProgress) > .001) {
    introMotionFrame = requestAnimationFrame(renderIntroMotion);
  } else {
    introMotionFrame = 0;
  }
}

window.addEventListener("scroll", () => {
  document.querySelector(".site-header").classList.toggle("scrolled", window.scrollY > 40);
  targetIntroProgress = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * .72));
  if (!introMotionFrame) introMotionFrame = requestAnimationFrame(renderIntroMotion);
}, { passive: true });
