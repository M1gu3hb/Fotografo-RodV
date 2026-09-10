"""One-time migration of the approved editorial direction to the real portfolio."""
from pathlib import Path
p=Path('src/App.tsx');s=p.read_text(encoding='utf8')
s=s.replace('import { useEffect, useState }','import { useEffect, useRef, useState }')
s=s.replace('  CalendarDays,\n','')
s=s.replace('const navItems = [','import Gallery, { PhotoImage, type PageData } from "./Gallery";\nimport contact from "./config/contact.json";\n\nconst navItems = [')
s=s.replace('href: "#','href: "/#')
start=s.index('const collections = [');end=s.index('const experiences',start);s=s[:start]+s[end:]
s=s.replace('function App() {','function App({ page }: { page: PageData }) {\n  const { site, category } = page;\n  const isHome = category === "inicio";\n  const currentCollection = site.collections.find(c => c.slug === category);\n  const menuRef = useRef<HTMLDialogElement>(null);')
s=s.replace('  const [submitted, setSubmitted] = useState(false);\n','')
s=s.replace('document.body.style.overflow = menuOpen ? "hidden" : "";','if (menuOpen) menuRef.current?.showModal();\n    else menuRef.current?.close();\n    document.body.style.overflow = menuOpen ? "hidden" : "";')
start=s.index('      <div className="concept-banner">');end=s.index('      <header',start);s=s[:start]+'      <a className="skip-link" href="#contenido">Saltar al contenido</a>\n\n'+s[end:]
s=s.replace('href="#inicio"','href="/"')
s=s.replace('<div className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`} aria-hidden={!menuOpen}>','<dialog ref={menuRef} className="mobile-menu" aria-label="Menú principal" onCancel={closeMenu}>\n        <button className="menu-close" onClick={closeMenu} aria-label="Cerrar menú"><X /></button>')
s=s.replace('        <p>Fotografía por Rodrigo Vargas</p>\n      </div>','        <p>Fotografía por Rodrigo Vargas</p>\n      </dialog>')
s=s.replace('      <main>','      <main id="contenido">\n        {isHome ? <>')
s=s.replace('          <div className="hero__visual" aria-label="Espacio para fotografía destacada">\n            <img src="/brand/editorial-header.webp" alt="Textura editorial monocromática de The Best Moment" />','          <div className="hero__visual">\n            <PhotoImage photo={site.hero} priority sizes="(max-width: 1050px) 100vw, 50vw" />')
s=s.replace('<span>EST. — R.V.</span>','<span>RODRIGO VARGAS</span>')
s=s.replace('Una selección organizada para descubrir mucho trabajo sin convertir la experiencia en un archivo interminable.','Bodas, XV años y retratos. Cada colección, una forma distinta de mirar.')
start=s.index('            {collections.map(');end=s.index('          </div>',start)
# End of the full collection-grid, after closing map.
end=s.index('          </div>',s.index('            ))}',start))+len('          </div>')
s=s[:start]+'''            {site.collections.map((collection, index) => (
              <a className="collection" href={`/colecciones/${collection.slug}`} key={collection.slug}>
                <PhotoImage photo={collection.cover} />
                <div className="collection__veil" />
                <div className="collection__meta"><span>0{index + 1}</span><h3>{collection.title}</h3><ChevronRight size={20} /></div>
                <span className="collection__count">{collection.total} fotografías</span>
              </a>
            ))}
          </div>'''+s[end:]
