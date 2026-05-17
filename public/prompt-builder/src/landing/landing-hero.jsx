// Hero — left text, right cascading chip grid + floating prompt card.

const ROLES = ['Cinematographers', 'Directors', 'DPs', 'Production Designers', 'Storyboard Artists'];

function HeroNav({ accent }) {
  return (
    <nav style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '22px 32px', fontSize: 13, color: 'var(--text-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 22, height: 22, borderRadius: 6, display: 'inline-grid', placeItems: 'center',
          background: accent, color: '#fff', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500,
        }}>P</span>
        <span style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>Prompt Builder</span>
        <span style={{ color: 'var(--dim)', fontSize: 12, marginLeft: 4 }}>Film & AI Image</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 13 }}>
        <a href="#categories" style={{ color: 'var(--muted)' }}>Categories</a>
        <a href="#anatomy" style={{ color: 'var(--muted)' }}>How it works</a>
        <a href="#models" style={{ color: 'var(--muted)' }}>Models</a>
        <a href="prompt-builder.html" style={{
          padding: '7px 14px', borderRadius: 8, border: `1px solid ${accent}`, color: accent, fontWeight: 500,
        }}>Open the tool →</a>
      </div>
    </nav>
  );
}

function RoleSwap({ rotate, accent }) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (!rotate) return;
    const id = setInterval(() => setI((x) => (x + 1) % ROLES.length), 2400);
    return () => clearInterval(id);
  }, [rotate]);
  return (
    <span style={{
      position: 'relative', display: 'inline-block', color: accent, fontWeight: 500,
      verticalAlign: 'baseline',
    }}>
      <span style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>Production Designers</span>
      {ROLES.map((r, idx) => (
        <span key={r} style={{
          position: 'absolute', left: 0, top: 0,
          opacity: idx === i ? 1 : 0,
          transform: idx === i ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity .5s ease, transform .5s ease',
          whiteSpace: 'nowrap',
        }}>{r}</span>
      ))}
    </span>
  );
}

// A single chip — supports selected, ghost, and "preview" pulse states.
function Chip({ label, selected, dim, glow }) {
  const base = {
    fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 400,
    padding: '7px 14px', borderRadius: 999, whiteSpace: 'nowrap',
    border: '1px solid', transition: 'all .3s ease',
  };
  if (selected) {
    return <span style={{
      ...base,
      background: 'var(--accent)', color: '#fff',
      borderColor: 'var(--accent)',
      boxShadow: glow ? '0 0 0 4px rgba(138,106,170,0.16), 0 4px 14px rgba(138,106,170,0.28)' : '0 2px 8px rgba(138,106,170,0.22)',
    }}>{label}</span>;
  }
  return <span style={{
    ...base,
    background: 'rgba(255,255,255,0.55)',
    color: dim ? 'var(--dim)' : 'var(--text-2)',
    borderColor: 'var(--border)',
    opacity: dim ? 0.55 : 1,
  }}>{label}</span>;
}

