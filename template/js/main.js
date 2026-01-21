// ===== MAIN APPLICATION =====

import { CONFIG } from "./config.js";
import { extractColorsFromLogo } from "./themeManager.js";
import { initNavigation, renderNavigation } from "./navigation.js";
import { parseMarkdown } from "./markdownParser.js";
import { renderContent } from "./contentRenderer.js";

// Initialize the application
async function init() {
    const navMenu = document.getElementById("nav-menu");
    const contentContainer = document.getElementById("content");
    const guideTitle = document.getElementById("guide-title");

    // Initialize navigation click handlers
    initNavigation();

    // Extract colors from logo and apply theme
    await extractColorsFromLogo(CONFIG.LOGO_FILE);

    // Load and parse markdown
    try {
        // Use MARKDOWN_URL if defined, otherwise fall back to MARKDOWN_FILE
        const markdownSource = CONFIG.MARKDOWN_URL || CONFIG.MARKDOWN_FILE;
        if (!markdownSource) {
            throw new Error("No markdown source configured. Set MARKDOWN_URL or MARKDOWN_FILE in config.js");
        }
        const response = await fetch(markdownSource);
        if (!response.ok) {
            throw new Error(`Failed to load markdown file: ${response.status}`);
        }
        const markdown = await response.text();
        const sections = parseMarkdown(markdown, guideTitle);

        // Render navigation and content
        renderNavigation(sections, navMenu);
        renderContent(sections, contentContainer);
    } catch (error) {
        console.error("Error loading guide:", error);
        contentContainer.innerHTML = `
            <div class="error-message">
                <h2>Error Loading Guide</h2>
                <p>Unable to load the guide content. Please try again later.</p>
                <p>Details: ${error.message}</p>
            </div>
        `;
    }
}

// Start the application when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
