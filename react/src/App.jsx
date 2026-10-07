import { useEffect, useRef, useState } from 'react';
import './pad-viewer.js'; // original 3D viewer, unchanged — registers <pad-viewer>
import {
  navLinks, heroStats, products, productHighlights, productPromises, ICONS, modelPoints, processSteps, benefits,
  trustedBy, counters, galleryItems, galleryCategories, galleryBadges, galleryPerks, certifications, certPerks, faqs, faqBadges, faqPoints,
} from './data.js';

const autoGrid = (min, gap) => ({ gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`, gap });

const LEAF = 'M3 46C18 6 70 0 97 9C84 46 38 60 3 46Z';
const LEAF_RIB = 'M6 44C30 34 66 20 95 10';
const LEAF_VEINS = 'M20 40C30 30 40 22 46 16M40 46C50 34 58 24 66 14M56 50C64 38 72 26 80 13';

function useScroll() {
  const [s, set] = useState({ pct: 0, y: 0 });
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY || 0;
        const doc = document.documentElement;
        const pct = doc.scrollHeight > doc.clientHeight ? (y / (doc.scrollHeight - doc.clientHeight)) * 100 : 0;
        set({ pct, y });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return s;
}

// eased 0→1 once the element is 35% visible
function useCountUp(ref) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setT(1); return; }
    let raf, done = false;
    const io = new IntersectionObserver((entries) => {
      if (done || !entries.some((e) => e.isIntersecting)) return;
      done = true;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / 1400);
        setT(1 - Math.pow(1 - p, 3));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.35 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [ref]);
  return t;
}

function Icon({ d, size = 20, width = 1.7, join }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0b7f77" strokeWidth={width} strokeLinecap="round" strokeLinejoin={join}>
      <path d={d} />
    </svg>
  );
}

// Brand logo, redrawn as vector from the original print logo (stroke 25, brand blue #2b3f97)
function Logo() {
  return (
    <svg viewBox="12 22 380 216" className="logo-svg" aria-hidden="true">
      <g fill="none" stroke="#2b3f97" strokeWidth="25">
        <path d="M58.5 34V110.75A48.75 48.75 0 0 0 156 110.75V100" />
        <path d="M156 104V94.75A48.25 48.25 0 0 1 252.5 94.75V111.75A47.75 47.75 0 0 0 348 111.75V104" />
        <path d="M348 100V63" />
      </g>
      <circle cx="348.5" cy="48.5" r="13" fill="#2b3f97" />
      <text x="17" y="233" textLength="371" lengthAdjust="spacingAndGlyphs" fill="#2b3f97" fontFamily="Montserrat, Arial, sans-serif" fontWeight="500" fontSize="52">COOL ECOTECH</text>
    </svg>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const close = () => setOpen(false);
  return (
    <nav className={'nav' + (open ? ' open' : '')}>
      <a href="#" className="logo" aria-label="Unicool Ecotech — home" onClick={close}><Logo /></a>
      <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="nav-links" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10161a" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div id="nav-links" className="nav-links">
        {navLinks.map(([href, label]) => <a key={href} href={href} className="nav-link" onClick={close}>{label}</a>)}
        <a href="#contact" className="nav-cta" onClick={close}>Enquire</a>
      </div>
    </nav>
  );
}

function Hero({ parallax }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="hero-tag-row">
          <div className="hero-tag">HONEYCOMB COOLING PAD MANUFACTURER</div>
          <div className="rule" style={{ width: 40, background: '#0b7f77' }} />
        </div>
        <h1>Cooling pads engineered for <span style={{ color: '#0b7f77' }}>industrial duty.</span></h1>
        <p className="hero-lead">Cross-fluted cellulose honeycomb pads for air coolers, greenhouses and poultry houses &mdash; manufactured in standard and custom sizes for distributors and OEMs.</p>
        <div className="hero-ctas">
          <a href="#contact" className="btn-primary">Request a Quote <span style={{ fontSize: 17, lineHeight: 1 }}>&rarr;</span></a>
          <a href="#model" className="btn-outline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b7f77" strokeWidth="1.7" strokeLinejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></svg>
            Inspect in 3D
          </a>
        </div>
        <div className="hero-stats">
          {heroStats.map((s) => (
            <div key={s.label} className="hero-stat">
              <div className="icon-circle"><Icon d={s.icon} /></div>
              <div>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-glow" />
        <div className="air-1" />
        <div className="air-2" />
        <svg viewBox="0 0 100 60" width="86" height="52" className="leaf-1">
          <defs>
            <linearGradient id="leafG1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6dc47f" />
              <stop offset="45%" stopColor="#3a9e56" />
              <stop offset="100%" stopColor="#1f7a3d" />
            </linearGradient>
            <radialGradient id="leafShine1" cx="30%" cy="25%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={LEAF} fill="url(#leafG1)" />
          <path d={LEAF} fill="url(#leafShine1)" />
          <path d={LEAF_RIB} stroke="#134f27" strokeWidth="1.6" fill="none" opacity="0.7" />
          <path d={LEAF_VEINS} stroke="#134f27" strokeWidth="0.9" fill="none" opacity="0.45" />
        </svg>
        <svg viewBox="0 0 100 60" width="66" height="40" className="leaf-2">
          <path d={LEAF} fill="url(#leafG1)" />
          <path d={LEAF} fill="url(#leafShine1)" />
          <path d={LEAF_RIB} stroke="#134f27" strokeWidth="1.6" fill="none" opacity="0.7" />
          <path d={LEAF_VEINS} stroke="#134f27" strokeWidth="0.9" fill="none" opacity="0.45" />
        </svg>
        <svg viewBox="0 0 100 60" width="190" height="114" className="leaf-3">
          <path d={LEAF} fill="url(#leafG1)" />
          <path d={LEAF_RIB} stroke="#134f27" strokeWidth="1.6" fill="none" opacity="0.6" />
        </svg>
        <img src="assets/hero-pad.png" alt="Unicool honeycomb cellulose cooling pad" className="hero-img" style={{ transform: `translateY(${parallax}px)` }} />
      </div>
    </section>
  );
}

function Products() {
  return (
    <section id="products" className="products">

      <div className="products-head">
        <div style={{ maxWidth: 640 }}>
          <div className="products-eyebrow">OUR PRODUCTS <span className="rule" style={{ width: 54, background: '#0b7f77' }} /></div>
          <h2 className="products-title">Sustainable Cooling<br /><span>Solutions for Industry.</span></h2>
          <p className="products-lead">Explore our range of high-performance honeycomb cooling pads, designed for maximum efficiency, durability and eco-friendly cooling.</p>
          <div className="highlights">
            {productHighlights.map((h) => (
              <div key={h.label} className="highlight">
                <Icon d={ICONS[h.icon]} size={24} width={1.8} join="round" />
                <span>{h.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="products-note" aria-hidden="true">
          <div>Engineered<br />for a Cooler<br />Tomorrow</div>
          <svg width="70" height="96" viewBox="0 0 70 96" fill="none" stroke="#0b7f77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M54 4c12 30 4 62-26 84" /><path d="M28 88l13-2M28 88l1-13" />
          </svg>
        </div>
      </div>

      <div className="product-grid">
        {products.map((p) => (
          <article key={p.name} className="product-card">
            <div className="product-media">
              {p.badge && (
                <div className="product-badge">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffffff"><path d="M2 5l4.5 4L12 3l5.5 6L22 5l-2 13H4L2 5zM4 20h16v2H4z" /></svg>
                  {p.badge}
                </div>
              )}
              <img src={p.photo} alt={p.name} />
            </div>
            <div className="product-body">
              <h3 className="product-name">{p.name}</h3>
              <p className="product-text">{p.body}</p>
              <div className="product-pill">{p.meta}</div>
              <div className="product-features">
                {p.features.map(([icon, label]) => (
                  <div key={label} className="product-feature">
                    <Icon d={ICONS[icon]} size={22} width={1.8} join="round" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="product-actions">
                <a href="#contact" className="product-link">View Details <Icon d={ICONS.arrow} size={16} width={2} join="round" /></a>
                <a href="#contact" className="product-go" aria-label={`Enquire about ${p.name}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS.arrow} /></svg>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="promises">
        {productPromises.map((x) => (
          <div key={x.title} className="promise">
            <Icon d={ICONS[x.icon]} size={34} width={1.7} join="round" />
            <div>
              <div className="promise-title">{x.title}</div>
              <div className="promise-body">{x.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Model() {
  return (
    <section id="model" className="section tight model">
      <div className="model-copy">
        <div className="products-eyebrow">HOW IT WORKS <span className="rule" style={{ width: 54, background: '#0b7f77' }} /></div>
        <h2>Smart Design. <span>Natural Cooling.</span></h2>
        <p className="model-lead">Our honeycomb cooling pads are engineered with a unique hexagonal structure that maximizes water retention, increases airflow and delivers superior cooling performance &mdash; naturally.</p>
        <div className="model-points">
          {modelPoints.map((pt) => (
            <div key={pt.num} className="model-point">
              <div className="point-num">{pt.num}</div>
              <div className="point-body">
                <div className="point-title">{pt.title}</div>
                <div className="point-text">{pt.body}</div>
              </div>
              <div className="point-icon"><Icon d={pt.icon} size={22} width={1.7} join="round" /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="viewer-wrap">
        <svg viewBox="0 0 300 300" style={{ position: 'absolute', width: '104%', height: '104%', overflow: 'visible' }}>
          <g fill="none" stroke="#97a8a2" strokeWidth="1.3" vectorEffect="non-scaling-stroke">
            <polygon points="150,6 286,80 286,220 150,294 14,220 14,80" />
            <line x1="150" y1="6" x2="150" y2="150" />
            <line x1="14" y1="80" x2="150" y2="150" />
            <line x1="286" y1="80" x2="150" y2="150" />
            <line x1="150" y1="150" x2="150" y2="294" />
          </g>
        </svg>

        <div className="callout" style={{ top: '4%', left: '2%' }}>
          <div className="callout-text">HEXAGONAL CELLS</div>
          <div className="callout-line" style={{ width: 30 }} />
        </div>
        <svg width="100" height="90" className="callout-svg" style={{ top: '15%', left: '24%' }}>
          <line x1="0" y1="0" x2="80" y2="70" stroke="#a9b0a5" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" fill="#0b7f77" />
        </svg>

        <div className="callout" style={{ top: '4%', right: '0%' }}>
          <div className="callout-line" style={{ width: 30 }} />
          <div className="callout-text">KRAFT CELLULOSE CORE</div>
        </div>
        <svg width="90" height="80" className="callout-svg" style={{ top: '15%', right: '26%' }}>
          <line x1="90" y1="0" x2="10" y2="65" stroke="#a9b0a5" strokeWidth="1" />
          <circle cx="90" cy="0" r="3" fill="#0b7f77" />
        </svg>

        <div className="callout" style={{ top: '58%', right: 0 }}>
          <div className="callout-line" style={{ width: 26 }} />
          <div className="callout-text" style={{ whiteSpace: 'nowrap' }}>RIGID STRUCTURE</div>
        </div>
        <svg width="30" height="10" className="callout-svg" style={{ top: '59%', right: '24%' }}>
          <line x1="0" y1="0" x2="30" y2="0" stroke="#a9b0a5" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" fill="#0b7f77" />
        </svg>

        <pad-viewer background="transparent" autorotate="" style={{ position: 'relative', zIndex: 2, width: '90%', height: '90%' }} />

        <svg viewBox="0 0 220 60" style={{ position: 'absolute', bottom: '10%', width: 220, height: 60, zIndex: 1 }}>
          <ellipse cx="110" cy="16" rx="90" ry="12" fill="none" stroke="#9aa39c" strokeWidth="1" strokeDasharray="3 4" />
          <path d="M22 10 l-6 -2 l1 6 z" fill="#9aa39c" />
        </svg>
        <div className="viewer-hint">DRAG TO ROTATE 360&deg;</div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="section">
      <div className="eyebrow teal">HOW IT WORKS</div>
      <h2 className="h2" style={{ marginBottom: 48 }}>Three steps to cooler air.</h2>
      <div className="grid" style={autoGrid(250, 28)}>
        {processSteps.map((s) => (
          <div key={s.num} className="step">
            <div className="step-num">{s.num}</div>
            <div className="step-title">{s.title}</div>
            <div className="step-body">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section about">
      <div>
        <div className="eyebrow teal">ABOUT US</div>
        <h2>Manufacturing cooling pads since day one.</h2>
        <p>Unicool Ecotech makes cross-fluted and honeycomb cellulose cooling pads for industrial air coolers, greenhouses and poultry houses. From raw kraft paper to finished, resin-treated panels, every stage happens in-house so every pad ships to the same spec.</p>
        <p>We supply distributors and OEMs with standard stock sizes and made-to-drawing custom cuts, backed by consistent lead times and bulk pricing.</p>
      </div>
      <div className="about-media">
        <img src="assets/pad-angle-2.png" alt="Unicool Ecotech honeycomb cooling pad" className="cutout" />
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="why">
      <div className="why-head">
        <div>
          <div className="products-eyebrow">WHY UNICOOL <span className="rule" style={{ width: 54, background: '#0b7f77' }} /></div>
          <h2 className="products-title" style={{ marginBottom: 0 }}>Built for <span>continuous duty.</span></h2>
        </div>
        <p className="products-lead why-lead">Every Unicool pad is engineered to run day after day in hot, wet conditions &mdash; without sagging, rotting or losing cooling performance.</p>
      </div>
      <div className="benefits">
        {benefits.map((b, i) => (
          <article key={b.title} className="benefit">
            <div className="benefit-top">
              <span className="benefit-icon"><Icon d={b.icon} size={26} width={1.7} join="round" /></span>
              <span className="benefit-num">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="benefit-title">{b.title}</h3>
            <p className="benefit-body">{b.body}</p>
            <span className="benefit-tag">{b.tag}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustedBy() {
  return (
    <section className="trusted">
      <div className="trusted-label">TRUSTED BY DISTRIBUTORS &amp; OEMS ACROSS THE INDUSTRY</div>
      <div className="trusted-row">
        {trustedBy.map((name) => <div key={name} className="trusted-name">{name}</div>)}
      </div>
    </section>
  );
}

function Counters() {
  const ref = useRef(null);
  const t = useCountUp(ref);
  return (
    <section ref={ref} className="counters">
      <div className="grid" style={autoGrid(180, 32)}>
        {counters.map((c) => (
          <div key={c.label}>
            <div className="counter-value">{Math.round(c.value * t) + c.suffix}</div>
            <div className="counter-label">{c.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  const [cat, setCat] = useState('All Products');
  const [zoom, setZoom] = useState(null);
  const dialog = useRef(null);
  const items = cat === 'All Products' ? galleryItems : galleryItems.filter((g) => g.cat === cat);
  const open = (g) => { setZoom(g); dialog.current.showModal(); };
  return (
    <section id="gallery" className="gallery">
      <div className="gallery-head">
        <div>
          <div className="products-eyebrow">GALLERY <span className="rule" style={{ width: 34, background: '#0b7f77' }} /></div>
          <h2 className="products-title" style={{ marginBottom: 14 }}>Explore Our<br /><span>Cooling Pads</span></h2>
          <p className="products-lead" style={{ marginBottom: 0 }}>A closer look at our honeycomb cooling pads, crafted for performance, durability and sustainable cooling.</p>
        </div>
        <div className="gallery-badges">
          {galleryBadges.map((x) => (
            <div key={x.title} className="gallery-badge">
              <span className="g-icon"><Icon d={ICONS[x.icon]} size={24} width={1.8} join="round" /></span>
              <div><b>{x.title}</b><span>{x.sub}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="gallery-bar">
        <div className="gallery-tabs" role="tablist">
          {['All Products', ...galleryCategories].map((c) => (
            <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="gallery-grid">
        {items.map((g) => (
          <figure key={g.photo} className="gallery-card">
            <div className="gallery-media">
              <img src={g.photo} alt={`${g.cat} \u2014 ${g.view}`} className="cutout" />
              <button type="button" className="gallery-zoom" onClick={() => open(g)} aria-label={`Enlarge ${g.view}`}>
                <Icon d={ICONS.expand} size={15} width={2} join="round" />
              </button>
            </div>
            <figcaption>
              <b>{g.cat}</b>
              <span>{g.view}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="gallery-perks">
        {galleryPerks.map((x) => (
          <div key={x.title} className="gallery-perk">
            <span className="g-icon lg"><Icon d={ICONS[x.icon]} size={24} width={1.8} join="round" /></span>
            <div><b>{x.title}</b><span>{x.body}</span></div>
          </div>
        ))}
      </div>

      {/* native <dialog>: Esc closes it, focus is handled by the browser */}
      <dialog ref={dialog} className="gallery-dialog" onClick={(e) => e.target === dialog.current && dialog.current.close()}>
        {zoom && <img src={zoom.photo} alt={`${zoom.cat} \u2014 ${zoom.view}`} />}
        {zoom && <p><b>{zoom.cat}</b> &middot; {zoom.view}</p>}
        <button type="button" className="gallery-close" onClick={() => dialog.current.close()} aria-label="Close">
          <Icon d={ICONS.close} size={18} width={2} join="round" />
        </button>
      </dialog>
    </section>
  );
}

function Certifications() {
  return (
    <section className="certs">
      <div className="certs-head">
        <div className="certs-copy">
          <div className="products-eyebrow">CERTIFICATIONS &amp; QUALITY <span className="rule" style={{ width: 46, background: '#0b7f77' }} /></div>
          <h2 className="products-title" style={{ marginBottom: 18 }}>Built to recognized<br /><span>standards.</span></h2>
          <p className="products-lead" style={{ marginBottom: 0 }}>Our honeycomb cooling pads are manufactured under strict quality control and meet international standards for safety, performance and sustainability. Because your trust matters.</p>
        </div>
        <div className="certs-photo">
          <img src="assets/cert/cert-hero.jpg" alt="Unicool Ecotech quality inspector checking honeycomb cooling pads" />
          <div className="certs-note" aria-hidden="true">
            <div>Quality<br />You Can<br />Trust</div>
            <svg width="46" height="52" viewBox="0 0 46 52" fill="none" stroke="#0b7f77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M38 3c4 20-6 36-30 44" /><path d="M8 47l11 1M8 47l5-10" />
            </svg>
          </div>
        </div>
      </div>

      <div className="cert-grid">
        {certifications.map((c) => (
          <article key={c.name} className="cert">
            <img src={c.photo} alt={`${c.name} certification`} className="cert-img" />
            <div className="cert-body">
              <span className="product-pill" style={{ marginBottom: 12 }}>{c.name}</span>
              <h3 className="cert-title">{c.title}</h3>
              <p className="cert-text">{c.body}</p>
              <a href="#contact" className="product-link cert-link">Learn more <Icon d={ICONS.arrow} size={16} width={2} join="round" /></a>
            </div>
          </article>
        ))}
      </div>

      <div className="gallery-perks">
        {certPerks.map((x) => (
          <div key={x.title} className="gallery-perk">
            <span className="g-icon lg"><Icon d={ICONS[x.icon]} size={24} width={1.8} join="round" /></span>
            <div><b>{x.title}</b><span>{x.body}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="faq-section">
      <div className="faq-top">
        <div>
          <div className="products-eyebrow">FAQ <span className="rule" style={{ width: 54, background: '#0b7f77' }} /></div>
          <h2 className="products-title" style={{ marginBottom: 16 }}>Common <span>questions.</span></h2>
          <p className="products-lead" style={{ marginBottom: 26 }}>Find quick answers to the most common queries about our honeycomb cooling pads, manufacturing process, sizes, supply and more.</p>
          <div className="highlights">
            {faqBadges.map((x) => (
              <div key={x.label} className="highlight">
                <span className="faq-badge-icon"><Icon d={ICONS[x.icon]} size={22} width={1.8} join="round" /></span>
                <span>{x.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="faq-visual">
          <div className="faq-stage">
            <div className="faq-ring" />
            <img src="assets/pad-hero.png" alt="Unicool honeycomb cooling pad" />
          </div>
          <div className="faq-note" aria-hidden="true">
            <div>Efficient<br />Cooling<br />Starts Here</div>
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" stroke="#0b7f77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M42 4c-2 20-14 34-34 40" /><path d="M8 44l12 1M8 44l4-11" />
            </svg>
          </div>
          <ul className="faq-points">
            {faqPoints.map((x) => (
              <li key={x.label}><span className="faq-badge-icon"><Icon d={ICONS[x.icon]} size={18} width={1.8} join="round" /></span>{x.label}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="faq-main">
        <div className="faq-panel">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={'faq-item' + (isOpen ? ' open' : '')}>
                <button type="button" className="faq-q" aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="faq-q-text">{f.q}</span>
                  <span className="faq-sym" aria-hidden="true">{isOpen ? '\u2212' : '+'}</span>
                </button>
                {isOpen && <p id={`faq-a-${i}`} className="faq-a">{f.a}</p>}
              </div>
            );
          })}
        </div>

        <aside className="faq-help">
          <div className="faq-help-inner">
            <img src="assets/faq/support.jpg" alt="Unicool Ecotech support team" className="faq-help-photo" />
            <span className="faq-help-icon"><Icon d={ICONS.headset} size={24} width={1.8} join="round" /></span>
            <div className="faq-help-eyebrow">NEED HELP?</div>
            <h3>We&rsquo;re here<br />to assist you.</h3>
            <p>Have more questions or need a custom solution? Get in touch with our team &mdash; we&rsquo;re happy to help.</p>
            <a href="#contact" className="btn-primary faq-help-btn">Contact Us <Icon d={ICONS.arrow} size={16} width={2.2} join="round" /></a>
            <div className="faq-help-links">
              <a href="mailto:sales@unicoolecotech.com"><Icon d={ICONS.mail} size={18} width={1.8} join="round" /> Email Us</a>
            </div>
          </div>
        </aside>
      </div>

      <div className="faq-tagline"><span />SUSTAINABLE COOLING &nbsp;&bull;&nbsp; LONGER LASTING IMPACT<span /></div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="contact">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="eyebrow teal" style={{ marginBottom: 16 }}>GET IN TOUCH</div>
        <h2>Request a Quote</h2>
        <p>Send your size, thickness and quantity &mdash; we quote within one working day.</p>
        <a href="mailto:sales@unicoolecotech.com" className="btn-mail">sales@unicoolecotech.com</a>
      </div>
    </section>
  );
}

export default function App() {
  const { pct, y } = useScroll();
  return (
    <div className="page">
      <div className="scroll-bar" style={{ width: pct + '%' }} />
      <Nav />
      <Hero parallax={-y * 0.06} />
      <Products />
      <Model />
      <Process />
      <About />
      <Why />
      <TrustedBy />
      <Counters />
      <Gallery />
      <Certifications />
      <Faq />
      <Contact />
      <footer className="footer">
        <div>&copy; 2026 Unicool Ecotech</div>
        <div>Honeycomb Cooling Pad Manufacturing</div>
      </footer>
    </div>
  );
}
