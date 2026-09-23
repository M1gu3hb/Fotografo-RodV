import { startTransition, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Camera, Check, ChevronRight, Clock3, Film } from "lucide-react";

import Gallery, { PhotoImage, type PageData, type Photo, type SiteData } from "./Gallery";
import { MotionText } from "./Motion";
import packages from "./data/packages.json";


export type PackageInfo = (typeof packages)[number];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(price);
}

function weddingPhoto(site: SiteData, index: number) {
  const weddingPhotos = site.collections.find((collection) => collection.slug === "bodas")?.initial
    || site.initial.filter((photo) => photo.category === "bodas");
  return weddingPhotos[index % weddingPhotos.length] || site.hero;
}

function collectionPhoto(site: SiteData, slug: string, index: number) {
  const photos = site.collections.find((collection) => collection.slug === slug)?.initial || [];
  return photos[index % photos.length];
}

function uniquePhotos(photos: Array<Photo | undefined>) {
  const seen = new Set<string>();
  return photos.filter((photo): photo is Photo => {
    if (!photo || seen.has(photo.id)) return false;
    seen.add(photo.id);
    return true;
  });
}

type CyclePhase = "steady" | "blurring" | "revealing";

function usePhotoCycle(length: number, delay: number, initialIndex = 0, initialPhase: CyclePhase = "revealing") {
  const [index, setIndex] = useState(() => length ? initialIndex % length : 0);
  const [phase, setPhase] = useState<CyclePhase>(initialPhase);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const cycleTimer = useRef<number | null>(null);
  const swapTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (cycleTimer.current !== null) window.clearTimeout(cycleTimer.current);
    if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
    cycleTimer.current = null;
    swapTimer.current = null;
  }, []);

  const choose = useCallback((nextIndex: number) => {
    if (length < 1) return;
    clearTimers();
    const normalized = (nextIndex + length) % length;
    if (reducedMotion) {
      setIndex(normalized);
      setPhase("steady");
      return;
    }
    setPhase("blurring");
    swapTimer.current = window.setTimeout(() => {
      startTransition(() => setIndex(normalized));
      setPhase("revealing");
    }, 620);
  }, [clearTimers, length, reducedMotion]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "20% 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (delay <= 0 || length < 2 || !visible || reducedMotion) return;
    cycleTimer.current = window.setTimeout(() => choose(index + 1), delay);
    return () => {
      if (cycleTimer.current !== null) window.clearTimeout(cycleTimer.current);
      cycleTimer.current = null;
    };
  }, [choose, delay, index, length, reducedMotion, visible]);

  useEffect(() => {
    if (phase !== "revealing") return;
    const timer = window.setTimeout(() => setPhase("steady"), 760);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => clearTimers, [clearTimers]);

  return { choose, index, phase, root };
}

function useNextPhotoPreload(photos: Photo[], index: number) {
  useEffect(() => {
    if (photos.length < 2) return;
    const next = photos[(index + 1) % photos.length];
    const version = next.versions[Math.min(1, next.versions.length - 1)];
    const preload = new Image();
    preload.src = version.src;
  }, [index, photos]);
}

function CycleVisual({ photo, phase, priority = false, sizes }: { photo: Photo; phase: CyclePhase; priority?: boolean; sizes: string }) {
  return <div className={`photo-cycle__visual is-${phase}`}>
    <div className="photo-cycle__frame"><PhotoImage key={photo.id} photo={photo} priority={priority} sizes={sizes} /></div>
    <span className="photo-cycle__flash" aria-hidden="true" />
  </div>;
}

