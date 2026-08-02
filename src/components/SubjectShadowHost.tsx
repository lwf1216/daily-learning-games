import { useCallback, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

interface SubjectShadowHostProps {
  children: ReactElement;
  styles: string;
  label: string;
}

export function SubjectShadowHost({ children, styles, label }: SubjectShadowHostProps) {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const attachHost = useCallback((host: HTMLDivElement | null) => {
    if (!host) return;
    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    if (!shadow.querySelector("style[data-subject-styles]")) {
      const style = document.createElement("style");
      style.dataset.subjectStyles = "true";
      style.textContent = `
        :host { display: block; min-height: 100%; color-scheme: light; }
        *, *::before, *::after { box-sizing: border-box; }
        button, input, select, textarea { font: inherit; }
        ${styles.replaceAll(":root", ":host")}
      `;
      shadow.append(style);
    }
    setShadowRoot(shadow);
  }, [styles]);

  return (
    <div ref={attachHost} className="subject-shadow-host" aria-label={label}>
      {shadowRoot ? createPortal(children, shadowRoot) : null}
    </div>
  );
}
