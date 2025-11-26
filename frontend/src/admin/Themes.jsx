// src/pages/Themes.jsx
import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../pages/ThemeContext";

const Themes = () => {
  const { theme, updateTheme, resetTheme } = useContext(ThemeContext);
  const [localTheme, setLocalTheme] = useState(theme);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalTheme(theme); // sync with backend if updated externally
  }, [theme]);

  const handleChange = (key, value) => {
    setLocalTheme({ ...localTheme, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    await updateTheme(localTheme);
    setSaving(false);
  };

  const handleReset = async () => {
    setSaving(true);
    await resetTheme();
    setSaving(false);
  };

  const themeFields = [
    { key: "header_bg", label: "Header Background" },
    { key: "text_color", label: "Text Color" },
    { key: "heading_color", label: "Heading Color" },
    { key: "subheading_color", label: "Subheading Color" },
    { key: "button_color", label: "Button Color" },
    { key: "page_bg", label: "Page Background" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Theme Settings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {themeFields.map((item) => (
          <div key={item.key}>
            <label className="block mb-1 font-semibold">{item.label}</label>
            <input
              type="color"
              value={localTheme[item.key]}
              onChange={(e) => handleChange(item.key, e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition disabled:opacity-50"
        >
          Save Changes
        </button>
        <button
          onClick={handleReset}
          disabled={saving}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition disabled:opacity-50"
        >
          Reset to Default
        </button>
      </div>

      {/* Live Preview */}
      <div
        className="mt-8 p-6 rounded shadow transition-colors duration-500"
        style={{ backgroundColor: localTheme.page_bg, color: localTheme.text_color }}
      >
        <header
          className="p-4 rounded mb-4"
          style={{ backgroundColor: localTheme.header_bg, color: localTheme.heading_color }}
        >
          <h2 className="text-xl font-bold">Header Preview</h2>
        </header>
        <h3
          className="text-lg font-bold mb-2"
          style={{ color: localTheme.heading_color }}
        >
          Heading Example
        </h3>
        <p style={{ color: localTheme.subheading_color }}>Subheading / Paragraph Example</p>
        <button
          style={{ backgroundColor: localTheme.button_color, color: "#fff" }}
          className="mt-4 px-4 py-2 rounded"
        >
          Button Example
        </button>
      </div>
    </div>
  );
};

export default Themes;
