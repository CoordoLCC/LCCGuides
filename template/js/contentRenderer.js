// ===== CONTENT RENDERER =====

/**
 * Process custom image shortcode from Decap CMS
 * Supports: {{< sized-image src="image.jpg" alt="text" width="50%" height="200px" >}}
 */
function processSizedImageShortcode(content) {
    const shortcodeRegex = /{{< sized-image src="([^"]*)" alt="([^"]*)"(?: width="([^"]*)")?(?: height="([^"]*)")? >}}/g;

    return content.replace(shortcodeRegex, (match, src, alt, width, height) => {
        let style = "";
        if (width) style += `width: ${width};`;
        if (height) style += `height: ${height};`;
        return `<img src="${src}" alt="${alt}" style="${style}">`;
    });
}

/**
 * Process custom image width syntax (legacy/manual)
 * Supports: ![alt](image.jpg){width=50%} or ![alt](image.jpg "title"){width=300px}
 */
function processCustomImageSyntax(content) {
    // Match ![alt](url){attrs} or ![alt](url "title"){attrs}
    // The url group captures just the filename, ignoring optional "title"
    const imageRegex = /!\[([^\]]*)\]\(([^\s")]+)(?:\s*"[^"]*")?\)\{([^}]+)\}/g;

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

            // Process custom image syntaxes before markdown parsing
            let processedContent = processSizedImageShortcode(subsection.content);
            processedContent = processCustomImageSyntax(processedContent);
            contentElement.innerHTML = marked.parse(processedContent);
            subsectionElement.appendChild(contentElement);

            sectionElement.appendChild(subsectionElement);
        });

        container.appendChild(sectionElement);
    });
}
