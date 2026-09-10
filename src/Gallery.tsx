import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X, Maximize2 } from 'lucide-react';

export type Photo = {
  id: string; category: string; alt: string; width: number; height: number;
  versions: { src: string; width: number; height: number; bytes: number }[];
};
export type Collection = { slug: string; title: string; description: string; total: number; cover: Photo; initial: Photo[] };
export type SiteData = { hero: Photo; collections: Collection[]; total: number; initial: Photo[] };
export type PageData = { site: SiteData; category: string; items: Photo[]; total: number; offset: number };

export function PhotoImage({ photo, priority = false, sizes = '(max-width: 600px) 100vw, (max-width: 1050px) 50vw, 33vw', large = false }: { photo: Photo; priority?: boolean; sizes?: string; large?: boolean }) {
  const versions = photo.versions;
  return <img src={versions[large ? versions.length - 1 : Math.min(1, versions.length - 1)].src}
    srcSet={versions.map(v => `${v.src} ${v.width}w`).join(', ')} sizes={sizes}
    alt={photo.alt} width={photo.width} height={photo.height}
    loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />;
}

function Lightbox({ photos, index, onClose, onChange }: { photos: Photo[]; index: number; onClose: () => void; onChange: (n: number) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const photo = photos[index];
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, []);
  const move = (delta: number) => onChange((index + delta + photos.length) % photos.length);
  return <dialog ref={dialog} className="lightbox" aria-label="Visor de fotografías" onCancel={onClose}
    onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } }}
    onTouchStart={event => { touchX.current = event.touches[0].clientX; }}
    onTouchEnd={event => { if (touchX.current !== null) { const delta = event.changedTouches[0].clientX - touchX.current; if (Math.abs(delta) > 60) move(delta < 0 ? 1 : -1); touchX.current = null; } }}>
    <div className="lightbox__bar"><span aria-live="polite">{index + 1} / {photos.length}</span><button onClick={onClose} aria-label="Cerrar fotografía" autoFocus><X /></button></div>
    <div className="lightbox__image"><PhotoImage key={photo.id} photo={photo} priority large sizes="100vw" /></div>
    <div className="lightbox__bottom"><button onClick={() => move(-1)} aria-label="Fotografía anterior"><ArrowLeft /></button>
      <p>{photo.alt}</p><button onClick={() => move(1)} aria-label="Fotografía siguiente"><ArrowRight /></button></div>
  </dialog>;
}

export default function Gallery({ initial, total, category, offset }: { initial: Photo[]; total: number; category: string; offset: number }) {
  const [photos, setPhotos] = useState(initial);
  const [pageOffset, setPageOffset] = useState(offset);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const grid = useRef<HTMLDivElement>(null);
  async function changePage(next: number) {
    if (loading) return;
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/gallery?category=${category}&offset=${next}&limit=24`);
      if (!response.ok) throw new Error('No se pudo cargar la colección. Inténtalo de nuevo.');
      const data = await response.json() as { items: Photo[] };
      setPhotos(data.items); setPageOffset(next);
      requestAnimationFrame(() => { grid.current?.focus(); grid.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo cargar la colección.'); }
    finally { setLoading(false); }
  }
  return <>
    <div ref={grid} tabIndex={-1} className="photo-grid" aria-label="Fotografías de la colección" aria-busy={loading}>
      {photos.map((photo, index) => <button className="photo-card" key={photo.id} onClick={() => setSelected(index)} aria-label={`Ampliar fotografía ${pageOffset + index + 1}: ${photo.alt}`}>
        <PhotoImage photo={photo} /><span className="photo-card__zoom" aria-hidden="true"><Maximize2 size={18} /></span>
      </button>)}
    </div>
    <div className="gallery-pagination"><p role="status">{loading ? 'Cargando fotografías…' : `${pageOffset + 1}–${Math.min(pageOffset + photos.length, total)} de ${total} fotografías`}</p>
      <div>{pageOffset > 0 && <button className="button" disabled={loading} onClick={() => changePage(Math.max(0, pageOffset - 24))}><ArrowLeft size={16} /> Anteriores</button>}
      {pageOffset + photos.length < total && <button className="button button--dark" disabled={loading} onClick={() => changePage(pageOffset + 24)}>Ver más fotografías <ArrowRight size={16} /></button>}</div>
    </div>
    {error && <p role="alert" className="gallery-error">{error}</p>}
    <noscript><p>Activa JavaScript para ampliar fotografías. Puedes explorar el archivo con los enlaces siguientes.</p>
      {pageOffset > 0 && <a href={`${category === 'todas' ? '/portafolio' : `/colecciones/${category}`}${pageOffset > 24 ? `/pagina/${pageOffset / 24}` : ''}`}>Página anterior</a>}{' '}
      {pageOffset + photos.length < total && <a href={`${category === 'todas' ? '/portafolio' : `/colecciones/${category}`}/pagina/${Math.floor(pageOffset / 24) + 2}`}>Página siguiente</a>}
    </noscript>
    {selected !== null && <Lightbox photos={photos} index={selected} onClose={() => setSelected(null)} onChange={setSelected} />}
  </>;
}
