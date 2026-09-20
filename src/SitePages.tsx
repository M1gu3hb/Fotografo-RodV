import { useState } from "react";
import { ArrowDown, ArrowUpRight, BookOpen, Camera, Check, ChevronRight, Clock3, Film } from "lucide-react";

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

export function StoryRail({ photos }: { photos: Photo[] }) {
  const selected = photos.slice(0, 5);
  if (!selected.length) return null;
  return <section className="story-rail" aria-label="Una secuencia de historias">
    <div className="story-rail__heading section-pad">
      <p className="section-index">01 / En movimiento</p>
      <MotionText as="h2" text="Una historia se revela por fragmentos." />
      <p>Un recorrido de luz, gestos y pausas inspirado en la forma de mirar de Rodrigo.</p>
    </div>
    <div className="story-rail__track">
      {selected.map((photo, index) => <figure className="story-rail__item" data-parallax key={photo.id}>
        <PhotoImage photo={photo} sizes="(max-width: 720px) 100vw, 28vw" />
        <figcaption><span>0{index + 1}</span><span>The Best Moment</span></figcaption>
      </figure>)}
    </div>
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
  </div>;
}

function PackageComparison() {
  return <section className="package-comparison section-pad">
    <div className="section-heading"><div><p className="section-index">03 / Comparación clara</p><MotionText as="h2" text="Lo que cambia, a primera vista." /></div><p>Cada propuesta conserva una historia completa a su escala. Aquí puedes identificar la diferencia real en cobertura, video, impresos y experiencia.</p></div>
    <div className="package-comparison__labels" aria-hidden="true"><span>Paquete</span><span>Cobertura</span><span>Video</span><span>Impreso</span><span>Experiencia</span></div>
    <div className="package-comparison__rows">
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

function CollectionShowcase({ site }: { site: SiteData }) {
  return <nav className="collection-showcase" aria-label="Colecciones fotográficas">
    {site.collections.map((collection, index) => <a className={`collection-showcase__item collection-showcase__item--${index + 1}`} href={`/colecciones/${collection.slug}`} key={collection.slug} data-parallax>
      <div className="collection-showcase__image"><PhotoImage photo={collection.cover} sizes="(max-width: 720px) 100vw, 52vw" /></div>
      <div className="collection__veil" />
      <div className="collection-showcase__meta">
        <span>0{index + 1}</span><h3>{collection.title}</h3><span>{collection.total} fotografías</span><ChevronRight size={22} />
      </div>
    </a>)}
  </nav>;
}

export function HomePage({ site }: { site: SiteData }) {
  const storyPhotos = [
    collectionPhoto(site, "bodas", 1),
    collectionPhoto(site, "xv-anos", 5),
    collectionPhoto(site, "retratos", 1),
    collectionPhoto(site, "bodas", 4),
    collectionPhoto(site, "xv-anos", 6),
  ].filter(Boolean) as Photo[];
  return <>
    <section className="hero" id="inicio">
      <div className="hero__copy">
        <p className="eyebrow">Bodas · XV años · Retratos</p>
        <MotionText as="h1" text="Vuelve a sentirlo, toda la vida." accentFrom={3} breakAfter={2} />
        <div className="hero__copy-bottom">
          <p>Fotografía y video por Rodrigo Vargas para conservar tu historia con verdad, luz y emoción.</p>
          <div className="hero__actions">
            <a className="button button--dark" href="#contacto">Consultar mi fecha <ArrowUpRight size={17} /></a>
            <a className="text-link" href="#portafolio">Ver el portafolio <ArrowDown size={16} /></a>
          </div>
          <ul className="hero__services" aria-label="Servicios principales"><li><span>01</span>Bodas</li><li><span>02</span>XV años</li><li><span>03</span>Retratos</li></ul>
        </div>
      </div>
      <div className="hero__visual">
        <PhotoImage photo={site.hero} priority sizes="(max-width: 1050px) 100vw, 50vw" />
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