function ResponsiveCyclingPhoto({ mobilePhotos, desktopPhotos, delay, priority = false }: { mobilePhotos: Photo[]; desktopPhotos: Photo[]; delay: number; priority?: boolean }) {
  const length = Math.min(mobilePhotos.length, desktopPhotos.length);
  const cycle = usePhotoCycle(length, delay);
  const mobilePhoto = mobilePhotos[cycle.index] || mobilePhotos[0];
  const desktopPhoto = desktopPhotos[cycle.index] || desktopPhotos[0];
  const image = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    if (image.current?.complete && image.current.naturalWidth > 0) setLoaded(true);
  }, [cycle.index]);

  useEffect(() => {
    if (length < 2) return;
    const photos = window.matchMedia("(min-width: 721px)").matches ? desktopPhotos : mobilePhotos;
    const next = photos[(cycle.index + 1) % length];
    const version = next.versions[Math.min(1, next.versions.length - 1)];
    const preload = new Image();
    preload.src = version.src;
  }, [cycle.index, desktopPhotos, length, mobilePhotos]);

  if (!mobilePhoto || !desktopPhoto) return null;
  const mobileVersions = mobilePhoto.versions;
  const desktopVersions = desktopPhoto.versions;
  const style = {
    aspectRatio: `${mobilePhoto.width} / ${mobilePhoto.height}`,
    "--placeholder": mobilePhoto.placeholder ? `url("${mobilePhoto.placeholder}")` : "none",
    "--placeholder-desktop": desktopPhoto.placeholder ? `url("${desktopPhoto.placeholder}")` : "none",
  } as CSSProperties;

  return <div className="photo-cycle photo-cycle--responsive" ref={cycle.root}>
    <div className={`photo-cycle__visual is-${cycle.phase}`}>
      <div className="photo-cycle__frame">
        <span className={`photo-frame responsive-photo-frame ${loaded ? "is-loaded" : ""}`} style={style}>
          <span className="photo-frame__placeholder" aria-hidden="true" />
          <picture className="responsive-photo-frame__picture">
            <source media="(min-width: 721px)" srcSet={desktopVersions.map((version) => `${version.src} ${version.width}w`).join(", ")} sizes="100vw" />
            <img ref={image} className="photo-frame__image"
              src={mobileVersions[Math.min(1, mobileVersions.length - 1)].src}
              srcSet={mobileVersions.map((version) => `${version.src} ${version.width}w`).join(", ")} sizes="100vw"
              alt={mobilePhoto.alt} width={mobilePhoto.width} height={mobilePhoto.height}
              onLoad={() => setLoaded(true)} loading={priority && cycle.index === 0 ? "eager" : "lazy"}
              fetchPriority={priority && cycle.index === 0 ? "high" : "auto"} decoding={priority && cycle.index === 0 ? "sync" : "async"} />
          </picture>
        </span>
      </div>
      <span className="photo-cycle__flash" aria-hidden="true" />
    </div>
  </div>;
}

function SequencedPhoto({ photos, index, sizes }: { photos: Photo[]; index: number; sizes: string }) {
  const requestedIndex = photos.length ? index % photos.length : 0;
  const { choose, index: cycleIndex, phase, root } = usePhotoCycle(photos.length, 0, requestedIndex, "steady");
  const previous = useRef(requestedIndex);
  useNextPhotoPreload(photos, cycleIndex);
  useEffect(() => {
    if (previous.current === requestedIndex) return;
    previous.current = requestedIndex;
    choose(requestedIndex);
  }, [choose, requestedIndex]);
  if (!photos.length) return null;
  return <div className="photo-cycle photo-cycle--sequenced" ref={root} style={{ aspectRatio: `${photos[0].width} / ${photos[0].height}` }}>
    <CycleVisual photo={photos[cycleIndex] || photos[0]} phase={phase} sizes={sizes} />
  </div>;
}

function storyCategory(photo: Photo) {
  if (photo.category === "xv-anos") return "XV años";
  if (photo.category === "bodas") return "Boda";
  return "Retrato";
}

function MobileStoryReel({ photos }: { photos: Photo[] }) {
  const selected = photos.slice(0, 8);
  const renderSet = (duplicate = false) => <div className="story-reel__set" aria-hidden={duplicate || undefined}>
    {selected.map((photo, index) => <figure className={`story-reel__frame story-reel__frame--${(index % 4) + 1}`} key={`${duplicate ? "duplicate-" : ""}${photo.id}`}>
      <PhotoImage photo={photo} priority={!duplicate && index < 2} sizes="(max-width: 720px) 82vw, 28vw" />
      <figcaption><span>{String(index + 1).padStart(2, "0")}</span><strong>{storyCategory(photo)}</strong></figcaption>
    </figure>)}
  </div>;
  if (!selected.length) return null;
  return <div className="story-rail__mobile">
    <div className="story-reel__viewport">
      <div className="story-reel__track">{renderSet()}{renderSet(true)}</div>
    </div>
    <div className="story-reel__footer"><span>Archivo en movimiento</span><i aria-hidden="true" /><span>{String(selected.length).padStart(2, "0")} momentos</span></div>
  </div>;
}

export function StoryRail({ photos }: { photos: Photo[] }) {
  const desktopPhotos = photos.slice(0, 5);
  if (!desktopPhotos.length) return null;
  return <section className="story-rail" aria-label="Una secuencia de historias">
    <div className="story-rail__heading section-pad">
      <p className="section-index">01 / En movimiento</p>
      <MotionText as="h2" text="Una historia se revela por fragmentos." />
      <p>Un recorrido de luz, gestos y pausas inspirado en la forma de mirar de Rodrigo.</p>
    </div>
    <div className="story-rail__track">
      {desktopPhotos.map((photo, index) => <figure className="story-rail__item" data-parallax key={photo.id}>
        <PhotoImage photo={photo} sizes="(max-width: 720px) 100vw, 28vw" />
        <figcaption><span>0{index + 1}</span><span>The Best Moment</span></figcaption>
      </figure>)}
    </div>
    <MobileStoryReel photos={photos} />
  </section>;
}

