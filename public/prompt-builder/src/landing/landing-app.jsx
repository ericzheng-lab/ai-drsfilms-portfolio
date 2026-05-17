// Main app — orchestrates sections + wires Tweaks.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#8a6aaa",
  "rotateRole": true,
  "showAuthor": true,
  "showAnatomy": true,
  "background": "lavender"
}/*EDITMODE-END*/;

const BACKGROUNDS = {
  lavender: 'linear-gradient(160deg,#f0e6f6 0%,#e6eef6 40%,#e6f6f0 100%)',
  warm:     'linear-gradient(160deg,#f5ede0 0%,#f0e6f0 50%,#e8e0ed 100%)',
  cool:     'linear-gradient(160deg,#e6eef6 0%,#e6f2f5 50%,#edeaf5 100%)',
  mist:     'linear-gradient(160deg,#f4f1f7 0%,#eef0f5 50%,#ecf2f0 100%)',
};

const ACCENTS = ['#8a6aaa', '#6a5a9a', '#9a6a8a', '#5a8a9a', '#b89a5a'];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Sync background to CSS var
  React.useEffect(() => {
    document.body.style.backgroundImage = BACKGROUNDS[t.background] || BACKGROUNDS.lavender;
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--accent-soft',
      hexToRgba(t.accent, 0.10));
  }, [t.accent, t.background]);

  return (
    <div>
      <Hero accent={t.accent} rotateRole={t.rotateRole} />
      <ShowcaseSection accent={t.accent} />
      <CategoriesSection accent={t.accent} />
      <AudienceProofSection accent={t.accent} />
      {t.showAnatomy && <AnatomySection accent={t.accent} />}
      <ModelsSection accent={t.accent} />
      {t.showAuthor && <AuthorStrip accent={t.accent} />}
      <CtaSection accent={t.accent} />
      <Footer />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSelect label="Background" value={t.background}
          options={['lavender', 'warm', 'cool', 'mist']}
          onChange={(v) => setTweak('background', v)} />

        <TweakSection label="Hero" />
        <TweakToggle label="Rotate role word" value={t.rotateRole}
          onChange={(v) => setTweak('rotateRole', v)} />

        <TweakSection label="Sections" />
        <TweakToggle label="Show Anatomy" value={t.showAnatomy}
          onChange={(v) => setTweak('showAnatomy', v)} />
        <TweakToggle label="Show Author strip" value={t.showAuthor}
          onChange={(v) => setTweak('showAuthor', v)} />
      </TweaksPanel>
    </div>
  );
}

function hexToRgba(hex, a) {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0,2), 16);
  const g = parseInt(m.slice(2,4), 16);
  const b = parseInt(m.slice(4,6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
