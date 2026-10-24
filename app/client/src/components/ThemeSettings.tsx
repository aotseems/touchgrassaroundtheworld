import { useState } from "react";
import Icon from "./Icon";
import {
  type ThemeConfig,
  PRESET_THEMES,
  THEME_STORAGE_KEY,
  isLightHex,
  adjustHex,
  applyTheme,
} from "../theme";
import "./ThemeSettings.css";

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
}

export default function ThemeSettings({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
}: ThemeSettingsProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [customTheme, setCustomTheme] = useState<ThemeConfig>(currentTheme);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: ThemeConfig) => {
    setCustomTheme(preset);
    onThemeChange(preset);
    applyTheme(preset);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preset));
    } catch (err) {
      console.warn("Storage error", err);
    }
  };

  const handleCustomColorChange = (key: keyof ThemeConfig, value: string) => {
    const updated: ThemeConfig = {
      ...customTheme,
      id: "custom",
      name: "Custom Palette",
      [key]: value,
    };

    if (key === "pageBg") {
      updated.isLight = isLightHex(value);
    }

    setCustomTheme(updated);
    onThemeChange(updated);
    applyTheme(updated);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage error", err);
    }
  };

  // Smart Auto-Harmonization
  const handleAutoHarmonize = () => {
    const isLight = isLightHex(customTheme.pageBg);
    const harmonized: ThemeConfig = {
      ...customTheme,
      id: "custom",
      name: "Harmonized Custom",
      isLight,
      panelBg: isLight ? "#ffffff" : adjustHex(customTheme.pageBg, 12),
      panelRaised: isLight ? adjustHex(customTheme.pageBg, -10) : adjustHex(customTheme.pageBg, 22),
      sidebarBg: isLight ? adjustHex(customTheme.pageBg, -8) : adjustHex(customTheme.pageBg, 6),
      accentDim: adjustHex(customTheme.accent, -25),
      textMain: isLight ? "#141813" : "#f2f3ed",
      textMuted: isLight ? "#5c6657" : "#949c8e",
      line: isLight ? "rgba(0,0,0,0.11)" : "rgba(255,255,255,0.09)",
    };

    setCustomTheme(harmonized);
    onThemeChange(harmonized);
    applyTheme(harmonized);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(harmonized));
    } catch (err) {
      console.warn("Storage error", err);
    }
  };

  const handleResetDefault = () => {
    const defaultTheme = PRESET_THEMES[0];
    setCustomTheme(defaultTheme);
    onThemeChange(defaultTheme);
    applyTheme(defaultTheme);
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (err) {
      console.warn("Storage error", err);
    }
  };

  return (
    <div className="theme-modal-backdrop" onClick={onClose}>
      <div className="theme-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-modal-header">
          <div className="theme-modal-header-copy">
            <h2>
              <Icon name="palette" size={20} /> Webpage Theme Settings
            </h2>
            <p>Customize the color scheme of the website to match your outdoor vibe.</p>
          </div>
          <button
            type="button"
            className="theme-close-btn"
            onClick={onClose}
            aria-label="Close theme settings"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="theme-nav-tabs">
          <button
            type="button"
            className={`theme-nav-tab ${activeTab === "presets" ? "active" : ""}`}
            onClick={() => setActiveTab("presets")}
          >
            Preset Themes
          </button>
          <button
            type="button"
            className={`theme-nav-tab ${activeTab === "custom" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("custom");
              setCustomTheme(currentTheme);
            }}
          >
            Custom Color Studio
          </button>
        </div>

        <div className="theme-modal-body">
          {/* Live Preview Card */}
          <div className="theme-preview-card">
            <div className="theme-preview-top">
              <span className="theme-preview-badge">Live Color Preview</span>
              <span style={{ fontSize: "11px", color: customTheme.textMuted }}>
                Active: {customTheme.name}
              </span>
            </div>
            <h3 className="theme-preview-title">
              Touch Grass in Your Chosen Colors
            </h3>
            <div className="theme-preview-panel">
              <p>This preview card reflects your real-time webpage colors.</p>
              <button type="button" className="theme-preview-cta">
                Accent Button
              </button>
            </div>
          </div>

          {/* TAB 1: Preset Themes */}
          {activeTab === "presets" && (
            <div className="theme-presets-grid">
              {PRESET_THEMES.map((preset) => {
                const isActive = currentTheme.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`theme-preset-card ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <div className="preset-swatches">
                      <span className="preset-swatch" style={{ background: preset.pageBg }} />
                      <span className="preset-swatch" style={{ background: preset.sidebarBg }} />
                      <span className="preset-swatch" style={{ background: preset.panelBg }} />
                      <span className="preset-swatch" style={{ background: preset.accent }} />
                    </div>
                    <span className="preset-name">{preset.name}</span>
                    {isActive && (
                      <span className="preset-active-check">
                        <Icon name="check" size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: Custom Color Studio */}
          {activeTab === "custom" && (
            <div className="theme-custom-section">
              <div className="auto-harmonize-box">
                <div className="auto-harmonize-copy">
                  <strong>✨ Smart Color Harmonizer</strong>
                  <span>Pick your favorite page background and accent, then click Harmonize!</span>
                </div>
                <button
                  type="button"
                  className="btn-harmonize"
                  onClick={handleAutoHarmonize}
                >
                  Auto-Harmonize Colors
                </button>
              </div>

              <div className="theme-color-fields-grid">
                {/* 1. Page Background */}
                <div className="color-field-card">
                  <span className="color-field-label">🌐 Webpage Background</span>
                  <div className="color-picker-input-row">
                    <input
                      type="color"
                      className="native-color-picker"
                      value={customTheme.pageBg.startsWith("#") ? customTheme.pageBg : "#111611"}
                      onChange={(e) => handleCustomColorChange("pageBg", e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-text-input"
                      value={customTheme.pageBg}
                      onChange={(e) => handleCustomColorChange("pageBg", e.target.value)}
                    />
                  </div>
                </div>

                {/* 2. Accent & Highlight */}
                <div className="color-field-card">
                  <span className="color-field-label">🌿 Brand Accent / Highlights</span>
                  <div className="color-picker-input-row">
                    <input
                      type="color"
                      className="native-color-picker"
                      value={customTheme.accent.startsWith("#") ? customTheme.accent : "#c5ee89"}
                      onChange={(e) => {
                        handleCustomColorChange("accent", e.target.value);
                        handleCustomColorChange("accentDim", adjustHex(e.target.value, -25));
                      }}
                    />
                    <input
                      type="text"
                      className="hex-text-input"
                      value={customTheme.accent}
                      onChange={(e) => handleCustomColorChange("accent", e.target.value)}
                    />
                  </div>
                </div>

                {/* 3. Cards & Panels Background */}
                <div className="color-field-card">
                  <span className="color-field-label">🗂️ Cards & Panels Background</span>
                  <div className="color-picker-input-row">
                    <input
                      type="color"
                      className="native-color-picker"
                      value={customTheme.panelBg.startsWith("#") ? customTheme.panelBg : "#171e18"}
                      onChange={(e) => {
                        handleCustomColorChange("panelBg", e.target.value);
                        handleCustomColorChange("panelRaised", adjustHex(e.target.value, 10));
                      }}
                    />
                    <input
                      type="text"
                      className="hex-text-input"
                      value={customTheme.panelBg}
                      onChange={(e) => handleCustomColorChange("panelBg", e.target.value)}
                    />
                  </div>
                </div>

                {/* 4. Sidebar & Navigation */}
                <div className="color-field-card">
                  <span className="color-field-label">🌲 Sidebar & Navigation</span>
                  <div className="color-picker-input-row">
                    <input
                      type="color"
                      className="native-color-picker"
                      value={customTheme.sidebarBg.startsWith("#") ? customTheme.sidebarBg : "#141a14"}
                      onChange={(e) => handleCustomColorChange("sidebarBg", e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-text-input"
                      value={customTheme.sidebarBg}
                      onChange={(e) => handleCustomColorChange("sidebarBg", e.target.value)}
                    />
                  </div>
                </div>

                {/* 5. Main Text */}
                <div className="color-field-card">
                  <span className="color-field-label">✍️ Main Text & Headings</span>
                  <div className="color-picker-input-row">
                    <input
                      type="color"
                      className="native-color-picker"
                      value={customTheme.textMain.startsWith("#") ? customTheme.textMain : "#f2f3ed"}
                      onChange={(e) => handleCustomColorChange("textMain", e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-text-input"
                      value={customTheme.textMain}
                      onChange={(e) => handleCustomColorChange("textMain", e.target.value)}
                    />
                  </div>
                </div>

                {/* 6. Subtle / Muted Text */}
                <div className="color-field-card">
                  <span className="color-field-label">💬 Subtle / Muted Text</span>
                  <div className="color-picker-input-row">
                    <input
                      type="color"
                      className="native-color-picker"
                      value={customTheme.textMuted.startsWith("#") ? customTheme.textMuted : "#949c8e"}
                      onChange={(e) => handleCustomColorChange("textMuted", e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-text-input"
                      value={customTheme.textMuted}
                      onChange={(e) => handleCustomColorChange("textMuted", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="theme-modal-footer">
          <button
            type="button"
            className="btn-theme-reset"
            onClick={handleResetDefault}
          >
            Reset to Classic Meadow
          </button>
          <button
            type="button"
            className="btn-theme-done"
            onClick={onClose}
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
}
