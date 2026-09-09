import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Portafolio", href: "#portafolio" },
  { label: "Experiencias", href: "#experiencias" },
  { label: "Fotolibros", href: "#fotolibros" },
  { label: "Contacto", href: "#contacto" },
];

const collections = [
  { number: "01", title: "XV años", className: "collection--wide" },
  { number: "02", title: "Bodas", className: "collection--portrait" },
  { number: "03", title: "Sesiones", className: "collection--square" },
  { number: "04", title: "Fotolibros", className: "collection--landscape" },
];

const experiences = [
  {
    number: "01",
    name: "Esencia",
    description: "Una cobertura precisa para conservar lo verdaderamente importante.",
    features: ["Cobertura fotográfica", "Selección editada", "Entrega digital"],
  },
  {
    number: "02",
    name: "Historia",
    description: "Más tiempo, más detalles y una narrativa completa de principio a fin.",
    features: ["Cobertura extendida", "Galería completa", "Selección para impresión"],
    featured: true,
  },
  {
    number: "03",
    name: "Legado",
    description: "La experiencia integral, pensada para vivir en pantalla y en papel.",
    features: ["Cobertura integral", "Fotolibro personalizado", "Piezas impresas"],
  },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#inicio" aria-label="The Best Moment, inicio">
      <svg className="brand__mark" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M5 17V5h12M31 5h12v12M43 31v12H31M17 43H5V31" />
        <path d="M15 24h18M24 15v18" className="brand__mark-cross" />
        <rect x="21" y="21" width="6" height="6" transform="rotate(45 24 24)" />
      </svg>
      <span className="brand__type">
        <span className="brand__small">The best</span>
        <span className="brand__large">Moment</span>
      </span>
    </a>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <div className="concept-banner">
        <span>Concepto visual</span>
        <span>Fotografías originales por integrar</span>
      </div>

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

      <div className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`} aria-hidden={!menuOpen}>
        <nav aria-label="Navegación móvil">
          {navItems.map((item, index) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              <span>0{index + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <p>Fotografía por Rodrigo Vargas</p>
      </div>

      <main>
        <section className="hero" id="inicio">
          <div className="hero__copy">
            <p className="eyebrow">Fotografía por Rodrigo Vargas</p>
            <h1>
              Lo extraordinario
              <span>vive en un instante.</span>
            </h1>
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
          <div className="hero__visual" aria-label="Espacio para fotografía destacada">
            <img src="/brand/editorial-header.webp" alt="Textura editorial monocromática de The Best Moment" />
            <div className="hero__visual-label">
              <span>THE BEST MOMENT</span>
              <span>EST. — R.V.</span>
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
              Creamos imágenes honestas con una mirada elegante, sensible y atemporal.
            </p>
          </div>
        </section>

        <section className="portfolio section-pad" id="portafolio">
          <div className="section-heading">
            <div>
              <p className="section-index">01 / Portafolio</p>
              <h2>Historias que permanecen.</h2>
            </div>
            <p>Una selección organizada para descubrir mucho trabajo sin convertir la experiencia en un archivo interminable.</p>
          </div>

          <div className="collection-grid">
            {collections.map((collection, index) => (
              <a className={`collection ${collection.className}`} href="#contacto" key={collection.title}>
                <img
                  src={index % 2 === 0 ? "/brand/editorial-interaction.webp" : "/brand/editorial-header.webp"}
                  alt=""
                />
                <div className="collection__veil" />
                <div className="collection__meta">
                  <span>{collection.number}</span>
                  <h3>{collection.title}</h3>
                  <ChevronRight size={20} strokeWidth={1.4} />
                </div>
                <span className="collection__count">Colección</span>
              </a>
            ))}
          </div>

          <div className="portfolio-strip" aria-label="Vista compacta del archivo fotográfico">
            {Array.from({ length: 10 }).map((_, index) => (
              <span key={index} className={`portfolio-strip__frame portfolio-strip__frame--${(index % 4) + 1}`} />
            ))}
            <div className="portfolio-strip__caption">
              <span>Archivo completo</span>
              <span>Vista rápida · Carga progresiva</span>
            </div>
          </div>
        </section>

        <section className="experiences section-pad" id="experiencias">
          <div className="section-heading section-heading--light">
            <div>
              <p className="section-index">02 / Experiencias</p>
              <h2>Elige cómo quieres recordarlo.</h2>
            </div>
            <p>Cada propuesta podrá personalizarse según el evento, la duración y la forma de entrega.</p>
          </div>

          <div className="experience-list">
            {experiences.map((experience) => (
              <article className={`experience ${experience.featured ? "experience--featured" : ""}`} key={experience.name}>
                <div className="experience__topline">
                  <span>{experience.number}</span>
                  {experience.featured && <span className="experience__tag">Recomendada</span>}
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
          <p className="price-note">Los precios se integrarán cuando Rodrigo defina el alcance final de cada experiencia.</p>
        </section>

        <section className="photobooks section-pad" id="fotolibros">
          <div className="photobooks__visual">
            <img src="/brand/editorial-interaction.webp" alt="Textura editorial para presentar los fotolibros" />
            <div className="photobooks__folio">
              <span>Una historia</span>
              <strong>que también se toca.</strong>
              <span>Fotolibros · The Best Moment</span>
            </div>
          </div>
          <div className="photobooks__copy">
            <p className="section-index">03 / Fotolibros</p>
            <h2>De la pantalla a tus manos.</h2>
            <p>
              Una selección de imágenes convertida en una pieza editorial para volver a ella durante años.
            </p>
            <ul>
              <li><BookOpen size={18} strokeWidth={1.4} /> Diseño personalizado</li>
              <li><Check size={18} strokeWidth={1.4} /> Selección y composición fotográfica</li>
              <li><Check size={18} strokeWidth={1.4} /> Opciones de acabado por definir</li>
            </ul>
            <a className="text-link text-link--dark" href="#contacto">
              Conocer fotolibros <ArrowUpRight size={17} />
            </a>
          </div>
        </section>

        <section className="contact section-pad" id="contacto">
          <div className="contact__intro">
            <p className="section-index">04 / Contacto</p>
            <h2>Cuéntanos qué quieres recordar.</h2>
            <p>Comparte los datos esenciales. El canal definitivo de contacto se conectará cuando Rodrigo lo confirme.</p>
            <div className="contact__availability">
              <CalendarDays size={19} strokeWidth={1.4} />
              <span>Consulta de fecha y cobertura</span>
            </div>
          </div>
          <form
            className="contact-form"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <label>
              Nombre
              <input type="text" name="name" placeholder="Tu nombre" required />
            </label>
            <label>
              Correo o teléfono
              <input type="text" name="contact" placeholder="Cómo podemos contactarte" required />
            </label>
            <div className="form-row">
              <label>
                Tipo de sesión
                <select name="type" defaultValue="">
                  <option value="" disabled>Selecciona una opción</option>
                  <option>XV años</option>
                  <option>Boda</option>
                  <option>Sesión</option>
                  <option>Fotolibro</option>
                  <option>Otro</option>
                </select>
              </label>
              <label>
                Fecha aproximada
                <input type="date" name="date" />
              </label>
            </div>
            <label>
              Cuéntanos un poco
              <textarea name="message" rows={4} placeholder="Lugar, número de personas y lo que imaginas para ese día" />
            </label>
            <button className="button button--light" type="submit">
              {submitted ? "Solicitud preparada" : "Solicitar disponibilidad"}
              {submitted ? <Check size={17} /> : <ArrowUpRight size={17} />}
            </button>
            {submitted && <p className="form-note">La interfaz está lista; falta conectar el medio de contacto de Rodrigo.</p>}
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <Brand compact />
        <p>Fotografía por Rodrigo Vargas</p>
        <a href="#inicio">Volver arriba ↑</a>
      </footer>

      <a className="mobile-cta" href="#contacto">
        Consultar fecha <ArrowUpRight size={17} />
      </a>
    </div>
  );
}

export default App;
