import React, { createContext, useContext, useState } from "react";

// Create context
const LanguageContext = createContext();

// Provider to wrap the app
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem("siteLanguage") || "en"
  );

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("siteLanguage", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook for pages/components
export const useLanguage = () => useContext(LanguageContext);
