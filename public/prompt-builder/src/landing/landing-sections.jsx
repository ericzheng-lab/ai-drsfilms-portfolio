// Body sections — Categories, Anatomy, Models, Author, CTA, Footer.

function SectionLabel({ kicker, title, sub, align = 'center', accent }) {
  return (
    <div style={{
      textAlign: align,
      maxWidth: align === 'center' ? 640 : 'none',
      margin: align === 'center' ? '0 auto 56px' : '0 0 48px',
    }}>
      {kicker && (
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
          color: accent, textTransform: 'uppercase', marginBottom: 14, fontWeight: 500,
        }}>{kicker}</div>
      )}
      <h2 style={{
        fontSize: 'clamp(28px, 3.6vw, 42px)', fontWeight: 300,
        letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14,
        color: 'var(--text)',
      }}>{title}</h2>
      {sub && (
        <p style={{
          fontSize: 16, color: 'var(--muted)', lineHeight: 1.6,
          maxWidth: 540, margin: align === 'center' ? '0 auto' : '0',
        }}>{sub}</p>
      )}
    </div>
  );
}

function ShowcaseSection({ accent }) {
  const items = [
    { src: 'release-package/web-shots/builder-direct-mode.png', caption: 'Live direct mode', sub: 'Fields, chips, subject, scene, and model params rebuild the prompt preview without LLM.' },
    { src: 'release-package/PICS/showcase-creative-range-what-can-you-build.png', caption: 'Creative range', sub: 'Product visuals, film posters, maps, storyboards, UI mockups, key art, and style frames.' },
    { src: 'release-package/PICS/preset-library-100-plus-catalog-infographic.png', caption: 'Preset library', sub: '100+ production-minded choices across shot size, camera angle, lens, lighting, mood, style, and aspect ratio.' },
  ];
  return (
    <section style={{ padding: '60px 32px 80px', maxWidth: 1280, margin: '0 auto' }}>
      <SectionLabel
        kicker="Product proof"
        title="A working interface, not a prompt list"
        sub="The core workflow is visible: choose visual language, assemble locally, then copy a model-ready prompt."
        accent={accent}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="showcase-grid">
        <div style={{ gridRow: '1 / 3', position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={items[0].src} alt={items[0].caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <ShowcaseCaption item={items[0]} accent={accent} />
        </div>
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={items[1].src} alt={items[1].caption} style={{ width: '100%', display: 'block' }} />
          <ShowcaseCaption item={items[1]} accent={accent} />
        </div>
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={items[2].src} alt={items[2].caption} style={{ width: '100%', display: 'block' }} />
          <ShowcaseCaption item={items[2]} accent={accent} />
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .showcase-grid { grid-template-columns: 1fr !important; }
          .showcase-grid > div:first-child { grid-row: auto !important; }
        }
      `}</style>
    </section>
  );
}

function ShowcaseCaption({ item, accent }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '24px 16px 14px',
      background: 'linear-gradient(transparent, rgba(20,14,36,0.82))',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
        color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', marginBottom: 3,
      }}>{item.caption}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{item.sub}</div>
    </div>
  );
}

function AudienceProofSection({ accent }) {
  return (
    <section style={{ padding: '48px 32px 88px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 26,
        alignItems: 'center',
      }} className="audience-proof-grid">
        <div>
          <SectionLabel
            kicker="Who it serves"
            title="Built for people who think visually"
            sub="Directors, designers, marketers, and explorers do not need the same blank text box. They need a way to express visual intent quickly and consistently."
            align="left"
            accent={accent}
          />
          <div style={{
            display: 'grid', gap: 10, marginTop: -20,
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--muted)',
          }}>
            {['Director: mood boards and storyboards', 'Designer: product visuals and key art', 'Marketer: campaign images and social content', 'Explorer: styles, moods, and references'].map((line) => (
              <div key={line} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '10px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.46)', border: '1px solid var(--border)',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent }} />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.45)',
          boxShadow: '0 18px 50px -26px rgba(74,52,108,0.38)',
        }}>
          <img
            src="release-package/PICS/audience-who-uses-prompt-builder.png"
            alt="Audience map for Prompt Builder: director, designer, marketer, explorer"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .audience-proof-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Categories — mirrors "What are you making?" screen
// ─────────────────────────────────────────────────────────────
function CategoriesSection({ accent }) {
  return (
    <section id="categories" style={{ padding: '120px 32px 80px', maxWidth: 1280, margin: '0 auto' }}>
      <SectionLabel
        kicker="What you can build"
        title="A preset for every stage of pre-production"
        sub="Mood boards, style frames, character turnarounds, panoramas, key art — every category is a different creative workflow."
        accent={accent}
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 36, alignItems: 'start',
      }} className="cats-grid">
        {PRODUCT_CATEGORIES.map((group) => (
          <div key={group.group} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em',
              color: 'var(--dim)', textTransform: 'uppercase', fontWeight: 500,
              paddingBottom: 12, borderBottom: '1px solid var(--border)',
            }}>{group.group}</div>
            {group.items.map((it) => (
              <CategoryCard key={it.name} item={it} accent={accent} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ item, accent }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.42)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${hover ? 'var(--border-2)' : 'var(--border)'}`,
        borderRadius: 12, padding: '14px 14px 14px 16px',
        transition: 'all .2s ease',
        transform: hover ? 'translateY(-2px)' : 'none',
        position: 'relative', cursor: 'pointer',
      }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10,
        marginBottom: 4,
      }}>
        <span style={{
          fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1, color: accent,
          opacity: 0.85, fontWeight: 300,
        }}>{item.glyph}</span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.06em',
          color: 'var(--dim)', textTransform: 'uppercase',
          padding: '2px 6px', borderRadius: 4,
          background: item.llm ? 'rgba(90,138,154,0.10)' : 'rgba(0,0,0,0.04)',
          color: item.llm ? 'var(--accent-2)' : 'var(--dim)',
        }}>{item.llm ? 'LLM' : `${item.presets} preset${item.presets === 1 ? '' : 's'}`}</span>
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--text-2)', marginBottom: 4 }}>
        {item.name}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>
        {item.desc}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Anatomy of a prompt
