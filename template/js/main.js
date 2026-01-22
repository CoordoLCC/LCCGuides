// ===== MAIN APPLICATION =====
import { extractColorsFromLogo } from "./themeManager.js";
import { initNavigation, renderNavigation } from "./navigation.js";
import { parseMarkdown } from "./markdownParser.js";
import { renderContent } from "./contentRenderer.js";

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

async function loadGuideContent(paths) {
    const navMenu = document.getElementById("nav-menu");
    const content = document.getElementById("content");
    const title = document.getElementById("guide-title");

    const rawMarkdown = await fetchMarkdown(paths.content);
    const { metadata, content: markdownContent } = parseFrontmatter(rawMarkdown);

    // Build logo path from metadata
    const logoUrl = metadata.logo ? `${paths.basePath}/${metadata.logo}` : null;
    if (logoUrl) {
        await extractColorsFromLogo(logoUrl);
    }

    const sections = parseMarkdown(markdownContent, title);

    renderNavigation(sections, navMenu);
    renderContent(sections, content);
}

// ===== INITIALIZATION =====

async function init() {
    const guide = getGuideFromUrl();
    if (!guide) {
        console.error("Invalid guide URL");
        return;
    }

    const paths = buildGuidePaths(guide);

    initNavigation();

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