export function PackageCard({ item, photo, index }: { item: PackageInfo; photo: Photo; index: number }) {
  return <a aria-label={`Ver paquete ${item.name}`} className={`package-card package-card--${(index % 3) + 1} ${item.featured ? "package-card--featured" : ""}`} href={`/paquetes/${item.slug}`}>
    <div className="package-card__media" data-reveal="clip">
      <PhotoImage photo={photo} sizes="(max-width: 720px) 100vw, 42vw" />
      <span>{item.number} / 06</span>
    </div>
    <div className="package-card__body">
      <div className="package-card__number"><span>{item.focus}</span>{item.featured && <span>Selección destacada</span>}</div>
      <h3>{item.name}</h3>
      <p>{item.bestFor}</p>
      <strong>{formatPrice(item.price)}</strong>
      <dl className="package-card__facts">
        <div><dt>Cobertura</dt><dd>{item.comparison.coverage}</dd></div>
        <div><dt>Video</dt><dd>{item.comparison.video}</dd></div>
      </dl>
      <span className="package-card__link">Ver paquete completo <ArrowUpRight size={16} /></span>
    </div>
  </a>;
}

function PackageShowcase({ site }: { site: SiteData }) {
  const [activeIndex, setActiveIndex] = useState(3);
  const activePackage = packages[activeIndex];
  const photos = [2, 6, 8, 18, 19, 20].map((index) => weddingPhoto(site, index));
  const mobileCycle = usePhotoCycle(packages.length, 0, 3);
  const mobilePackage = packages[mobileCycle.index];
  const touchX = useRef<number | null>(null);
  useNextPhotoPreload(photos, mobileCycle.index);

  return <div className="package-showcase">
    <div className="package-showcase__visual" data-reveal="clip">
      {photos.map((photo, index) => <div className={`package-showcase__photo ${activeIndex === index ? "is-active" : ""}`} aria-hidden={activeIndex !== index} key={photo.id}>
        <PhotoImage photo={photo} priority={index === 3} sizes="(max-width: 900px) 100vw, 48vw" />
      </div>)}
      <div className="package-showcase__caption"><span>Selección del portafolio</span><strong>El estilo fotográfico se mantiene en cada cobertura.</strong></div>
    </div>
    <div className="package-showcase__content" data-reveal="up">
      <nav className="package-showcase__selector" aria-label="Abrir uno de los seis paquetes">
        {packages.map((item, index) => <a href={`/paquetes/${item.slug}`} aria-current={activeIndex === index ? "true" : undefined} className={`package-showcase__option ${activeIndex === index ? "is-active" : ""}`} onFocus={() => setActiveIndex(index)} onMouseEnter={() => setActiveIndex(index)} key={item.slug}>
          <span>{item.number}</span><span><strong>{item.name}</strong><small>{item.focus}</small></span><b>{formatPrice(item.price)}</b><ArrowUpRight aria-hidden="true" size={16} />
        </a>)}
      </nav>
      <div className="package-showcase__detail" aria-live="polite">
        <div className="package-showcase__detail-heading"><span>{activePackage.number} / 06</span><div><h3>{activePackage.name}</h3><strong>{formatPrice(activePackage.price)}</strong></div></div>
        <p>{activePackage.bestFor}</p>
        <dl>
          <div><dt>Cobertura</dt><dd>{activePackage.comparison.coverage}</dd></div>
          <div><dt>Video</dt><dd>{activePackage.comparison.video}</dd></div>
          <div><dt>Impreso</dt><dd>{activePackage.comparison.print}</dd></div>
          <div><dt>Experiencia</dt><dd>{activePackage.comparison.experience}</dd></div>
        </dl>
        <a className="button button--light" href={`/paquetes/${activePackage.slug}`}>Conocer {activePackage.name} <ArrowUpRight size={17} /></a>
      </div>
    </div>
    <div className="package-showcase__mobile" ref={mobileCycle.root}
      onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const distance = event.changedTouches[0].clientX - touchX.current;
        if (Math.abs(distance) > 45) mobileCycle.choose(mobileCycle.index + (distance < 0 ? 1 : -1));
        touchX.current = null;
      }}>
      <div className="package-mobile__media">
        <CycleVisual photo={photos[mobileCycle.index]} phase={mobileCycle.phase} sizes="100vw" />
        <span>{mobilePackage.number} / 06 · {mobilePackage.focus}</span>
      </div>
      <div className="package-mobile__body" aria-live="polite">
        <div className="package-mobile__heading"><div><span>Paquete {mobilePackage.number}</span><h3>{mobilePackage.name}</h3></div><strong>{formatPrice(mobilePackage.price)}</strong></div>
        <p>{mobilePackage.bestFor}</p>
        <dl>
          <div><dt>Cobertura</dt><dd>{mobilePackage.comparison.coverage}</dd></div>
          <div><dt>Video</dt><dd>{mobilePackage.comparison.video}</dd></div>
          <div><dt>Impreso</dt><dd>{mobilePackage.comparison.print}</dd></div>
          <div><dt>Experiencia</dt><dd>{mobilePackage.comparison.experience}</dd></div>
        </dl>
        <a className="button button--light" href={`/paquetes/${mobilePackage.slug}`}>Ver {mobilePackage.name} completo <ArrowUpRight size={17} /></a>
      </div>
      <div className="package-mobile__controls">
        <div className="package-mobile__gesture" aria-hidden="true"><ArrowLeft size={14} /><span>Muévete entre paquetes</span><ArrowRight size={14} /></div>
        <button className="package-mobile__arrow package-mobile__arrow--previous" type="button" onClick={() => mobileCycle.choose(mobileCycle.index - 1)} aria-label="Paquete anterior"><ArrowLeft size={18} /></button>
        <div className="package-mobile__choices" role="group" aria-label="Elegir paquete">{packages.map((item, index) => <button type="button" aria-label={`Ver paquete ${item.name}`} aria-pressed={mobileCycle.index === index} className={mobileCycle.index === index ? "is-active" : ""} onClick={() => mobileCycle.choose(index)} key={item.slug}><span>{item.name}</span><b>{item.number}</b></button>)}</div>
        <button className="package-mobile__arrow package-mobile__arrow--next" type="button" onClick={() => mobileCycle.choose(mobileCycle.index + 1)} aria-label="Paquete siguiente"><ArrowRight size={18} /></button>
      </div>
      <p className="package-mobile__hint">Toca un número o desliza la fotografía para comparar.</p>
    </div>
  </div>;
}

