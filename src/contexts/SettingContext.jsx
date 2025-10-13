// src/contexts/SettingsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { landingService } from "../services/landingService";

const SettingsContext = createContext({ settings: null, loading: true });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch sekali
  useEffect(() => {
    (async () => {
      try {
        const res = await landingService.settings();
        setSettings(res?.data ?? null);
      } catch (e) {
        console.error("load settings failed:", e);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // set favicon kalau ada
  useEffect(() => {
    if (!settings?.favicon) return;
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      document.head.appendChild(link);
    }
    link.setAttribute("href", settings.favicon);
  }, [settings?.favicon]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