// ─────────────────────────────────────────────────────────────
function AnatomySection({ accent }) {
  return (
    <section id="anatomy" style={{
      padding: '80px 32px', maxWidth: 1180, margin: '0 auto',
    }}>
      <SectionLabel
        kicker="Anatomy"
        title={<>What a <em style={{ fontStyle: 'normal', color: accent, fontWeight: 500 }}>cinematic prompt</em> actually looks like</>}
        sub="Every selection in the builder maps to a token in the final prompt. Hover the chips to see what they do."
        accent={accent}
      />
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 32,
        alignItems: 'stretch',
      }} className="anatomy-grid">
        {/* Left — annotated image */}
        <AnatomyShot accent={accent} />
        {/* Right — assembled prompt */}
        <AnatomyPrompt accent={accent} />
      </div>
    </section>
  );
}

function AnatomyShot({ accent }) {
  // Stylized "film still" placeholder — gradient + grain + framing marks
  return (
    <div style={{
      position: 'relative', borderRadius: 14, overflow: 'hidden',
      border: '1px solid var(--border-2)',
      aspectRatio: '2.39 / 1.4',
      background: `
        radial-gradient(ellipse at 35% 55%, rgba(184,154,90,0.32) 0%, transparent 45%),
        radial-gradient(ellipse at 70% 30%, rgba(138,106,170,0.22) 0%, transparent 50%),
        linear-gradient(160deg, #2a2438 0%, #3d3450 45%, #5a4a6a 100%)
      `,
      boxShadow: '0 20px 50px -20px rgba(74,52,108,0.4)',
    }}>
      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.18, mixBlendMode: 'overlay',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
      }}/>

      {/* Framing marks (anamorphic crop) */}
      <div style={{ position: 'absolute', top: '12%', left: '4%', width: 18, height: 18, borderTop: '1.5px solid rgba(255,255,255,0.6)', borderLeft: '1.5px solid rgba(255,255,255,0.6)' }}/>
      <div style={{ position: 'absolute', top: '12%', right: '4%', width: 18, height: 18, borderTop: '1.5px solid rgba(255,255,255,0.6)', borderRight: '1.5px solid rgba(255,255,255,0.6)' }}/>
      <div style={{ position: 'absolute', bottom: '12%', left: '4%', width: 18, height: 18, borderBottom: '1.5px solid rgba(255,255,255,0.6)', borderLeft: '1.5px solid rgba(255,255,255,0.6)' }}/>
      <div style={{ position: 'absolute', bottom: '12%', right: '4%', width: 18, height: 18, borderBottom: '1.5px solid rgba(255,255,255,0.6)', borderRight: '1.5px solid rgba(255,255,255,0.6)' }}/>

      {/* Subject silhouette suggestion */}
      <div style={{
        position: 'absolute', left: '32%', top: '36%', width: '24%', height: '50%',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, transparent 80%)',
        filter: 'blur(2px)',
      }}/>
      <div style={{
        position: 'absolute', left: '36%', top: '34%', width: '14%', height: '20%',
        background: 'radial-gradient(ellipse at 60% 50%, rgba(245,225,190,0.65) 0%, rgba(245,225,190,0.1) 60%, transparent 80%)',
        filter: 'blur(6px)',
      }}/>

      {/* Annotation badges */}
      <Annot top="14%" left="32%" label="WS" sub="Epic wide shot" accent={accent} />
      <Annot top="38%" left="64%" label="35mm" sub="Anamorphic" accent={accent} />
      <Annot top="62%" left="22%" label="Blue hour" sub="Amber industrial glow" accent={accent} />
      <Annot bottom="14%" right="6%" label="Scale" sub="Man small in frame" accent={accent} />

      {/* Bottom strip */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 14px', display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
      }}>
        <span>SCENE 14B · T2</span>
        <span>STYLE REF · VILLENEUVE / RIDLEY SCOTT / NOLAN</span>
      </div>
    </div>
  );
}