function PackageComparison() {
  const [open, setOpen] = useState(false);
  return <section className="package-comparison section-pad">
    <div className="section-heading"><div><p className="section-index">03 / Comparación clara</p><MotionText as="h2" text="Lo que cambia, a primera vista." /></div><p>Cada propuesta conserva una historia completa a su escala. Aquí puedes identificar la diferencia real en cobertura, video, impresos y experiencia.</p></div>
    <button className="package-comparison__toggle" type="button" aria-expanded={open} aria-controls="package-comparison-rows" onClick={() => setOpen((current) => !current)}>{open ? "Cerrar comparación" : "Abrir comparación detallada"}<ChevronRight size={18} /></button>
    <div className="package-comparison__labels" aria-hidden="true"><span>Paquete</span><span>Cobertura</span><span>Video</span><span>Impreso</span><span>Experiencia</span></div>
    <div className={`package-comparison__rows ${open ? "is-open" : ""}`} id="package-comparison-rows">
      {packages.map((item) => <article key={item.slug}>
        <header><span>{item.number}</span><div><h3>{item.name}</h3><small>{formatPrice(item.price)}</small></div><a href={`/paquetes/${item.slug}`} aria-label={`Ver paquete ${item.name}`}><ArrowUpRight size={18} /></a></header>
        <dl>
          <div><dt>Cobertura</dt><dd>{item.comparison.coverage}</dd></div>
          <div><dt>Video</dt><dd>{item.comparison.video}</dd></div>
          <div><dt>Impreso</dt><dd>{item.comparison.print}</dd></div>
          <div><dt>Experiencia</dt><dd>{item.comparison.experience}</dd></div>
        </dl>
      </article>)}
    </div>
  </section>;
}

function HeroIntro({ photos, onComplete }: { photos: Photo[]; onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedTimer = window.setTimeout(onComplete, 240);
      return () => window.clearTimeout(reducedTimer);
    }
    const leaveTimer = window.setTimeout(() => setLeaving(true), 1750);
    const completeTimer = window.setTimeout(onComplete, 2720);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);
  return <div className={`hero-intro ${leaving ? "is-leaving" : ""}`} aria-hidden="true">
    <div className="hero-intro__shards">{photos.slice(0, 4).map((photo, index) => <span className={`hero-intro__shard hero-intro__shard--${index + 1}`} style={{ backgroundImage: `url("${photo.versions[Math.min(1, photo.versions.length - 1)].src}")` }} key={photo.id} />)}</div>
    <div className="hero-intro__brand">
      <svg viewBox="0 0 48 48"><path d="M5 17V5h12M31 5h12v12M43 31v12H31M17 43H5V31" /><path d="M15 24h18M24 15v18" /><rect x="21" y="21" width="6" height="6" transform="rotate(45 24 24)" /></svg>
      <span><small>The best</small><strong>Moment</strong></span>
    </div>
    <p>Fotografía · Rodrigo Vargas</p>
  </div>;
}

