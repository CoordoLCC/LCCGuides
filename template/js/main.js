// ===== MAIN APPLICATION =====
import { extractColorsFromLogo } from "./themeManager.js";
import { initNavigation, renderNavigation } from "./navigation.js";
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
    const pathMatch = window.location.pathname.match(/\/guides\/([^\/]+)\/(\d{4})/);
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

// ===== CONTENT LOADING =====

async function fetchMarkdown(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load markdown file: ${response.status}`);
    }
    return response.text();
}

function displayError(error) {
    const content = document.getElementById("content");

    content.innerHTML = `
        <div class="error-message">
            <h2>Error Loading Guide</h2>
            <p>Unable to load the guide content. Please try again later.</p>
            <p>Details: ${error.message}</p>
        </div>
    `;
}

async function loadGuideContent(paths, isLocal = false) {
    const navMenu = document.getElementById("nav-menu");
    const content = document.getElementById("content");
    const title = document.getElementById("guide-title");

    const rawMarkdown = await fetchMarkdown(paths.content);
    const { metadata, content: markdownContent } = parseFrontmatter(rawMarkdown);

    if (metadata.status === "draft") {
        error("Ce guide est en cours de rédaction et sera disponible prochainement.");
        console.error("Error loading guide:", error);
        displayError(error);
        return;
    }

    // Build logo path - use dev config in dev mode, frontmatter in production
    let logoUrl = null;
    if (isLocal) {
        logoUrl = DEV_CONFIG.LOGO_FILE || null;
    } else if (metadata.logo && paths.basePath) {
        logoUrl = `${paths.basePath}/${metadata.logo}`;
    }
    if (logoUrl) {
        await extractColorsFromLogo(logoUrl);
    }

    const sections = parseMarkdown(markdownContent, title);

    renderNavigation(sections, navMenu);
    renderContent(sections, content);
}

// ===== INITIALIZATION =====

async function init() {
    initNavigation();

    // Check if we're in development mode (localhost)
    if (isDevelopment()) {
        const contentPath = DEV_CONFIG.MARKDOWN_URL || DEV_CONFIG.MARKDOWN_FILE;

        console.log("🧪 Development mode (localhost detected)");
        console.log("   Markdown:", contentPath);
        console.log("   Logo:", DEV_CONFIG.LOGO_FILE || "(none)");

        if (!contentPath) {
            displayError(new Error("No MARKDOWN_URL or MARKDOWN_FILE defined in dev_config.js"));
            return;
        }

        try {
            await loadGuideContent({ content: contentPath, basePath: null }, true);
        } catch (error) {
            console.error("Error loading local guide:", error);
            displayError(error);
        }
        return;
    }

    // Normal mode: parse guide from URL path
    const guide = getGuideFromUrl();
    if (!guide) {
        console.error("Invalid guide URL");
        displayError(new Error("Aucun guide trouvé à cette adresse."));
        return;
    }

    const paths = buildGuidePaths(guide);

    try {
        await loadGuideContent(paths);
    } catch (error) {
        console.error("Error loading guide:", error);
        displayError(error);
    }
}

// ===== APP START =====

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