start=s.index('          <div className="portfolio-strip"');end=s.index('        </section>',start)
s=s[:start]+'''          <div className="archive-link"><p>{site.total} fotografías. Un archivo para descubrir a tu ritmo.</p><a className="text-link" href="/portafolio">Explorar el archivo <ArrowUpRight size={17} /></a></div>
'''+s[end:]
s=s.replace('Los precios se integrarán cuando Rodrigo defina el alcance final de cada experiencia.','Cotización personalizada. La cobertura, la entrega y los acabados se acuerdan según tu evento.')
s=s.replace('Opciones de acabado por definir','Acabados a elección en tu propuesta')
s=s.replace('<img src="/brand/editorial-interaction.webp" alt="Textura editorial para presentar los fotolibros" />','<img src="/brand/editorial-interaction.webp" alt="" width={1536} height={1024} loading="lazy" />')
start=s.index('        <section className="contact section-pad"');end=s.index('      </main>',start)
s=s[:start]+'''        <section className="process section-pad" id="proceso">
          <div className="section-heading"><div><p className="section-index">04 / El proceso</p><h2>Todo comienza contigo.</h2></div><p>Una cobertura pensada desde la conversación hasta la última imagen.</p></div>
          <div className="process-grid">
            <article><span>01</span><h3>Conversamos</h3><p>Tu historia, la fecha y lo que te gustaría conservar.</p></article>
            <article><span>02</span><h3>Damos forma</h3><p>Acordamos la cobertura y una propuesta a tu medida.</p></article>
            <article><span>03</span><h3>Fotografiamos</h3><p>Atención a la luz, los detalles y lo que sucede de manera natural.</p></article>
            <article><span>04</span><h3>Conservamos</h3><p>Una selección cuidada para disfrutar en digital o en un fotolibro.</p></article>
          </div>
        </section>
        </> : <section className="collection-page section-pad">
          <a className="text-link" href="/#portafolio">← Volver a las colecciones</a>
          <div className="section-heading"><div><p className="section-index">El archivo / Rodrigo Vargas</p><h1>{currentCollection?.title || 'Todas las historias.'}</h1></div><p>{currentCollection?.description || 'Un recorrido por bodas, XV años y retratos. Explora las imágenes y detente en sus detalles.'}</p></div>
          <nav className="filters" aria-label="Filtrar fotografías">
            <a href="/portafolio" aria-current={category === 'todas' ? 'page' : undefined}>Todas <span>{site.total}</span></a>
            {site.collections.map(c => <a key={c.slug} href={`/colecciones/${c.slug}`} aria-current={category === c.slug ? 'page' : undefined}>{c.title} <span>{c.total}</span></a>)}
          </nav>
          <Gallery initial={page.items} total={page.total} category={category} offset={page.offset} />
        </section>}
        <section className="contact section-pad" id="contacto">
          <div className="contact__intro"><p className="section-index">05 / Contacto</p><h2>Cuéntame qué quieres recordar.</h2><p>Tu fecha, tu celebración y tu manera de vivirla. Ese es el punto de partida para diseñar una cobertura personal.</p></div>
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
'''+s[end:]
s=s.replace('Una cobertura precisa para conservar lo verdaderamente importante.','Una propuesta centrada en los momentos principales de tu celebración.')
s=s.replace('Más tiempo, más detalles y una narrativa completa de principio a fin.','Una propuesta más amplia para recorrer las distintas etapas de tu evento.')
s=s.replace('features: ["Cobertura fotográfica", "Selección editada", "Entrega digital"]','features: ["Cobertura a medida", "Selección fotográfica", "Opciones de entrega digital"]')
s=s.replace('features: ["Cobertura extendida", "Galería completa", "Selección para impresión"]','features: ["Cobertura ampliada a convenir", "Selección de momentos y detalles", "Opciones de impresión"]')
s=s.replace('features: ["Cobertura integral", "Fotolibro personalizado", "Piezas impresas"]','features: ["Propuesta integral a convenir", "Diseño de fotolibro", "Acabados personalizados"]')
s=s.replace('Recomendada','A tu medida')
s=s.replace('Creamos imágenes honestas con una mirada elegante, sensible y atemporal.','Rodrigo Vargas, la mirada detrás de The Best Moment. Fotografía con atención a la luz, la expresión y los detalles.')
p.write_text(s,encoding='utf8')