function CollectionShowcase({ site }: { site: SiteData }) {
  const sequence = usePhotoCycle(site.collections.length, 1250, site.collections.length - 1, "steady");
  const [photoIndexes, setPhotoIndexes] = useState(() => site.collections.map(() => 0));
  const previousCollection = useRef(sequence.index);
  useEffect(() => {
    if (previousCollection.current === sequence.index) return;
    previousCollection.current = sequence.index;
    setPhotoIndexes((current) => current.map((photoIndex, collectionIndex) => collectionIndex === sequence.index ? photoIndex + 1 : photoIndex));
  }, [sequence.index]);
  return <nav className="collection-showcase" aria-label="Colecciones fotográficas" ref={sequence.root}>
    {site.collections.map((collection, index) => {
      const collectionPhotos = uniquePhotos([collection.cover, ...collection.initial.slice(0, 7)]);
      return <a className={`collection-showcase__item collection-showcase__item--${index + 1}`} href={`/colecciones/${collection.slug}`} key={collection.slug} data-parallax>
      <div className="collection-showcase__image"><SequencedPhoto photos={collectionPhotos} index={photoIndexes[index]} sizes="(max-width: 720px) 100vw, 52vw" /></div>
      <div className="collection__veil" />
      <div className="collection-showcase__meta">
        <span>0{index + 1}</span><h3>{collection.title}</h3><span>{collection.total} fotografías</span><ChevronRight size={22} />
      </div>
    </a>;})}
  </nav>;
}

