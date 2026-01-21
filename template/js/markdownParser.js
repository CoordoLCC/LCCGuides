// ===== MARKDOWN PARSER =====

export function parseMarkdown(markdown, titleElement) {
    const lines = markdown.split("\n");
    const sections = [];
    let currentSection = null;
    let currentSubSection = null;
    let currentContent = [];

    lines.forEach((line) => {
        if (line.startsWith("# ")) {
            titleElement.textContent = line.replace("# ", "").trim();
        } else if (line.startsWith("## ")) {
            if (currentSubSection) {
                currentSubSection.content = currentContent.join("\n");
                currentContent = [];
            }
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                id: generateId(line.replace("## ", "")),
                title: line.replace("## ", "").trim(),
                subsections: [],
            };
            currentSubSection = null;
        } else if (line.startsWith("### ")) {
            if (currentSubSection) {
                currentSubSection.content = currentContent.join("\n");
                currentContent = [];
            }
            currentSubSection = {
                id: generateId(line.replace("### ", "")),
                title: line.replace("### ", "").trim(),
                content: "",
            };
            if (currentSection) {
                currentSection.subsections.push(currentSubSection);
            }
        } else {
            currentContent.push(line);
        }
    });

    if (currentSubSection) {
        currentSubSection.content = currentContent.join("\n");
    }
    if (currentSection) {
        sections.push(currentSection);
    }

    return sections;
}

function generateId(title) {
    return (
        "guide-" +
        title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
    );
}
