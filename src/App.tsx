import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpRight, Check, ChevronDown, Menu, X } from "lucide-react";

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
  const [take, setTake] = useState(0);
  const [playing, setPlaying] = useState(!compact);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setPlaying(false), 3300);
    return () => window.clearTimeout(timer);
  }, [playing, take]);
  const replay = () => {
    if (compact || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setTake((current) => current + 1);
    setPlaying(true);
  };
  return <a className={`brand ${compact ? "brand--compact" : ""} ${playing ? "brand--playing" : ""}`} href="/" aria-label="The Best Moment, inicio" onPointerEnter={replay} onFocus={replay}>
    <span className="brand__motion">
      <img className="brand__static" src={compact ? "/brand/the-best-moment-horizontal-final-white.png" : "/brand/the-best-moment-horizontal-final-black.png"} alt="" width={2200} height={700} />
      {!compact && playing && <img key={take} className="brand__gif" src="/brand/the-best-moment-horizontal-03-enfoque-fotografico.gif" alt="" width={1400} height={445} />}
    </span>
  </a>;
}

type SelectOption = { value: string; label: string; detail?: string };

function DesignedSelect({
  label,
  name,
  value,
  options,
  placeholder,
  error,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const labelId = useId();
  const valueId = useId();
  const listId = useId();
  const errorId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const focusOption = (index: number) => {
    optionRefs.current[Math.max(0, Math.min(options.length - 1, index))]?.focus();
  };
  const openWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpen(true);
    requestAnimationFrame(() => focusOption(event.key === "ArrowDown" ? 0 : options.length - 1));
  };
  const navigateOptions = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : index + (event.key === "ArrowDown" ? 1 : -1);
      focusOption(next);
    }
  };
  const choose = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    trigger.current?.focus();
  };

  return <div className={`designed-field ${error ? "designed-field--error" : ""}`}>
    <span className="designed-field__label" id={labelId}>{label}</span>
    <div className="designed-select" ref={root}>
      <input type="hidden" name={name} value={value} />
      <button
        aria-controls={listId}
        aria-describedby={error ? errorId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={Boolean(error)}
        aria-labelledby={`${labelId} ${valueId}`}
        className="designed-select__trigger"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={openWithKeyboard}
        ref={trigger}
        type="button"
      >
        <span id={valueId}><strong>{selected?.label || placeholder}</strong>{selected?.detail && <small>{selected.detail}</small>}</span>
        <ChevronDown aria-hidden="true" size={19} />
      </button>
      {open && <div className="designed-select__menu" id={listId} role="listbox" aria-labelledby={labelId}>
        {options.map((option, index) => <button
          aria-selected={option.value === value}
          className={option.value === value ? "is-selected" : ""}
          key={option.value || "empty"}
          onClick={() => choose(option.value)}
          onKeyDown={(event) => navigateOptions(event, index)}
          ref={(element) => { optionRefs.current[index] = element; }}
          role="option"
          type="button"
        >
          <span><strong>{option.label}</strong>{option.detail && <small>{option.detail}</small>}</span>
          <Check aria-hidden="true" size={17} />
        </button>)}
      </div>}
    </div>
    {error && <small className="designed-field__error" id={errorId} role="alert">{error}</small>}
  </div>;
}

const eventOptions: SelectOption[] = [
  { value: "Boda", label: "Boda", detail: "Ceremonia, sesión y celebración" },
  { value: "XV años", label: "XV años", detail: "Sesión, ceremonia y fiesta" },
  { value: "Retrato", label: "Retrato", detail: "Personal, familiar o editorial" },
  { value: "Otro tipo de evento", label: "Otro tipo de evento", detail: "Cuéntanos qué estás planeando" },
];

function ContactSection({ packageSlug }: { packageSlug: string | null }) {
  const selectedPackage = packages.find((item) => item.slug === packageSlug)?.slug || "";
  const [selectedEvent, setSelectedEvent] = useState("");
  const [packageValue, setPackageValue] = useState(selectedPackage);
  const [eventError, setEventError] = useState("");
  const handleWhatsApp = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (!contact.whatsapp) return;
    if (!selectedEvent) {
      setEventError("Selecciona el tipo de evento para continuar.");
      return;
    }
    const fields = new FormData(submitEvent.currentTarget);
    const name = String(fields.get("name") || "").trim();
    const date = String(fields.get("date") || "").trim();
    const customEvent = String(fields.get("eventOther") || "").trim();
    const event = selectedEvent === "Otro tipo de evento" ? customEvent : selectedEvent;
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
          <DesignedSelect label="Tipo de evento" name="event" value={selectedEvent} placeholder="Selecciona una opción" options={eventOptions} error={eventError} onChange={(value) => { setSelectedEvent(value); setEventError(""); }} />
          <DesignedSelect label="Paquete de interés" name="package" value={packageValue} placeholder="Aún no lo sé" options={[{ value: "", label: "Aún no lo sé", detail: "Rodrigo puede orientarte" }, ...packages.map((item) => ({ value: item.slug, label: item.name, detail: formatPrice(item.price) }))]} onChange={setPackageValue} />
        </div>
        {selectedEvent === "Otro tipo de evento" && <label className="contact-form__other"><span>¿Qué tipo de evento es?</span><input name="eventOther" placeholder="Graduación, aniversario, bautizo…" required /></label>}
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