export function HomePage({ site }: { site: SiteData }) {
  const [introActive, setIntroActive] = useState(true);
  const completeIntro = useCallback(() => setIntroActive(false), []);
  const storyPhotos = [
    collectionPhoto(site, "bodas", 1),
    collectionPhoto(site, "xv-anos", 5),
    collectionPhoto(site, "retratos", 1),
    collectionPhoto(site, "bodas", 4),
    collectionPhoto(site, "xv-anos", 6),
    collectionPhoto(site, "retratos", 3),
    collectionPhoto(site, "bodas", 7),
    collectionPhoto(site, "xv-anos", 8),
  ].filter(Boolean) as Photo[];
  const heroPhotos = uniquePhotos([
    site.hero,
    collectionPhoto(site, "xv-anos", 0),
    collectionPhoto(site, "retratos", 0),
    collectionPhoto(site, "bodas", 2),
    collectionPhoto(site, "xv-anos", 3),
    collectionPhoto(site, "retratos", 2),
  ]);
  const desktopHeroPhotos = uniquePhotos([
    collectionPhoto(site, "bodas", 1),
    collectionPhoto(site, "bodas", 3),
    collectionPhoto(site, "bodas", 6),
    collectionPhoto(site, "bodas", 7),
    collectionPhoto(site, "bodas", 8),
    collectionPhoto(site, "retratos", 1),
  ]);
  return <>
    <section className={`hero ${introActive ? "is-intro-active" : "is-intro-complete"}`} id="inicio">
      {introActive && <HeroIntro photos={heroPhotos} onComplete={completeIntro} />}
      <div className="hero__copy">
        <p className="eyebrow">Fotografía y video · Rodrigo Vargas</p>
        <MotionText as="h1" text="Tu historia, viva en cada imagen." accentFrom={2} breakAfter={1} />
        <div className="hero__copy-bottom">
          <p>Imágenes honestas para conservar la emoción, las personas y los detalles que hacen único cada momento.</p>
          <div className="hero__actions">
            <a className="button button--dark" href="#contacto">Consultar mi fecha <ArrowUpRight size={17} /></a>
            <a className="text-link" href="#portafolio">Ver el portafolio <ArrowDown size={16} /></a>
          </div>
          <ul className="hero__services" aria-label="Servicios principales"><li><span>01</span>Bodas</li><li><span>02</span>XV años</li><li><span>03</span>Retratos</li><li><span>04</span>Cada celebración</li></ul>
        </div>
      </div>
      <div className="hero__visual">
        <ResponsiveCyclingPhoto key={introActive ? "hero-preload" : "hero-ready"} mobilePhotos={heroPhotos} desktopPhotos={desktopHeroPhotos} delay={4000} priority />
        <div className="hero__visual-label"><span>THE BEST MOMENT</span><span>RODRIGO VARGAS</span></div>
      </div>
    </section>

    <section className="statement section-pad">
      <p className="section-index">00 / Manifiesto</p>
      <div><p className="statement__lead">Una buena fotografía observa el momento, lo entiende y lo conserva.</p><p className="statement__aside">Rodrigo Vargas, la mirada detrás de The Best Moment. Fotografía con atención a la luz, la expresión y los detalles.</p></div>
    </section>

    <StoryRail photos={storyPhotos} />

    <section className="portfolio section-pad" id="portafolio">
      <div className="section-heading"><div><p className="section-index">02 / Portafolio</p><MotionText as="h2" text="Historias que permanecen." /></div><p>Bodas, XV años y retratos. Cada colección, una forma distinta de mirar.</p></div>
      <CollectionShowcase site={site} />
      <div className="archive-link"><p>{site.total} fotografías. Un archivo para descubrir a tu ritmo.</p><a className="text-link" href="/portafolio">Explorar el archivo <ArrowUpRight size={17} /></a></div>
    </section>

    <section className="packages-preview section-pad" id="paquetes">
      <div className="section-heading section-heading--light"><div><p className="section-index">03 / Paquetes 2026</p><MotionText as="h2" text="Una cobertura para cada historia." /></div><p>Seis propuestas con fotografía, video y opciones impresas. Consulta el detalle completo antes de elegir.</p></div>
      <PackageShowcase site={site} />
      <div className="section-cta"><a className="button button--light" href="/paquetes">Comparar todos los paquetes <ArrowUpRight size={17} /></a></div>
    </section>

    <section className="home-process section-pad">
      <div className="home-process__visual" data-parallax><PhotoImage photo={weddingPhoto(site, 21)} sizes="(max-width: 720px) 100vw, 48vw" /></div>
      <div className="home-process__copy"><p className="section-index">04 / El día</p><MotionText as="h2" text="De los preparativos a la fiesta." /><p>Getting Ready, First Look, sesión de novios, ceremonia y celebración. Conoce cómo Rodrigo acompaña cada parte del día.</p><a className="text-link text-link--dark" href="/experiencia">Ver la experiencia completa <ArrowUpRight size={17} /></a></div>
    </section>

    <section className="photobooks section-pad" id="fotolibros">
      <div className="photobooks__visual"><img src="/brand/editorial-interaction.webp" alt="" width={1536} height={1024} loading="lazy" /><div className="photobooks__folio"><span>Una historia</span><strong>que también se toca.</strong><span>Fotolibros · The Best Moment</span></div></div>
      <div className="photobooks__copy"><p className="section-index">05 / Fotolibros</p><MotionText as="h2" text="De la pantalla a tus manos." /><p>Los paquetes Bronce, Plata, Oro y Elite incluyen photobooks en distintos formatos. Revisa tamaños, hojas y piezas complementarias.</p><ul><li><BookOpen size={18} /> Cinco formatos disponibles</li><li><Check size={18} /> De 10 a 15 hojas según el paquete</li><li><Check size={18} /> Minibooks y ampliaciones en propuestas seleccionadas</li></ul><a className="text-link text-link--dark" href="/fotolibros">Conocer los fotolibros <ArrowUpRight size={17} /></a></div>
    </section>
  </>;
}

function EditorialHero({ eyebrow, title, text, photo }: { eyebrow: string; title: string; text: string; photo: Photo }) {
  return <section className="editorial-hero">
    <div className="editorial-hero__copy"><p className="eyebrow">{eyebrow}</p><MotionText as="h1" text={title} /><p>{text}</p></div>
    <div className="editorial-hero__visual"><PhotoImage photo={photo} priority sizes="(max-width: 900px) 100vw, 52vw" /></div>
  </section>;
}

