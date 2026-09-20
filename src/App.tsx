import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

import type { PageData } from "./Gallery";
import { useScrollReveals } from "./Motion";
import {
  ExperiencePage,
  GalleryPage,
  HomePage,
  PackageDetailPage,
  PackagesPage,
  PhotobooksPage,
} from "./SitePages";
import contact from "./config/contact.json";


const navItems = [
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

function ContactSection() {
  return <section className="contact section-pad" id="contacto">
    <div className="contact__intro"><p className="section-index">Contacto</p><h2>Cuéntame qué quieres recordar.</h2><p>Tu fecha, tu celebración y tu manera de vivirla. Ese es el punto de partida para elegir una cobertura.</p></div>
    <div className="contact-options">
      <h3>Hablemos de tu historia.</h3>
      {contact.whatsapp && <a className="button button--light" href={`https://wa.me/${contact.whatsapp}`}>Consultar por WhatsApp <ArrowUpRight size={17} /></a>}
      {contact.phone && <a className="text-link" href={`tel:${contact.phone}`}>{contact.phoneLabel || "Llamar a Rodrigo"} <ArrowUpRight size={17} /></a>}
      <p>Facebook e Instagram: <strong>{contact.socialName}</strong></p>
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

    <main id="contenido"><CurrentPage page={page} /><ContactSection /></main>
    <footer className="site-footer"><Brand compact /><p>Fotografía por Rodrigo Vargas</p><a href="/">Inicio ↑</a></footer>
    <a className="mobile-cta" href="#contacto">Consultar fecha <ArrowUpRight size={17} /></a>
  </div>;
}

export default App;
