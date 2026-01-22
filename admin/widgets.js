// ===== CUSTOM IMAGE WIDGET WITH SIZE =====
// Adds an "Image with Size" block to the markdown editor

CMS.registerEditorComponent({
    id: "sized-image",
    label: "Image avec taille",
    fields: [
        {
            name: "image",
            label: "Image",
            widget: "image",
        },
        {
            name: "alt",
            label: "Texte alternatif",
            widget: "string",
        },
        {
            name: "width",
            label: "Largeur",
            widget: "string",
            hint: "Ex: 50%, 300px, auto",
            required: false,
        },
        {
            name: "height",
            label: "Hauteur",
            widget: "string",
            hint: "Ex: 200px, auto",
            required: false,
        },
    ],

    // Pattern to match in existing markdown: {{< sized-image src="..." alt="..." width="..." >}}
    pattern:
        /{{< sized-image src="([^"]*)" alt="([^"]*)"(?: width="([^"]*)")?(?: height="([^"]*)")? >}}/,

    fromBlock: function (match) {
        return {
            image: match[1],
            alt: match[2],
            width: match[3] || "",
            height: match[4] || "",
        };
    },

    toBlock: function (data) {
        let attrs = `src="${data.image || ""}" alt="${data.alt || ""}"`;
        if (data.width) {
            attrs += ` width="${data.width}"`;
        }
        if (data.height) {
            attrs += ` height="${data.height}"`;
        }
        return `{{< sized-image ${attrs} >}}`;
    },

    toPreview: function (data, getAsset, fields) {
        const src = getAsset(data.image);
        let style = "";
        if (data.width) style += `width: ${data.width};`;
        if (data.height) style += `height: ${data.height};`;
        return `<img src="${src || ""}" alt="${data.alt || ""}" style="${style}">`;
    },
});
