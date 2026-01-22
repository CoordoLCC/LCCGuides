// ===== CONTENT RENDERER =====

/**
 * Process custom image width syntax
 * Supports: ![alt](image.jpg){width=50%} or ![alt](image.jpg){width=300px}
 * The {width=...} part in markdown gets converted to a title attribute by marked,
 * so we pre-process the content to handle our custom syntax
 */
function processCustomImageSyntax(content) {
    // Match ![alt](url){width=value} or ![alt](url){w=value}
    // Also supports height: {width=50% height=200px} or {w=50% h=200px}
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)\{([^}]+)\}/g;

    return content.replace(imageRegex, (match, alt, url, attributes) => {
        let style = "";

        // Parse width
        const widthMatch = attributes.match(/(?:width|w)=([^\s}]+)/);
        if (widthMatch) {
            style += `width: ${widthMatch[1]};`;
        }

        // Parse height
        const heightMatch = attributes.match(/(?:height|h)=([^\s}]+)/);
        if (heightMatch) {
            style += `height: ${heightMatch[1]};`;
        }

        return `<img src='${url}' alt='${alt}' style='${style}'>`;
    });
}

export function renderContent(sections, container) {
    container.innerHTML = "";

    sections.forEach((section) => {
        const sectionElement = document.createElement("section");
        sectionElement.id = section.id;
        sectionElement.className = "guide-content-section";

        const sectionTitle = document.createElement("h2");
        sectionTitle.textContent = section.title;
        sectionElement.appendChild(sectionTitle);

        section.subsections.forEach((subsection) => {
            const subsectionElement = document.createElement("div");
            subsectionElement.id = subsection.id;
            subsectionElement.className = "guide-subsection-box";

            const subsectionTitle = document.createElement("h3");
            subsectionTitle.className = "guide-subsection-title";
            subsectionTitle.textContent = subsection.title;
            subsectionElement.appendChild(subsectionTitle);

            const contentElement = document.createElement("div");
            contentElement.className = "guide-content";

            const processedContent = processCustomImageSyntax(subsection.content);
            contentElement.innerHTML = marked.parse(processedContent);
            subsectionElement.appendChild(contentElement);

            sectionElement.appendChild(subsectionElement);
        });

        container.appendChild(sectionElement);
    });
}