export function PackagesPage({ site }: { site: SiteData }) {
  const cardPhotoIndexes = [1, 4, 7, 10, 13, 16];
  return <>
    <EditorialHero eyebrow="Paquetes 2026" title="Elige cómo quieres recordarlo." text="Compara las seis propuestas de fotografía, video y piezas impresas preparadas por The Best Moment." photo={weddingPhoto(site, 2)} />
    <section className="packages-index section-pad">
      <div className="section-heading"><div><p className="section-index">01 / Todas las propuestas</p><MotionText as="h2" text="Seis formas de conservar el día." /></div><p>Los precios y entregables corresponden al catálogo 2026 proporcionado por The Best Moment.</p></div>
      <div className="package-grid package-grid--editorial package-grid--light">{packages.map((item, index) => <PackageCard item={item} photo={weddingPhoto(site, cardPhotoIndexes[index])} index={index} key={item.slug} />)}</div>
    </section>
    <section className="package-guide section-pad"><div><p className="section-index">02 / Guía rápida</p><MotionText as="h2" text="¿Qué cambia entre paquetes?" /></div><div className="package-guide__items"><article><Clock3 /><span>De seis horas al día completo</span><h3>Cobertura</h3><strong>El tiempo y los capítulos que quieres conservar.</strong><p>Básico especifica seis horas; Elite 1 y Elite 2 recorren más momentos del día.</p></article><article><Film /><span>Película + resumen</span><h3>Video</h3><strong>80 o 90 minutos, con Flash Back desde Oro.</strong><p>Todos incluyen video Full HD; Oro y Elite suman un resumen breve del evento.</p></article><article><BookOpen /><span>Del papel al photobook</span><h3>Impresos</h3><strong>Cinco formatos editoriales y distintas ampliaciones.</strong><p>Bronce, Plata, Oro y Elite incluyen photobook, además de ampliaciones y minibook según la propuesta.</p></article><article><Camera /><span>De la sesión al primer encuentro</span><h3>Experiencia</h3><strong>Sesión, drone, Getting Ready y First Look.</strong><p>Cada paquete incorpora momentos distintos para acompañar la manera en que quieres vivir el día.</p></article></div></section>
    <PackageComparison />
  </>;
}

export function PackageDetailPage({ site, packageSlug }: { site: SiteData; packageSlug: string }) {
  const item = packages.find((entry) => entry.slug === packageSlug)!;
  const index = packages.findIndex((entry) => entry.slug === packageSlug);
  const photo = weddingPhoto(site, index + 1);
  const previous = index > 0 ? packages[index - 1] : null;
  const next = index < packages.length - 1 ? packages[index + 1] : null;
  return <>
    <section className="package-hero">
      <div className="package-hero__copy"><a className="text-link" href="/paquetes">← Todos los paquetes</a><p className="eyebrow">Paquete {item.number} / 2026</p><MotionText as="h1" text={item.name} /><p>{item.description}</p><strong>{formatPrice(item.price)}</strong><a className="button button--dark" href="#contacto">Consultar este paquete <ArrowUpRight size={17} /></a></div>
      <div className="package-hero__visual"><PhotoImage photo={photo} priority sizes="(max-width: 900px) 100vw, 50vw" /><span>{item.number} / 06</span></div>
    </section>
    <section className="package-includes section-pad">
      <div className="package-includes__heading"><p className="section-index">01 / Incluye</p><MotionText as="h2" text="Todo lo que forma parte de la propuesta." /><p>{item.summary}</p></div>
      <ol>{item.features.map((feature, featureIndex) => <li key={feature}><span>{String(featureIndex + 1).padStart(2, "0")}</span><p>{feature}</p><Check size={18} /></li>)}</ol>
    </section>
    <section className="package-next section-pad"><div><p className="section-index">02 / Sigue explorando</p><h2>Compara antes de elegir.</h2></div><nav aria-label="Otros paquetes">
      {previous ? <a href={`/paquetes/${previous.slug}`}><span>Anterior</span><strong>{previous.name}</strong></a> : <a href="/paquetes"><span>Vista general</span><strong>Todos los paquetes</strong></a>}
      {next ? <a href={`/paquetes/${next.slug}`}><span>Siguiente</span><strong>{next.name}</strong></a> : <a href="/paquetes"><span>Vista general</span><strong>Todos los paquetes</strong></a>}
    </nav></section>
  </>;
}

const chapters = [
  { title: "Getting Ready", text: "Al empezar el día con el arreglo de los novios, cada uno vive estos momentos a su manera: con familia, amigos o en calma. Rodrigo registra de forma natural cada paso de la preparación." },
  { title: "First Look", text: "Antes de la ceremonia se elige el mejor lugar para el primer encuentro. Nervios, euforia, alegría y nostalgia convierten ese instante en un recuerdo único." },
  { title: "Sesión de novios", text: "Antes o después de la ceremonia, es el momento que la pareja se dedica. Rodrigo dirige la sesión, aprovecha la locación y la luz, y deja espacio para que sean ellos mismos." },
  { title: "Ceremonia", text: "La mirada se mantiene cerca de los novios y atenta a lo que sucede alrededor. La boda la hacen todos: la pareja y las personas importantes que los acompañan." },
  { title: "Fiesta", text: "La cobertura se mueve entre perspectivas, ángulos, decoración y luces para conservar la experiencia de los novios y sus invitados: emoción y diversión." },
];

