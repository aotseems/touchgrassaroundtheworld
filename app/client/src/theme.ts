export interface ThemeConfig {
  id: string;
  name: string;
  pageBg: string; // --page-bg
  sidebarBg: string; // --sidebar-bg
  panelBg: string; // --panel-bg
  panelRaised: string; // --panel-raised
  accent: string; // --green
  accentDim: string; // --green-dim
  textMain: string; // --text-main
  textMuted: string; // --muted
  line: string; // --line
  isLight?: boolean;
}

export const PRESET_THEMES: ThemeConfig[] = [
  {
    id: "classic-meadow",
    name: "Classic Meadow",
    pageBg: "#111611",
    sidebarBg: "#141a14",
    panelBg: "#171e18",
    panelRaised: "#1c241d",
    accent: "#c5ee89",
    accentDim: "#96bd63",
    textMain: "#f2f3ed",
    textMuted: "#949c8e",
    line: "rgba(218, 230, 209, 0.09)",
    isLight: false,
  },
  {
    id: "alpine-forest",
    name: "Alpine Forest",
    pageBg: "#081309",
    sidebarBg: "#0c1a0e",
    panelBg: "#112214",
    panelRaised: "#162b1a",
    accent: "#7dfa9c",
    accentDim: "#54cc72",
    textMain: "#f0fdf4",
    textMuted: "#86a98f",
    line: "rgba(125, 250, 156, 0.12)",
    isLight: false,
  },
  {
    id: "autumn-savannah",
    name: "Autumn Savannah",
    pageBg: "#17130f",
    sidebarBg: "#1c1813",
    panelBg: "#241f1a",
    panelRaised: "#2d2721",
    accent: "#f59e0b",
    accentDim: "#d97706",
    textMain: "#fef3c7",
    textMuted: "#a89b88",
    line: "rgba(245, 158, 11, 0.14)",
    isLight: false,
  },
  {
    id: "glacier-fjord",
    name: "Glacier Fjord",
    pageBg: "#0a131a",
    sidebarBg: "#0f1a23",
    panelBg: "#14222d",
    panelRaised: "#1a2c3a",
    accent: "#38bdf8",
    accentDim: "#0284c7",
    textMain: "#f0f9ff",
    textMuted: "#87a2b6",
    line: "rgba(56, 189, 248, 0.13)",
    isLight: false,
  },
  {
    id: "sakura-twilight",
    name: "Sakura Twilight",
    pageBg: "#150e18",
    sidebarBg: "#1c1420",
    panelBg: "#241b2a",
    panelRaised: "#2d2235",
    accent: "#f472b6",
    accentDim: "#db2777",
    textMain: "#fdf2f8",
    textMuted: "#ad91a6",
    line: "rgba(244, 114, 182, 0.14)",
    isLight: false,
  },
  {
    id: "sunny-trailhead",
    name: "Sunny Trailhead (Light)",
    pageBg: "#f5f7f2",
    sidebarBg: "#ecf0e5",
    panelBg: "#ffffff",
    panelRaised: "#e4ebd9",
    accent: "#2e7d32",
    accentDim: "#1b5e20",
    textMain: "#141813",
    textMuted: "#5e6858",
    line: "rgba(30, 50, 25, 0.12)",
    isLight: true,
  },
  {
    id: "midnight-cyber",
    name: "Midnight Cyber",
    pageBg: "#050705",
    sidebarBg: "#0a0e0a",
    panelBg: "#0f160f",
    panelRaised: "#151f15",
    accent: "#a3e635",
    accentDim: "#84cc16",
    textMain: "#ffffff",
    textMuted: "#889988",
    line: "rgba(163, 230, 53, 0.18)",
    isLight: false,
  },
  {
    id: "desert-canyon",
    name: "Desert Canyon",
    pageBg: "#191211",
    sidebarBg: "#211816",
    panelBg: "#2a1f1d",
    panelRaised: "#352725",
    accent: "#fb923c",
    accentDim: "#ea580c",
    textMain: "#fff7ed",
    textMuted: "#ab918c",
    line: "rgba(251, 146, 60, 0.14)",
    isLight: false,
  },
];

export const THEME_STORAGE_KEY = "touch_grass_theme_config";

// Relative luminance to check if color is light
export function isLightHex(hex: string): boolean {
  try {
    let clean = hex.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.55;
  } catch {
    return false;
  }
}

// Adjust hex brightness
export function adjustHex(hex: string, amount: number): string {
  try {
    let clean = hex.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    const num = parseInt(clean, 16);
    const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount));
    const b = Math.min(255, Math.max(0, (num & 255) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}

// Apply CSS variables to root
export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  const accentHex = theme.accent.replace("#", "");
  const normalizedAccent =
    /^[0-9a-f]{3}$/i.test(accentHex)
      ? accentHex
          .split("")
          .map((channel) => channel + channel)
          .join("")
      : accentHex;
  const accentRgb = /^[0-9a-f]{6}$/i.test(normalizedAccent)
    ? `${parseInt(normalizedAccent.slice(0, 2), 16)}, ${parseInt(normalizedAccent.slice(2, 4), 16)}, ${parseInt(normalizedAccent.slice(4, 6), 16)}`
    : "197, 238, 137";
  root.style.setProperty("--page-bg", theme.pageBg);
  root.style.setProperty("--sidebar-bg", theme.sidebarBg);
  root.style.setProperty("--panel-bg", theme.panelBg);
  root.style.setProperty("--panel-raised", theme.panelRaised);
  root.style.setProperty("--green", theme.accent);
  root.style.setProperty("--green-dim", theme.accentDim);
  root.style.setProperty("--accent-rgb", accentRgb);
  root.style.setProperty(
    "--accent-contrast",
    isLightHex(theme.accent) ? "#111611" : "#ffffff",
  );
  root.style.setProperty("--text-main", theme.textMain);
  root.style.setProperty("--muted", theme.textMuted);
  root.style.setProperty("--line", theme.line);

  if (theme.isLight) {
    root.classList.add("theme-light");
  } else {
    root.classList.remove("theme-light");
  }
}

export function getSavedTheme(): ThemeConfig {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read saved theme", err);
  }
  return PRESET_THEMES[0];
}