function Annot({ top, left, bottom, right, label, sub, accent }) {
  return (
    <div style={{
      position: 'absolute', top, left, bottom, right, transform: 'translate(-50%, -50%)',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{
        width: 9, height: 9, borderRadius: '50%',
        background: accent, boxShadow: `0 0 0 4px rgba(138,106,170,0.25)`,
      }}/>
      <div style={{
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
        borderRadius: 6, padding: '4px 8px', whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{label}</div>
        <div style={{ fontSize: 9.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{sub}</div>
      </div>
    </div>
  );
}

function AnatomyPrompt({ accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-2)', borderRadius: 14,
      padding: '24px 26px', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
        color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 16,
      }}>
        Token-by-token breakdown
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 22 }}>
        {ANATOMY_TOKENS.map((tk, i) => (
          <div key={tk.k} style={{
            display: 'grid', gridTemplateColumns: '88px 1fr', gap: 12,
            alignItems: 'baseline', paddingBottom: 8,
            borderBottom: i < ANATOMY_TOKENS.length - 1 ? '1px dashed rgba(106,90,138,0.14)' : 'none',
          }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em',
              color: accent, textTransform: 'uppercase', fontWeight: 500,
            }}>{tk.k}</span>
            <span style={{
              fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5,
              fontFamily: tk.k === 'Params' ? 'var(--mono)' : 'var(--sans)',
            }}>{tk.v}</span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 'auto',
        background: '#1f1a2a', borderRadius: 10, padding: '14px 16px',
        fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.7, color: '#d4c8e8',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 10, right: 12,
          fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
        }}>/imagine</div>
        <span style={{ color: '#9988aa' }}>/imagine prompt:</span>{' '}
        <span>monumental brutalist steampunk cityscape, modern man alone on a windswept hill, concrete megastructures, brass pipes, industrial haze,</span>{' '}
        <span style={{ color: '#e8c890' }}>epic wide shot</span>,{' '}
        <span style={{ color: '#e8c890' }}>35mm anamorphic</span>,{' '}
        <span style={{ color: '#e8c890' }}>low-angle dusk light</span>,{' '}
        <span style={{ color: '#c4a8e0' }}>awe-struck and foreboding</span>,{' '}
        <span style={{ color: '#a8c8d4' }}>Villeneuve grandeur, Ridley Scott industrial worldbuilding, Nolan scale</span>{' '}
        <span style={{ color: '#7a6a9a' }}>volumetric smoke, realistic film grain</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Models — each card uses its own syntax as decoration
// ─────────────────────────────────────────────────────────────
function ModelsSection({ accent }) {
  return (
    <section id="models" style={{
      padding: '80px 32px 60px', maxWidth: 1280, margin: '0 auto',
    }}>
      <SectionLabel
        kicker="Output formats"
        title="One tool. Four model dialects."
        sub="Each model gets its own syntax. You stay in your shot language."
        accent={accent}
      />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 18,
      }} className="models-grid">
        {MODELS.map((m) => <ModelCard key={m.name} model={m} accent={accent} />)}
      </div>
    </section>
  );
}

