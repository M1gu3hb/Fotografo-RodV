import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

import type { PageData } from "./Gallery";
import { useScrollReveals } from "./Motion";
import {
  ExperiencePage,
  formatPrice,
  GalleryPage,
  HomePage,
  PackageDetailPage,
  PackagesPage,
  PhotobooksPage,
} from "./SitePages";
import contact from "./config/contact.json";
import packages from "./data/packages.json";


const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Portafolio", href: "/portafolio" },
  { label: "Paquetes", href: "/paquetes" },
  { label: "Experiencia", href: "/experiencia" },
  { label: "Fotolibros", href: "/fotolibros" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return <a className={`brand ${compact ? "brand--compact" : ""}`} href="/" aria-label="The Best Moment, inicio">
    <span className="brand__motion">
      <svg className="brand__mark" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M5 17V5h12M31 5h12v12M43 31v12H31M17 43H5V31" />
        <path d="M15 24h18M24 15v18" className="brand__mark-cross" />
        <rect x="21" y="21" width="6" height="6" transform="rotate(45 24 24)" />
      </svg>
      <span className="brand__type"><span className="brand__small">The best</span><span className="brand__large">Moment</span></span>
    </span>
  </a>;
}

function ContactSection({ packageSlug }: { packageSlug: string | null }) {
  const selectedPackage = packages.find((item) => item.slug === packageSlug)?.slug || "";
  const handleWhatsApp = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (!contact.whatsapp) return;
    const fields = new FormData(submitEvent.currentTarget);
    const name = String(fields.get("name") || "").trim();
    const date = String(fields.get("date") || "").trim();
    const event = String(fields.get("event") || "").trim();
    const packageValue = String(fields.get("package") || "").trim();
    const details = String(fields.get("details") || "").trim();
    const chosenPackage = packages.find((item) => item.slug === packageValue)?.name || "aún por definir";
    const message = [
      `Hola Rodrigo, soy ${name}.`,
      `Quiero consultar disponibilidad para ${event}${date ? ` el ${date}` : ""}.`,
      `Paquete de interés: ${chosenPackage}.`,
      details ? `Detalles: ${details}` : "",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return <section className="contact section-pad" id="contacto">
    <div className="contact__intro"><p className="section-index">Contacto</p><h2>Cuéntame qué quieres recordar.</h2><p>Comparte lo esencial. El formulario prepara el mensaje y abre una conversación directa con Rodrigo en WhatsApp.</p><div className="contact__direct"><span>También puedes llamar</span>{contact.phone && <a className="text-link" href={`tel:${contact.phone}`}>{contact.phoneLabel || "Llamar a Rodrigo"} <ArrowUpRight size={17} /></a>}<p>Facebook e Instagram: <strong>{contact.socialName}</strong></p></div></div>
    <div className="contact__form-panel">
      <div className="contact__form-heading"><span>Tu historia comienza aquí</span><strong>Respuesta directa de Rodrigo</strong></div>
      <form className="contact-form" onSubmit={handleWhatsApp}>
        <div className="form-row">
          <label><span>Tu nombre</span><input name="name" autoComplete="name" placeholder="¿Cómo te llamas?" required /></label>
          <label><span>Fecha del evento</span><input name="date" type="date" /></label>
        </div>
        <div className="form-row">
          <label><span>Tipo de evento</span><select name="event" defaultValue="" required><option value="" disabled>Selecciona una opción</option><option>Boda</option><option>XV años</option><option>Retrato u otro</option></select></label>
          <label><span>Paquete de interés</span><select name="package" defaultValue={selectedPackage}><option value="">Aún no lo sé</option>{packages.map((item) => <option value={item.slug} key={item.slug}>{item.name} · {formatPrice(item.price)}</option>)}</select></label>
        </div>
        <label><span>Cuéntale un poco más</span><textarea name="details" rows={3} placeholder="Lugar, ceremonia o cualquier detalle que ya tengas en mente." /></label>
        <button className="button button--light" type="submit">Preparar mensaje en WhatsApp <ArrowUpRight size={17} /></button>
        <p className="form-note">Al continuar se abrirá WhatsApp con tu mensaje listo para revisar y enviar.</p>
      </form>
    </div>
  </section>;
}

function CurrentPage({ page }: { page: PageData }) {
  if (page.kind === "gallery") return <GalleryPage page={page} />;
  if (page.kind === "packages") return <PackagesPage site={page.site} />;
  if (page.kind === "package" && page.packageSlug) return <PackageDetailPage site={page.site} packageSlug={page.packageSlug} />;
  if (page.kind === "experience") return <ExperiencePage site={page.site} />;
  if (page.kind === "photobooks") return <PhotobooksPage site={page.site} />;
  return <HomePage site={page.site} />;
}

function App({ page }: { page: PageData }) {
  const menuRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollReveals();

  useEffect(() => {
    if (menuOpen) menuRef.current?.showModal();
    else menuRef.current?.close();
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  return <div className="site-shell">
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <div className="scroll-progress" aria-hidden="true" />
    <header className="site-header">
      <Brand />
      <nav className="desktop-nav" aria-label="Navegación principal">{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <a className="header-cta" href="#contacto">Consultar fecha <ArrowUpRight size={16} /></a>
      <button className="menu-button" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <dialog ref={menuRef} className="mobile-menu" aria-label="Menú principal" onCancel={closeMenu}>
      <button className="menu-close" onClick={closeMenu} aria-label="Cerrar menú"><X /></button>
      <nav aria-label="Navegación móvil">{navItems.map((item, index) => <a key={item.href} href={item.href} onClick={closeMenu}><span>0{index + 1}</span>{item.label}</a>)}</nav>
      <a className="button button--dark" href="#contacto" onClick={closeMenu}>Consultar fecha</a>
      <p>Fotografía por Rodrigo Vargas</p>
    </dialog>

    <main id="contenido"><CurrentPage page={page} /><ContactSection packageSlug={page.packageSlug} /></main>
    <footer className="site-footer"><Brand compact /><p>Fotografía por Rodrigo Vargas</p><a href="/">Inicio ↑</a></footer>
    <a className="mobile-cta" href="#contacto">Consultar fecha <ArrowUpRight size={17} /></a>
  </div>;
}

export default App;
