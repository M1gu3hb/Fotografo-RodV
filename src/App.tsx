import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

import Gallery, { PhotoImage, type PageData, type Photo } from "./Gallery";
import { MotionText, useScrollReveals } from "./Motion";
import contact from "./config/contact.json";

const navItems = [
  { label: "Portafolio", href: "/#portafolio" },
  { label: "Experiencias", href: "/#experiencias" },
  { label: "Fotolibros", href: "/#fotolibros" },
  { label: "Contacto", href: "/#contacto" },
];

const experiences = [
  {
    number: "01",
    name: "Esencia",
    description: "Una propuesta centrada en los momentos principales de tu celebración.",
    features: ["Cobertura a medida", "Selección fotográfica", "Opciones de entrega digital"],
  },
  {
    number: "02",
    name: "Historia",
    description: "Una propuesta más amplia para recorrer las distintas etapas de tu evento.",
    features: ["Cobertura ampliada a convenir", "Selección de momentos y detalles", "Opciones de impresión"],
    featured: true,
  },
  {
    number: "03",
    name: "Legado",
    description: "La experiencia integral, pensada para vivir en pantalla y en papel.",
    features: ["Propuesta integral a convenir", "Diseño de fotolibro", "Acabados personalizados"],
  },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="/" aria-label="The Best Moment, inicio">
      <span className="brand__motion">
        <svg className="brand__mark" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M5 17V5h12M31 5h12v12M43 31v12H31M17 43H5V31" />
          <path d="M15 24h18M24 15v18" className="brand__mark-cross" />
          <rect x="21" y="21" width="6" height="6" transform="rotate(45 24 24)" />
        </svg>
        <span className="brand__type">
          <span className="brand__small">The best</span>
          <span className="brand__large">Moment</span>
        </span>
      </span>
    </a>
  );
}

function StoryRail({ photos }: { photos: Photo[] }) {
  const selected = photos.slice(3, 8);
  if (!selected.length) return null;
  return <section className="story-rail" aria-label="Una secuencia de historias">
    <div className="story-rail__heading section-pad">
      <p className="section-index">01 / En movimiento</p>
      <MotionText as="h2" text="Una historia se revela por fragmentos." />
      <p>Un recorrido de luz, gestos y pausas inspirado en la forma de mirar de Rodrigo.</p>
    </div>
    <div className="story-rail__track">
      {selected.map((photo, index) => <figure className="story-rail__item" data-parallax key={photo.id}>
        <PhotoImage photo={photo} sizes="(max-width: 720px) 78vw, 28vw" />
        <figcaption>0{index + 1} / The Best Moment</figcaption>
      </figure>)}
    </div>
  </section>;
}