// Cascading chip wall — mirrors the product's chip grid, with masks and parallax drift.
function ChipCascade({ selections }) {
  // selections: { [catLabel]: Set<itemName> }
  const ref = React.useRef(null);
  // Subtle vertical drift
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const start = performance.now();
    const loop = () => {
      setT((performance.now() - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      maskImage: 'linear-gradient(to bottom, transparent 0%, #000 12%, #000 78%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 12%, #000 78%, transparent 100%)',
    }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0,
        transform: `translateY(${-Math.sin(t * 0.15) * 8 - 20}px)`,
        padding: '24px 0',
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        {CHIP_CATEGORIES.map((cat, ci) => {
          const sel = selections[cat.label] || new Set();
          // Repeat items twice so the wall feels infinite at the edges
          const items = [...cat.items, ...cat.items.slice(0, 4)];
          return (
            <div key={cat.label} style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              transform: `translateX(${Math.sin(t * 0.12 + ci) * 6}px)`,
            }}>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
                color: 'var(--dim)', paddingLeft: 4,
              }}>{cat.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {items.map((it, idx) => (
                  <Chip key={cat.label + idx} label={it}
                    selected={sel.has(it)} glow={sel.has(it)}
                    dim={!sel.has(it) && idx > 6} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Floating prompt-preview card that "assembles" tokens.
function PromptPreviewCard({ accent }) {
  const tokens = [
    { txt: '/imagine', mono: true, dim: true },
    { txt: 'prompt:', mono: true, dim: true },
    { txt: 'monumental brutalist steampunk cityscape' },
    { txt: 'modern man on windswept hill' },
    { txt: 'epic wide shot', highlight: true },
    { txt: '35mm anamorphic', highlight: true },
    { txt: 'blue-hour industrial glow', highlight: true },
    { txt: 'foreboding scale', highlight: true },
    { txt: 'Villeneuve / Ridley Scott / Nolan' },
    { txt: '--ar 2.39:1', mono: true },
    { txt: '--s 250', mono: true },
    { txt: '--style raw', mono: true },
  ];
  return (
    <div style={{
      position: 'absolute', left: '-40px', bottom: '36px', zIndex: 2,
      width: 'min(460px, 86%)',
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(18px) saturate(140%)',
      WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      border: '1px solid var(--border-2)',
      borderRadius: 14,
      boxShadow: '0 24px 60px -20px rgba(74,52,108,0.25), 0 4px 12px rgba(74,52,108,0.08)',
      padding: '14px 16px 16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, fontFamily: 'var(--mono)', fontSize: 10,
        letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase',
      }}>
        <span>Prompt Preview · Midjourney</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          color: 'var(--accent-2)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-2)',
            animation: 'pp-pulse 1.6s ease-in-out infinite',
          }}/>
          Assembling
        </span>
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '6px 7px', alignItems: 'center',
        fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-2)',
      }}>
        {tokens.map((tk, i) => (
          <span key={i} style={{
            fontFamily: tk.mono ? 'var(--mono)' : 'var(--sans)',
            color: tk.dim ? 'var(--muted)' : tk.highlight ? accent : 'var(--text-2)',
            fontWeight: tk.highlight ? 500 : 400,
            background: tk.highlight ? 'var(--accent-soft)' : 'transparent',
            padding: tk.highlight ? '2px 8px' : 0,
            borderRadius: 6,
            animation: `pp-fade-in .6s ease both`,
            animationDelay: `${i * 0.12}s`,
          }}>
            {tk.txt}
          </span>
        ))}
      </div>
      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--mono)',
      }}>
        <span>187 tokens · 12 chips selected</span>
        <span style={{ color: accent, fontWeight: 500 }}>Copy ⌘C</span>
      </div>
    </div>
  );
}

