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

function enhanceResponsiveTables(contentElement) {
    const tables = contentElement.querySelectorAll("table");

    tables.forEach((table) => {
        if (!table.parentElement || !table.parentElement.classList.contains("guide-table-container")) {
            const wrapper = document.createElement("div");
            wrapper.className = "guide-table-container";
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }

        const headerCells = table.querySelectorAll("thead tr:first-child th, thead tr:first-child td");
        const fallbackHeaderCells = table.querySelectorAll("tr:first-child th, tr:first-child td");
        const cellsForHeaders = headerCells.length ? headerCells : fallbackHeaderCells;
        const columnCount = cellsForHeaders.length;

        table.classList.remove("guide-table-fit", "guide-table-wide");
        if (columnCount >= 4) {
            table.classList.add("guide-table-wide");
        } else {
            table.classList.add("guide-table-fit");
        }
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
            enhanceResponsiveTables(contentElement);
            subsectionElement.appendChild(contentElement);

            sectionElement.appendChild(subsectionElement);
        });

        container.appendChild(sectionElement);
    });
}