function App({ page }: { page: PageData }) {
  const { site, category } = page;
  const isHome = category === "inicio";
  const currentCollection = site.collections.find(c => c.slug === category);
  const menuRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollReveals();

  useEffect(() => {
    if (menuOpen) menuRef.current?.showModal();
    else menuRef.current?.close();
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <header className="site-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="header-cta" href="#contacto">
          Consultar fecha <ArrowUpRight size={16} strokeWidth={1.7} />
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <dialog ref={menuRef} className="mobile-menu" aria-label="Menú principal" onCancel={closeMenu}>
        <button className="menu-close" onClick={closeMenu} aria-label="Cerrar menú"><X /></button>
        <nav aria-label="Navegación móvil">
          {navItems.map((item, index) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              <span>0{index + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <p>Fotografía por Rodrigo Vargas</p>
      </dialog>

      <main id="contenido">
        {isHome ? <>
        <section className="hero" id="inicio">
          <div className="hero__copy">
            <p className="eyebrow">Fotografía por Rodrigo Vargas</p>
            <MotionText as="h1" text="Lo extraordinario vive en un instante." accentFrom={2} breakAfter={1} />
            <div className="hero__copy-bottom">
              <p>Fotografía para celebrar, recordar y volver a sentir.</p>
              <div className="hero__actions">
                <a className="button button--dark" href="#contacto">
                  Consultar disponibilidad <ArrowUpRight size={17} />
                </a>
                <a className="text-link" href="#portafolio">
                  Explorar historias <ArrowDown size={16} />
                </a>
              </div>
            </div>
          </div>
          <div className="hero__visual">
            <PhotoImage photo={site.hero} priority sizes="(max-width: 1050px) 100vw, 50vw" />
            <div className="hero__visual-label">
              <span>THE BEST MOMENT</span>
              <span>RODRIGO VARGAS</span>
            </div>
            <span className="hero__frame hero__frame--top" />
            <span className="hero__frame hero__frame--bottom" />
          </div>
        </section>

        <section className="statement section-pad">
          <p className="section-index">00 / Manifiesto</p>
          <div>
            <p className="statement__lead">
              Una buena fotografía no interrumpe el momento. Lo observa, lo entiende y lo conserva.
            </p>
            <p className="statement__aside">
              Rodrigo Vargas, la mirada detrás de The Best Moment. Fotografía con atención a la luz, la expresión y los detalles.
            </p>
          </div>
        </section>

        <StoryRail photos={site.initial} />

        <section className="portfolio section-pad" id="portafolio">
          <div className="section-heading">
            <div>
              <p className="section-index">02 / Portafolio</p>
              <MotionText as="h2" text="Historias que permanecen." />
            </div>
            <p>Bodas, XV años y retratos. Cada colección, una forma distinta de mirar.</p>
          </div>

          <nav className="collection-showcase" aria-label="Colecciones fotográficas">
            {site.collections.map((collection, index) => (
              <a className={`collection-showcase__item collection-showcase__item--${index + 1}`} href={`/colecciones/${collection.slug}`} key={collection.slug} data-parallax>
                <div className="collection-showcase__image"><PhotoImage photo={collection.cover} sizes="(max-width: 720px) 100vw, 52vw" /></div>
                <div className="collection__veil" />
                <div className="collection-showcase__meta">
                  <span>0{index + 1}</span>
                  <h3>{collection.title}</h3>
                  <span>{collection.total} fotografías</span>
                  <ChevronRight size={22} />
                </div>
              </a>
            ))}
          </nav>

          <div className="archive-link"><p>{site.total} fotografías. Un archivo para descubrir a tu ritmo.</p><a className="text-link" href="/portafolio">Explorar el archivo <ArrowUpRight size={17} /></a></div>
        </section>

        <section className="experiences section-pad" id="experiencias">
          <div className="section-heading section-heading--light">
            <div>
              <p className="section-index">03 / Experiencias</p>
              <MotionText as="h2" text="Elige cómo quieres recordarlo." />
            </div>
            <p>Cada propuesta podrá personalizarse según el evento, la duración y la forma de entrega.</p>
          </div>

          <div className="experience-list">
            {experiences.map((experience) => (
              <article className={`experience ${experience.featured ? "experience--featured" : ""}`} key={experience.name}>
                <div className="experience__topline">
                  <span>{experience.number}</span>
                  {experience.featured && <span className="experience__tag">A tu medida</span>}
                </div>
                <h3>{experience.name}</h3>
                <p>{experience.description}</p>
                <ul>
                  {experience.features.map((feature) => (
                    <li key={feature}>
                      <Check size={15} strokeWidth={1.5} /> {feature}
                    </li>
                  ))}
                </ul>
                <a href="#contacto">
                  Solicitar información <ArrowUpRight size={16} />
                </a>
              </article>
            ))}
          </div>
          <p className="price-note">Cotización personalizada. La cobertura, la entrega y los acabados se acuerdan según tu evento.</p>
        </section>

        <section className="photobooks section-pad" id="fotolibros">
          <div className="photobooks__visual">
            <img src="/brand/editorial-interaction.webp" alt="" width={1536} height={1024} loading="lazy" />
            <div className="photobooks__folio">
              <span>Una historia</span>
              <strong>que también se toca.</strong>
              <span>Fotolibros · The Best Moment</span>
            </div>
          </div>
          <div className="photobooks__copy">
            <p className="section-index">04 / Fotolibros</p>
            <MotionText as="h2" text="De la pantalla a tus manos." />
            <p>
              Una selección de imágenes convertida en una pieza editorial para volver a ella durante años.
            </p>
            <ul>
              <li><BookOpen size={18} strokeWidth={1.4} /> Diseño personalizado</li>
              <li><Check size={18} strokeWidth={1.4} /> Selección y composición fotográfica</li>
              <li><Check size={18} strokeWidth={1.4} /> Acabados a elección en tu propuesta</li>
            </ul>
            <a className="text-link text-link--dark" href="#contacto">
              Conocer fotolibros <ArrowUpRight size={17} />
            </a>
          </div>
        </section>

        <section className="process section-pad" id="proceso">
          <div className="section-heading"><div><p className="section-index">05 / El proceso</p><MotionText as="h2" text="Todo comienza contigo." /></div><p>Una cobertura pensada desde la conversación hasta la última imagen.</p></div>
          <div className="process-grid">
            <article><span>01</span><h3>Conversamos</h3><p>Tu historia, la fecha y lo que te gustaría conservar.</p></article>
            <article><span>02</span><h3>Damos forma</h3><p>Acordamos la cobertura y una propuesta a tu medida.</p></article>
            <article><span>03</span><h3>Fotografiamos</h3><p>Atención a la luz, los detalles y lo que sucede de manera natural.</p></article>
            <article><span>04</span><h3>Conservamos</h3><p>Una selección cuidada para disfrutar en digital o en un fotolibro.</p></article>
          </div>
        </section>
        </> : <section className="collection-page section-pad">
          <a className="text-link" href="/#portafolio">← Volver a las colecciones</a>
          <div className="section-heading"><div><p className="section-index">El archivo / Rodrigo Vargas</p><MotionText as="h1" text={currentCollection?.title || 'Todas las historias.'} /></div><p>{currentCollection?.description || 'Un recorrido por bodas, XV años y retratos. Explora las imágenes y detente en sus detalles.'}</p></div>
          <nav className="filters" aria-label="Filtrar fotografías">
            <a href="/portafolio" aria-current={category === 'todas' ? 'page' : undefined}>Todas <span>{site.total}</span></a>
            {site.collections.map(c => <a key={c.slug} href={`/colecciones/${c.slug}`} aria-current={category === c.slug ? 'page' : undefined}>{c.title} <span>{c.total}</span></a>)}
          </nav>
          <Gallery initial={page.items} total={page.total} category={category} offset={page.offset} />
        </section>}
        <section className="contact section-pad" id="contacto">
          <div className="contact__intro"><p className="section-index">06 / Contacto</p><MotionText as="h2" text="Cuéntame qué quieres recordar." /><p>Tu fecha, tu celebración y tu manera de vivirla. Ese es el punto de partida para diseñar una cobertura personal.</p></div>
          <div className="contact-options">
            {contact.whatsapp || contact.email || contact.phone ? <>
              {contact.whatsapp && <a className="button button--light" href={`https://wa.me/${contact.whatsapp}`}>Consultar por WhatsApp <ArrowUpRight size={17} /></a>}
              {contact.email && <a className="text-link" href={`mailto:${contact.email}`}>Escribir a Rodrigo <ArrowUpRight size={17} /></a>}
              {contact.phone && <a className="text-link" href={`tel:${contact.phone}`}>Llamar a Rodrigo <ArrowUpRight size={17} /></a>}
            </> : <><h3>Hablemos de tu próxima historia.</h3><p>Las consultas en línea aún no están disponibles. Si ya estás en contacto con Rodrigo, puedes solicitarle tu propuesta por el canal que utilizas habitualmente.</p><a className="text-link" href="/portafolio">Mientras tanto, descubre su trabajo <ArrowUpRight size={17} /></a></>}
            {contact.instagram && <a className="text-link" href={contact.instagram}>Instagram <ArrowUpRight size={17} /></a>}
            {contact.location && <p>{contact.location}</p>}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Brand compact />
        <p>Fotografía por Rodrigo Vargas</p>
        <a href="/">Volver arriba ↑</a>
      </footer>

      <a className="mobile-cta" href="#contacto">
        Consultar fecha <ArrowUpRight size={17} />
      </a>
    </div>
  );
}

export default App;
