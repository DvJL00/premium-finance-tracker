"use client";

import { useEffect } from "react";

export function FaviconSwitcher() {
  useEffect(() => {
    const favicon = document.querySelector(
      "link[rel='icon']"
    ) as HTMLLinkElement | null;

    function updateFavicon() {
      const isDark = document.documentElement.classList.contains("dark");
      const href = isDark ? "/favicon-dark.png" : "/favicon-light.png";

      if (favicon) {
        favicon.href = href;
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = href;
        document.head.appendChild(link);
      }
    }

    updateFavicon();

    const observer = new MutationObserver(() => {
      updateFavicon();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}