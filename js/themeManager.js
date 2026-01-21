// ===== THEME MANAGER =====
import { rgbToHex, hexToRgb, rgbToHsl, hslToHex } from "./colorUtils.js";

export async function extractColorsFromLogo(logoFile) {
    try {
        const response = await fetch(logoFile);
        if (!response.ok) return;

        const svgText = await response.text();
        const colors = extractColorsFromSVG(svgText);

        if (colors.length > 0) {
            applyColorTheme(colors[0]);
        }

        // Set background logo - use absolute path from base URL
        const absoluteLogoPath = new URL(logoFile, window.location.href).href;
        document.documentElement.style.setProperty("--logo-url", `url('${absoluteLogoPath}')`);
    } catch (error) {
        console.log("Could not extract colors from logo:", error);
    }
}

function extractColorsFromSVG(svgText) {
    const colorRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
    const rgbRegex = /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi;
    const colors = new Set();

    // Extract hex colors
    let match;
    while ((match = colorRegex.exec(svgText)) !== null) {
        const hex = match[0].toLowerCase();
        // Ignore white, black, and near-white/black colors
        if (hex !== "#ffffff" && hex !== "#000000" && hex !== "#fff" && hex !== "#000") {
            colors.add(
                hex.length === 4 ? "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] : hex,
            );
        }
    }

    // Extract rgb colors and convert to hex
    while ((match = rgbRegex.exec(svgText)) !== null) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        if (r !== 255 || g !== 255 || b !== 255) {
            colors.add(rgbToHex(r, g, b));
        }
    }

    return Array.from(colors);
}

function applyColorTheme(primaryHex) {
    const rgb = hexToRgb(primaryHex);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const root = document.documentElement;

    // Generate color variations
    const primaryDark = hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 20, 15));
    const primaryLight = hslToHex(hsl.h, Math.max(hsl.s - 50, 15), Math.min(hsl.l + 55, 95));
    const accent = hslToHex(hsl.h, Math.max(hsl.s - 20, 30), Math.min(hsl.l + 20, 70));
    const textDark = hslToHex(hsl.h, Math.max(hsl.s - 50, 10), 20);
    const textLight = hslToHex(hsl.h, Math.max(hsl.s - 60, 5), 40);
    const borderColor = hslToHex(hsl.h, Math.max(hsl.s - 40, 15), 88);

    // Apply CSS variables
    root.style.setProperty("--primary-color", primaryHex);
    root.style.setProperty("--primary-dark", primaryDark);
    root.style.setProperty("--primary-light", primaryLight);
    root.style.setProperty("--accent-color", accent);
    root.style.setProperty("--text-dark", textDark);
    root.style.setProperty("--text-light", textLight);
    root.style.setProperty("--border-color", borderColor);
    root.style.setProperty("--shadow", `0 2px 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`);
    root.style.setProperty("--shadow-lg", `0 8px 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);

    console.log("Theme colors extracted from logo:", primaryHex);
}
