// ===== CONTENT RENDERER =====

/**
 * Process custom image shortcode from Decap CMS
 * Supports: {{< sized-image src="image.jpg" alt="text" width="50%" height="200px" >}}
 */
function processSizedImageShortcode(content, basePath) {
    const shortcodeRegex =
        /{{< sized-image src="([^"]*)" alt="([^"]*)"(?: width="([^"]*)")?(?: height="([^"]*)")? >}}/g;

    return content.replace(shortcodeRegex, (match, src, alt, width, height) => {
        let style = "";
        let absSrc = src;
        if (src && !/^([a-z]+:)?\//i.test(src)) {
            absSrc = basePath ? `${basePath}/${src}` : src;
        }
        if (width) {
            style += `width: ${width};`;
        }
        if (height) style += `height: ${height};`;
        return `<img src="${absSrc}" alt="${alt}" style="${style}">`;
    });
}

export function renderContent(sections, basePath) {
    const container = document.getElementById("content");
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
            let processedContent = processSizedImageShortcode(subsection.content, basePath);
            contentElement.innerHTML = marked.parse(processedContent);
            subsectionElement.appendChild(contentElement);

            sectionElement.appendChild(subsectionElement);
        });

        container.appendChild(sectionElement);
    });
}