function Hero({ accent, rotateRole }) {
  // Pre-selected chips that show up "lit" in the cascade
  const selections = React.useMemo(() => ({
    'SHOT SIZE': new Set(['WS (Wide Shot)', 'EWS (Extreme Wide Shot)']),
    'CAMERA ANGLE': new Set(['Low Angle']),
    'LENS': new Set(['35mm Standard', 'Anamorphic']),
    'LIGHTING': new Set(['Blue Hour', 'Practical']),
    'ASPECT RATIO': new Set(['2.39:1 (Anamorphic)', '21:9 (Ultra Widescreen)']),
    'MOOD': new Set(['Epic', 'Foreboding', 'Melancholic']),
    'STYLE': new Set(['Denis Villeneuve', 'Ridley Scott', 'Christopher Nolan']),
  }), []);
  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      paddingTop: 88, paddingBottom: 56,
      display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
      gap: 24, alignItems: 'center', overflow: 'hidden',
    }} className="hero-shell">
      <HeroNav accent={accent} />
      {/* Ambient light */}
      <div style={{
        position: 'absolute', top: '-220px', right: '-160px', width: 620, height: 620,
        background: 'radial-gradient(circle, rgba(138,106,170,0.16) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-180px', left: '-120px', width: 540, height: 540,
        background: 'radial-gradient(circle, rgba(90,138,154,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* Left — copy */}
      <div style={{ padding: '0 56px', position: 'relative', zIndex: 2 }} className="hero-left">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 4px 4px 6px',
          background: 'rgba(255,255,255,0.55)', border: '1px solid var(--border)',
          borderRadius: 999, fontSize: 11, color: 'var(--muted)',
          fontFamily: 'var(--mono)', letterSpacing: '0.04em',
          marginBottom: 28,
        }}>
          <span style={{ padding: '3px 9px', background: 'var(--accent-soft)', color: accent, borderRadius: 999, fontWeight: 500 }}>Film & TV</span>
          <span style={{ color: 'var(--dim)' }}>×</span>
          <span style={{ padding: '3px 9px', background: 'rgba(90,138,154,0.10)', color: 'var(--accent-2)', borderRadius: 999, fontWeight: 500 }}>AI Image</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 5.4vw, 68px)', fontWeight: 300, lineHeight: 1.05,
          letterSpacing: '-0.025em', marginBottom: 20,
        }}>
          <span style={{ display: 'block', color: 'var(--text)' }}>The prompt builder</span>
          <span style={{ display: 'block' }}>
            for <RoleSwap rotate={rotateRole} accent={accent} />
          </span>
        </h1>

        <p style={{
          fontSize: 17, lineHeight: 1.65, color: 'var(--muted)',
          maxWidth: 480, marginBottom: 36, fontWeight: 300,
        }}>
          100+ presets. Real film vocabulary. No prompt writing.
          Select shot sizes, lenses, and lighting setups — get prompts
          formatted for <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>Midjourney</strong>,{' '}
          <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>Flux</strong>,{' '}
          <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>Nano Banana</strong>, and{' '}
          <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>GPT Image</strong>.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <a href="prompt-builder.html" style={{
            padding: '14px 26px', borderRadius: 10, background: accent, color: '#fff',
            fontWeight: 500, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '0 6px 22px rgba(138,106,170,0.32)',
          }}>
            Open Prompt Builder
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, opacity: 0.8 }}>→</span>
          </a>
          <a href="#anatomy" style={{
            padding: '14px 22px', borderRadius: 10,
            background: 'rgba(255,255,255,0.55)', color: 'var(--text-2)',
            border: '1px solid var(--border-2)', fontWeight: 500, fontSize: 15,
            backdropFilter: 'blur(8px)',
          }}>
            See how it works
          </a>
        </div>

        <div style={{
          display: 'flex', gap: 22, fontFamily: 'var(--mono)', fontSize: 11,
          color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          <span><span style={{ color: accent, fontWeight: 500 }}>100+</span> Presets</span>
          <span><span style={{ color: accent, fontWeight: 500 }}>4</span> Models</span>
          <span><span style={{ color: accent, fontWeight: 500 }}>1</span> HTML file</span>
          <span><span style={{ color: accent, fontWeight: 500 }}>0</span> Sign-up</span>
        </div>
      </div>

      {/* Right — chip wall + prompt preview */}
      <div style={{
        position: 'relative', height: '88vh', minHeight: 640,
        marginRight: 24,
      }} className="hero-right">
        <ChipCascade selections={selections} />
        <PromptPreviewCard accent={accent} />
      </div>

      <style>{`
        @keyframes pp-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pp-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.1); }
        }
        @media (max-width: 980px) {
          .hero-shell { grid-template-columns: 1fr !important; gap: 0 !important; }
          .hero-left  { padding: 0 24px !important; }
          .hero-right { height: 70vh !important; min-height: 480px !important; margin: 24px 0 0 !important; }
        }
      `}</style>
    </section>
  );
}

Object.assign(window, { Hero });
