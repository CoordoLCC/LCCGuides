// ===== MAIN APPLICATION =====
import { extractColorsFromLogo } from "./themeManager.js";
import { renderNavigation } from "./navigation.js";
import { parseMarkdown } from "./markdownParser.js";
import { renderContent } from "./contentRenderer.js";
import { DEV_CONFIG } from "./dev_config.js";

// ===== ENVIRONMENT DETECTION =====
function isDevelopment() {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
}

// ===== URL PARSING =====

function getGuideFromUrl() {
    const pathMatch = window.location.pathname.match(/^\/(?:guides\/)?([^\/]+)\/(\d{4})(?:\/)?$/);
    if (!pathMatch) {
        return null;
    }
    return { slug: pathMatch[1], year: pathMatch[2] };
}

function buildGuidePaths(guide) {
    const basePath = `/guides/${guide.slug}/${guide.year}`;
    return {
        basePath,
        content: `${basePath}/${guide.slug}.md`,
    };
}

// ===== FRONTMATTER PARSING =====

function parseFrontmatter(markdown) {
    const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) {
        return { metadata: {}, content: markdown };
    }

    const frontmatterText = frontmatterMatch[1];
    const metadata = {};

    frontmatterText.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
        if (match) {
            metadata[match[1]] = match[2];
        }
    });

    const content = markdown.slice(frontmatterMatch[0].length).trim();
    return { metadata, content };
}

// ===== ERROR DISPLAY =====

function displayError(details) {
    console.error(details);
    document.body.innerHTML = `
    <main class="guide-wrapper">
        <div class="guide-main-content">
            <div class="error-message" id="error-content">
                <h2>Erreur de chargement</h2>
                <p id="error-details">${details}</p>
            </div>
        </div>
    </main>`;
}

// ===== CONTENT LOADING =====

async function fetchMarkdown(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load markdown file: ${response.status}`);
    }
    return response.text();
}

function getLogoUrl(metadata, paths, isLocal) {
    if (isLocal) {
        return DEV_CONFIG.LOGO_FILE || null;
    } else if (metadata.logo.startsWith("/")) {
        return metadata.logo;
    } else if (metadata.logo && paths.basePath) {
        return `${paths.basePath}/${metadata.logo}`;
    }
    return null;
}

// Dynamic favicon
function setFavicon(svgUrl) {
    if (!svgUrl.endsWith(".svg")) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = svgUrl;
}

let imageZoomInitialized = false;
let lastFocusedElement = null;

function getImageOverlayElements() {
    let overlay = document.getElementById("guide-image-overlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "guide-image-overlay";
        overlay.className = "guide-image-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Agrandissement de l'image");
        overlay.tabIndex = -1;
        overlay.hidden = true;

        const image = document.createElement("img");
        image.className = "guide-image-overlay-content";
        image.alt = "";
        overlay.appendChild(image);

        document.body.appendChild(overlay);
    }

    return {
        overlay,
        image: overlay.querySelector(".guide-image-overlay-content"),
    };
}

function closeImageOverlay() {
    const { overlay, image } = getImageOverlayElements();
    overlay.hidden = true;
    image.src = "";
    document.body.classList.remove("guide-image-zoom-open");

    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

function openImageOverlay(sourceImage) {
    const { overlay, image } = getImageOverlayElements();
    const source = sourceImage.currentSrc || sourceImage.src;

    if (!source) return;

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    image.src = source;
    image.alt = sourceImage.alt || "Image agrandie";
    overlay.hidden = false;
    document.body.classList.add("guide-image-zoom-open");
    overlay.focus();
}

function makeImagesZoomable() {
    const content = document.getElementById("content");
    if (!content) return;

    const images = content.querySelectorAll(".guide-content img");
    images.forEach((image) => {
        image.classList.add("guide-zoomable-image");
        image.tabIndex = 0;
    });
}

function setupImageZoom() {
    if (imageZoomInitialized) return;

    const content = document.getElementById("content");
    if (!content) return;

    content.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLImageElement) || !target.classList.contains("guide-zoomable-image")) {
            return;
        }
        openImageOverlay(target);
    });

    const { overlay } = getImageOverlayElements();

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay || event.target.classList.contains("guide-image-overlay-content")) {
            closeImageOverlay();
        }
    });

    imageZoomInitialized = true;
}

async function loadGuideContent(paths, isLocal = false) {
    const title = document.getElementById("guide-title");

    const rawMarkdown = await fetchMarkdown(paths.content);
    const { metadata, content: markdownContent } = parseFrontmatter(rawMarkdown);

    if (metadata.status === "draft") {
        displayError("Ce guide est en cours de rédaction et sera disponible prochainement.");
        return;
    }

    const logoUrl = getLogoUrl(metadata, paths, isLocal);

    if (logoUrl) {
        await extractColorsFromLogo(logoUrl);
        setFavicon(logoUrl);
    }

    // Set page title
    if (metadata.title) {
        document.title = metadata.title + " - Guide du Participant";
    }

    const sections = parseMarkdown(markdownContent, title);

    renderNavigation(sections);
    renderContent(sections, paths.basePath);
    setupImageZoom();
    makeImagesZoomable();

    // After rendering, scroll to hash if present, but wait for images to load
    if (window.location.hash) {
        const id = window.location.hash.slice(1);
        const content = document.getElementById("content");
        const imgs = Array.from(content.querySelectorAll("img"));
        if (imgs.length === 0) {
            // No images, scroll immediately
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            // Wait for all images to load or error
            let loaded = 0;
            const total = imgs.length;
            const checkAndScroll = () => {
                loaded++;
                if (loaded === total) {
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            };
            imgs.forEach((img) => {
                if (img.complete) {
                    checkAndScroll();
                } else {
                    img.addEventListener("load", checkAndScroll, { once: true });
                    img.addEventListener("error", checkAndScroll, { once: true });
                }
            });
        }
    }
}

// ===== INITIALIZATION =====

async function init() {
    // Development mode: load guide from dev_config.js
    if (isDevelopment()) {
        const contentPath = DEV_CONFIG.MARKDOWN_URL || DEV_CONFIG.MARKDOWN_FILE;

        console.log("🧪 Development mode (localhost detected)");
        console.log("   Markdown:", contentPath);
        console.log("   Logo:", DEV_CONFIG.LOGO_FILE || "(none)");

        if (!contentPath) {
            displayError("LOCAL MODE : No MARKDOWN_URL or MARKDOWN_FILE defined in dev_config.js");
            return;
        }

        try {
            await loadGuideContent({ content: contentPath, basePath: null }, true);
        } catch (error) {
            displayError(`LOCAL MODE : ${error}`);
        }
        return;
    }

    // Normal mode: parse guide from URL path
    const guide = getGuideFromUrl();
    const paths = buildGuidePaths(guide);

    try {
        await loadGuideContent(paths);
    } catch (error) {
        displayError(`${error}`);
    }
}

// ===== APP START =====

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