export function ExperiencePage({ site }: { site: SiteData }) {
  return <>
    <EditorialHero eyebrow="Paso a paso" title="Cada momento tiene su propio pulso." text="Una cobertura que acompaña el día sin interrumpirlo y encuentra historias en lo que ocurre dentro y alrededor de la pareja." photo={weddingPhoto(site, 5)} />
    <section className="scroll-story section-pad">
      <div className="scroll-story__intro"><p className="section-index">01 / La experiencia</p><MotionText as="h2" text="Del primer detalle al último baile." /><p>Desplázate para recorrer los cinco momentos que construyen la narración del día.</p></div>
      <div className="scroll-story__chapters">{chapters.map((chapter, index) => <article className="scroll-chapter" key={chapter.title}>
        <div className="scroll-chapter__image" data-parallax><PhotoImage photo={weddingPhoto(site, index + 1)} sizes="(max-width: 720px) 100vw, 46vw" /></div>
        <div className="scroll-chapter__copy"><span>0{index + 1}</span><h3>{chapter.title}</h3><p>{chapter.text}</p>{index < chapters.length - 1 && <i aria-hidden="true" />}</div>
      </article>)}</div>
    </section>
    <section className="experience-cta section-pad"><MotionText as="h2" text="Elige la cobertura que acompaña tu historia." /><a className="button button--light" href="/paquetes">Explorar paquetes <ArrowUpRight size={17} /></a></section>
  </>;
}

export function PhotobooksPage({ site }: { site: SiteData }) {
  const withBooks = packages.filter((item) => item.photobook);
  return <>
    <EditorialHero eyebrow="Fotolibros" title="Una historia que también se toca." text="Formatos editoriales incluidos en cinco paquetes del catálogo 2026, acompañados por ampliaciones y minibooks según la propuesta." photo={weddingPhoto(site, 6)} />
    <section className="book-formats section-pad">
      <div className="section-heading"><div><p className="section-index">01 / Formatos</p><MotionText as="h2" text="Cinco maneras de llevar las fotos al papel." /></div><p>Cada photobook se especifica por su tamaño abierto y número de hojas.</p></div>
      <div className="book-table" role="table" aria-label="Formatos de photobook por paquete">
        <div className="book-table__head" role="row"><span role="columnheader">Paquete</span><span role="columnheader">Tamaño</span><span role="columnheader">Hojas</span><span /></div>
        {withBooks.map((item) => <a role="row" href={`/paquetes/${item.slug}`} key={item.slug}><strong role="cell">{item.name}</strong><span role="cell">{item.photobook?.size}</span><span role="cell">{item.photobook?.sheets}</span><ArrowUpRight role="cell" size={17} /></a>)}
      </div>
    </section>
    <section className="book-editorial section-pad"><div className="book-editorial__image" data-parallax><PhotoImage photo={weddingPhoto(site, 7)} sizes="(max-width: 720px) 100vw, 52vw" /></div><div className="book-editorial__copy"><p className="section-index">02 / Piezas complementarias</p><MotionText as="h2" text="Más allá del photobook." /><p>Según el paquete, la entrega puede sumar minibook de estudio y ampliaciones laminadas y montadas en formatos desde 8 × 10 hasta 20 × 24 pulgadas.</p><a className="text-link text-link--dark" href="/paquetes">Comparar entregables <ArrowUpRight size={17} /></a></div></section>
  </>;
}

export function GalleryPage({ page }: { page: PageData }) {
  const currentCollection = page.site.collections.find((collection) => collection.slug === page.category);
  return <section className="collection-page section-pad">
    <a className="text-link" href="/#portafolio">← Volver a las colecciones</a>
    <div className="section-heading"><div><p className="section-index">El archivo / Rodrigo Vargas</p><MotionText as="h1" text={currentCollection?.title || "Todas las historias."} /></div><p>{currentCollection?.description || "Un recorrido por bodas, XV años y retratos. Explora las imágenes y detente en sus detalles."}</p></div>
    <nav className="filters" aria-label="Filtrar fotografías"><a href="/portafolio" aria-current={page.category === "todas" ? "page" : undefined}>Todas <span>{page.site.total}</span></a>{page.site.collections.map((collection) => <a key={collection.slug} href={`/colecciones/${collection.slug}`} aria-current={page.category === collection.slug ? "page" : undefined}>{collection.title} <span>{collection.total}</span></a>)}</nav>
    <Gallery initial={page.items} total={page.total} category={page.category} offset={page.offset} />
  </section>;
}
