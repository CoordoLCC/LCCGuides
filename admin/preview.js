// ===== DECAP CMS PREVIEW TEMPLATE =====

const GuidePreview = createClass({
    render: function () {
        const entry = this.props.entry;
        const title = entry.getIn(["data", "title"]) || "Guide";
        const body = entry.getIn(["data", "body"]) || "";

        // Parse markdown sections (simplified version)
        const sections = this.parseSections(body);

        return h(
            "div",
            { className: "guide-wrapper" },
            h(
                "main",
                { className: "guide-main-content" },
                h(
                    "header",
                    { className: "guide-header" },
                    h("h1", { id: "guide-title" }, title)
                ),
                h(
                    "div",
                    { id: "content" },
                    sections.map((section, index) =>
                        h(
                            "section",
                            { key: index, className: "guide-content-section" },
                            h("h2", {}, section.title),
                            section.subsections.map((sub, subIndex) =>
                                h(
                                    "div",
                                    { key: subIndex, className: "guide-subsection-box" },
                                    h("h3", { className: "guide-subsection-title" }, sub.title),
                                    h("div", {
                                        className: "guide-content",
                                        dangerouslySetInnerHTML: { __html: marked.parse(sub.content) },
                                    })
                                )
                            )
                        )
                    )
                )
            )
        );
    },

    parseSections: function (markdown) {
        const sections = [];
        const lines = markdown.split("\n");
        let currentSection = null;
        let currentSubsection = null;
        let contentBuffer = [];

        const flushContent = () => {
            if (currentSubsection && contentBuffer.length > 0) {
                currentSubsection.content = contentBuffer.join("\n").trim();
                contentBuffer = [];
            }
        };

        lines.forEach((line) => {
            // H2 = Section
            if (line.match(/^## /)) {
                flushContent();
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    title: line.replace(/^## /, "").trim(),
                    subsections: [],
                };
                currentSubsection = null;
            }
            // H3 = Subsection
            else if (line.match(/^### /) && currentSection) {
                flushContent();
                currentSubsection = {
                    title: line.replace(/^### /, "").trim(),
                    content: "",
                };
                currentSection.subsections.push(currentSubsection);
            }
            // Content
            else if (currentSubsection) {
                contentBuffer.push(line);
            }
        });

        flushContent();
        if (currentSection) {
            sections.push(currentSection);
        }

        return sections;
    },
});

// Register the preview template
CMS.registerPreviewTemplate("guides", GuidePreview);

// Register the preview styles
CMS.registerPreviewStyle("/template/css/styles.css");