function tokenizeForLang(text, lang) {
  // Returns array of {t, c} where c is a class hint.
  if (lang === 'mj') {
    // Color flags / commands / values
    return text.split('\n').map((line, li) => (
      <div key={li}>
        {line.split(/(\s+|--?\w[\w:-]*|\/\w+)/g).filter(Boolean).map((tok, ti) => {
          let color = 'inherit';
          if (/^\/\w+/.test(tok)) color = '#a880c8';
          else if (/^--/.test(tok)) color = '#b89a5a';
          else if (/^\d+(\.\d+)?:?\d*$/.test(tok)) color = '#c89860';
          return <span key={ti} style={{ color }}>{tok}</span>;
        })}
      </div>
    ));
  }
  if (lang === 'json') {
    return text.split('\n').map((line, li) => {
      const parts = line.split(/("[^"]*"|\{|\}|\[|\]|:|,)/g).filter((s) => s !== '');
      return (
        <div key={li}>
          {parts.map((p, pi) => {
            let color = '#3d3450';
            if (/^".*"$/.test(p)) color = li === 0 ? '#3d3450' : '#7a8f6a';
            if (/^[{}\[\]:,]$/.test(p)) color = '#9988aa';
            // Keys
            const isKey = parts[pi + 1] === ':';
            if (isKey && /^".*"$/.test(p)) color = '#8a6aaa';
            return <span key={pi} style={{ color }}>{p}</span>;
          })}
        </div>
      );
    });
  }
  // prose / chat — just keep neutral
  return text.split('\n').map((line, li) => <div key={li}>{line}</div>);
}

function ModelCard({ model, accent }) {
  const [hover, setHover] = React.useState(false);
  const bgGlyph = {
    mj: '/imagine',
    prose: '⟨ prose ⟩',
    chat: '💬',
    json: '{ }',
  }[model.lang];
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.48)', backdropFilter: 'blur(14px)',
        border: `1px solid ${hover ? 'var(--border-2)' : 'var(--border)'}`,
        borderRadius: 14, padding: '22px 24px 0',
        overflow: 'hidden', transition: 'all .25s ease',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? '0 16px 40px -16px rgba(74,52,108,0.22)' : 'none',
      }}>
      {/* watermark */}
      <div aria-hidden style={{
        position: 'absolute', right: -16, top: -28,
        fontFamily: 'var(--mono)', fontSize: 96, fontWeight: 300,
        color: 'rgba(138,106,170,0.06)', letterSpacing: '-0.04em',
        pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      }}>{bgGlyph}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text)' }}>{model.name}</div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
            color: 'var(--muted)', textTransform: 'uppercase', marginTop: 2,
          }}>{model.tag}</div>
        </div>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
          padding: '4px 10px', borderRadius: 999,
          background: 'var(--accent-soft)', color: accent, fontWeight: 500,
        }}>READY</span>
      </div>

      <p style={{
        fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55,
        marginTop: 12, marginBottom: 18, position: 'relative',
      }}>{model.desc}</p>

      <div style={{
        background: 'rgba(31,26,42,0.04)', borderTop: '1px solid var(--border)',
        margin: '0 -24px', padding: '14px 24px 18px',
        fontFamily: 'var(--mono)', fontSize: 11.5, lineHeight: 1.65,
        color: 'var(--text-2)', overflow: 'hidden',
        whiteSpace: model.lang === 'json' ? 'pre' : 'pre-wrap',
        wordBreak: model.lang === 'json' ? 'normal' : 'break-word',
      }}>
        {tokenizeForLang(model.snippet, model.lang)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Author strip
// ─────────────────────────────────────────────────────────────
function AuthorStrip({ accent }) {
  return (
    <section style={{
      padding: '80px 32px', maxWidth: 980, margin: '0 auto',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(14px)',
        border: '1px solid var(--border)', borderRadius: 16,
        padding: '34px 40px', display: 'grid',
        gridTemplateColumns: '88px 1fr auto', gap: 28, alignItems: 'center',
      }} className="author-strip">
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2a2438 0%, #5a4a6a 50%, #8a6aaa 100%)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--serif)', fontSize: 32, color: '#f5ecd8', fontWeight: 300,
          border: '2px solid rgba(255,255,255,0.7)',
          boxShadow: '0 6px 20px rgba(74,52,108,0.25)',
        }}>EZ</div>
        <div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.18em',
            color: accent, textTransform: 'uppercase', fontWeight: 500, marginBottom: 8,
          }}>Built by someone who's lit a set</div>
          <h3 style={{
            fontSize: 22, fontWeight: 400, letterSpacing: '-0.015em',
            color: 'var(--text)', lineHeight: 1.35, marginBottom: 6,
          }}>
            Eric Zheng — <span style={{ color: 'var(--muted)' }}>Filmmaker & AI tool builder.</span>
          </h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55, maxWidth: 540 }}>
            Now building AI tools for creators. The presets collect real film vocabulary —
            shot sizes, lighting setups, lens choices — so you can skip the prompt-writing
            headache and focus on making things.
          </p>
        </div>
        <a href="prompt-builder.html" style={{
          padding: '10px 20px', borderRadius: 8,
          border: `1px solid ${accent}`, color: accent, fontSize: 13, fontWeight: 500,
          whiteSpace: 'nowrap',
        }}>Try the tool →</a>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .author-strip { grid-template-columns: 64px 1fr !important; gap: 18px !important; padding: 24px !important; }
          .author-strip > a { grid-column: 1 / -1 !important; justify-self: start !important; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Final CTA + Footer
// ─────────────────────────────────────────────────────────────
function CtaSection({ accent }) {
  return (
    <section style={{ padding: '60px 32px 100px', textAlign: 'center' }}>
      <div style={{
        maxWidth: 720, margin: '0 auto',
        background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(18px)',
        border: '1px solid var(--border)', borderRadius: 18,
        padding: '56px 40px 52px', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
          width: 560, height: 360,
          background: 'radial-gradient(ellipse, rgba(138,106,170,0.22), transparent 65%)',
          pointerEvents: 'none',
        }}/>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em',
          color: accent, textTransform: 'uppercase', marginBottom: 18, fontWeight: 500,
          position: 'relative',
        }}>/imagine →</div>
        <h2 style={{
          fontSize: 'clamp(28px, 3.6vw, 40px)', fontWeight: 300,
          letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16,
          position: 'relative',
        }}>
          Stop translating in your head.<br/>
          <span style={{ color: accent, fontWeight: 500 }}>Start prompting in shot language.</span>
        </h2>
        <p style={{
          fontSize: 16, color: 'var(--muted)', lineHeight: 1.6,
          maxWidth: 480, margin: '0 auto 32px', position: 'relative',
        }}>
          One HTML file. Works offline. No account. Add an API key only if you want LLM enhancement.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <a href="prompt-builder.html" style={{
            padding: '14px 30px', borderRadius: 10, background: accent, color: '#fff',
            fontWeight: 500, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '0 8px 28px rgba(138,106,170,0.34)',
          }}>
            Open Prompt Builder
            <span style={{ fontFamily: 'var(--mono)', opacity: 0.8 }}>→</span>
          </a>
          <span style={{
            padding: '14px 24px', borderRadius: 10,
            background: 'rgba(255,255,255,0.6)', color: 'var(--text-2)',
            border: '1px solid var(--border-2)', fontWeight: 500, fontSize: 15,
          }}>Source link later</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      padding: '32px 32px 48px', textAlign: 'center',
      fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em',
      color: 'var(--dim)', borderTop: '1px solid var(--border)',
      maxWidth: 1180, margin: '0 auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span>PROMPT BUILDER · v1.0</span>
        <span style={{ color: 'var(--muted)' }}>Static HTML · no account · no tracking</span>
        <span>© 2026 ERIC ZHENG</span>
      </div>
    </footer>
  );
}

Object.assign(window, {
  SectionLabel, CategoriesSection, AnatomySection, ModelsSection,
  AuthorStrip, CtaSection, Footer, ShowcaseSection, AudienceProofSection,
});
