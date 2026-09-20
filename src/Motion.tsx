import { useEffect, type CSSProperties } from "react";

type MotionTag = "h1" | "h2" | "h3" | "p" | "span";

export function MotionText({
  as: Tag = "span",
  text,
  className = "",
  accentFrom,
  breakAfter,
}: {
  as?: MotionTag;
  text: string;
  className?: string;
  accentFrom?: number;
  breakAfter?: number;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} data-reveal="words" aria-label={text}>
      {words.map((word, index) => (
        <span
          aria-hidden="true"
          className={[
            "motion-word",
            accentFrom !== undefined && index >= accentFrom ? "motion-word--accent" : "",
            breakAfter === index ? "motion-word--break" : "",
          ].filter(Boolean).join(" ")}
          key={`${word}-${index}`}
          style={{ "--word-delay": `${index * 55}ms` } as CSSProperties}
        >
          <span>{word}</span>
        </span>
      ))}
    </Tag>
  );
}

export function useScrollReveals() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(
      "main .eyebrow, main .hero__copy-bottom, main .section-index, main .section-heading > p, main .statement p, main .package-card__body, main .package-showcase__selector button, main .package-showcase__detail, main .package-guide__items article, main .package-comparison__rows article, main .package-includes li, main .scroll-chapter, main .book-table > *, main .photobooks__copy > *, main .contact__intro > *, main .contact__form-panel > *, main .archive-link, main .collection-showcase__item, main .story-rail__item, main .filters, main .gallery-pagination",
    ));
    revealTargets.forEach((element) => {
      if (!element.dataset.reveal) element.dataset.reveal = "up";
    });

    const allTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduced || !("IntersectionObserver" in window)) {
      allTargets.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    allTargets.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) element.classList.add("is-visible");
      else observer.observe(element);
    });

    const moving = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollRange = Math.max(1, root.scrollHeight - window.innerHeight);
      root.style.setProperty("--page-progress", String(Math.min(1, Math.max(0, window.scrollY / scrollRange))));
      allTargets.forEach((element) => {
        if (element.classList.contains("is-visible")) return;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      });
      moving.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const offset = Math.max(-18, Math.min(18, (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.035));
        element.style.setProperty("--parallax-shift", `${offset.toFixed(2)}px`);
      });
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      root.style.removeProperty("--page-progress");
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
