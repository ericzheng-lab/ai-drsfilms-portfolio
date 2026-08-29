import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  briefHistory,
  briefHistoryFestivalRecord,
  thisTimewornLand,
  press,
  commercials,
  showreel,
  tools,
  pipelineOrder,
  aiFilms,
  lab,
  contact,
  counts,
  vision,
} from '../../data/archive';
import './home-next.css';

/**
 * Draft of the next home page (middle layer of the three-layer plan).
 * Every fact and every number on this page comes from src/data/archive —
 * nothing is typed in here by hand. pending.ts items never render.
 */

const fmtDur = (s?: number) =>
  s == null ? '' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const wins = briefHistoryFestivalRecord.filter((f) => f.outcome === 'won');
const noms = briefHistoryFestivalRecord.filter((f) => f.outcome !== 'won');

const reviews = press.filter((p) => p.kind === 'review');
const finishedFilms = aiFilms.filter((f) => f.status === 'finished');
const labShipped = lab.filter(
  (l) => l.status === 'shipped' && l.evidence.verification !== 'pending'
);
const publiclyCredited = commercials.filter(
  (c) => c.evidence.verification === 'public'
);
const selectedCampaigns = commercials.filter(
  (c) => c.evidence.verification === 'self'
);
const pipeline = pipelineOrder
  .map((id) => tools.find((t) => t.id === id))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));
const otherTools = tools.filter(
  (t) => !(pipelineOrder as readonly string[]).includes(t.id)
);

function App() {
  return (
    <div className="wrap">
      <header className="top">
        <a className="wordmark" href="#">
          Eric Zheng
        </a>
        <nav>
          <a href="#film">Film</a>
          <a href="#software">Software</a>
          <a href="#ai-films">AI Films</a>
          <a href="#lab">Lab</a>
          <a href="#commercial">Commercial</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <div className="hero">
        <h1>Produces the film. Builds the studio around it.</h1>
        <p className="lede">
          Produced{' '}
          <a className="scan" href="#film">
            {briefHistory.title}
          </a>{' '}
          — {briefHistory.positioningLine}. Directs{' '}
          <a className="scan" href="#ai-films">
            AI-native films
          </a>
          , logged experiment by experiment. And everything he builds runs
          toward{' '}
          <a className="scan" href="#software">
            one powerhouse
          </a>
          : every creative head under one roof, each taking what they need.
        </p>
        <div className="statline">
          <span>
            <strong>{counts.festivalWins}</strong> festival awards — one film
          </span>
          <span>
            <strong>{counts.pressReviews}</strong> press reviews
          </span>
          <span>
            <strong>{counts.toolsLive}</strong> tools live
          </span>
          <span>
            <strong>{counts.aiFilmsFinished}</strong> AI films
          </span>
        </div>
      </div>

      <section id="film">
        <div className="sec-head">
          <span className="num">01</span>
          <h2>The feature</h2>
        </div>

        <div className="film-title">
          {briefHistory.title}
          <span className="zh">{briefHistory.titleZh}</span>
        </div>
        <p className="film-position">
          {briefHistory.role} · {briefHistory.positioningLine}
        </p>
        <p className="film-credits">
          Directed by {briefHistory.director} · Produced by{' '}
          {briefHistory.producers.join(', ')} ·{' '}
          {briefHistory.productionCompanies.join(' · ')} · World sales:{' '}
          {briefHistory.sales} · {briefHistory.runtimeMin} min ·{' '}
          {briefHistory.trailerUrl && (
            <a href={briefHistory.trailerUrl}>Trailer</a>
          )}
        </p>
        <div className="chips">
          {briefHistory.reception.map((r) => (
            <span className="chip" key={r.metric}>
              {r.metric} {r.value}
            </span>
          ))}
        </div>

        <div className="photo-strip">
          <div className="photo-slot">
            Sundance 2024 — 照片位
            <br />
            awaiting selection
          </div>
          <div className="photo-slot">
            Berlinale 2024 — 照片位
            <br />
            awaiting selection
          </div>
          <div className="photo-slot">
            Premiere — 照片位
            <br />
            awaiting selection
          </div>
        </div>

        <div className="press-list">
          {reviews.map((p) => (
            <div className="press-row" key={p.id}>
              <span className="outlet">{p.outlet}</span>
              <a href={p.url} target="_blank" rel="noreferrer">
                {p.title}
              </a>
            </div>
          ))}
        </div>

        <div className="fest-cols">
          <div>
            <h3>The film&rsquo;s festival record — awards</h3>
            <ul>
              {wins.map((f) => (
                <li key={f.festival + f.year}>
                  <b>{f.festival}</b> {f.year} — {f.result}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Competitions &amp; selections</h3>
            <ul>
              {noms.map((f) => (
                <li key={f.festival + f.year}>
                  <b>{f.festival}</b> {f.year} — {f.result}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="in-dev">
          In development: <b>{thisTimewornLand.title}</b>{' '}
          {thisTimewornLand.titleZh} · dir. {thisTimewornLand.director} ·{' '}
          {thisTimewornLand.status} · {thisTimewornLand.supportLabel} ·{' '}
          <a href={thisTimewornLand.officialSite}>official site</a>
        </div>
      </section>

      <section id="software">
        <div className="sec-head">
          <span className="num">02</span>
          <h2>Toward one powerhouse</h2>
          <span className="note">vision first, working stations below</span>
        </div>

        <div className="manifesto">
          <p className="manifesto-lead">{vision.statementEn}</p>
          <ul className="manifesto-principles">
            {vision.principles.map((p) => (
              <li key={p.en}>{p.en}</li>
            ))}
          </ul>
        </div>

        <h3 className="sub-label">
          The pipeline today — breakdown → budget → schedule
        </h3>
        <div className="pipeline">
          {pipeline.map((t) => (
            <div className="tool-card" key={t.id}>
              <span className="stage">{t.stage}</span>
              <h3>{t.name}</h3>
              <p>{t.blurb}</p>
              <span className="foot">
                <span className="badge">Live</span>
                {t.url && <a href={t.url}>open</a>}
              </span>
            </div>
          ))}
        </div>
        <div className="also">
          <h3>Also built</h3>
          <div className="pipeline">
            {otherTools.map((t) => (
              <div className="tool-card" key={t.id}>
                <span className="stage">{t.stage}</span>
                <h3>{t.name}</h3>
                <p>{t.blurb}</p>
                <span className="foot">
                  {t.status === 'live' ? (
                    <span className="badge">Live</span>
                  ) : (
                    <span className="badge dev">In development</span>
                  )}
                  {t.url && <a href={t.url}>open</a>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai-films">
        <div className="sec-head">
          <span className="num">03</span>
          <h2>AI-native films</h2>
          <span className="note">finished work only</span>
        </div>
        <div className="row-list">
          {finishedFilms.map((f) => (
            <div className="row" key={f.id}>
              <span className="when">
                {f.year ?? ''} {fmtDur(f.durationSec)}
              </span>
              <span className="what">
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noreferrer">
                    {f.title}
                  </a>
                ) : (
                  <span className="plain">{f.title}</span>
                )}
              </span>
              <span className="meta">
                {f.role && `${f.role} · `}
                {f.note}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="lab">
        <div className="sec-head">
          <span className="num">04</span>
          <h2>Lab</h2>
          <span className="note">dated experiments, added as they ship</span>
        </div>
        <div className="row-list">
          {labShipped.map((l) => (
            <div className="row" key={l.id}>
              <span className="when">{l.date}</span>
              <span className="what">
                <span className="plain">{l.title}</span>
              </span>
              <span className="meta">{l.what}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="commercial">
        <div className="sec-head">
          <span className="num">05</span>
          <h2>Commercial</h2>
          <span className="note">
            <a href={showreel.url}>showreel — {fmtDur(showreel.durationSec)}</a>
          </span>
        </div>
        <p className="credit-lead">
          Campaign work as producer and executive producer, incl. Final
          Frontier (Shanghai HQ executive producer,{' '}
          <a href="https://lbbonline.com/news/eric-zheng-joins-final-frontier-as-executive-producer">
            announced 2024
          </a>
          ).
        </p>
        <h3 style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
          Publicly credited
        </h3>
        <div className="brand-grid">
          {publiclyCredited.map((c) => (
            <div className="brand-cell verified" key={c.id}>
              <span className="b">{c.brand}</span>
              <span className="r">
                {c.title} · {c.role}
              </span>
              <br />
              <a
                className="verified-tag"
                href={c.publicCreditUrl ?? c.proofUrl}
                target="_blank"
                rel="noreferrer"
              >
                public credit ↗
              </a>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 26 }}>
          Selected campaigns
        </h3>
        <div className="brand-grid">
          {selectedCampaigns.map((c) => (
            <div className="brand-cell" key={c.id}>
              <span className="b">{c.brand}</span>
              <span className="r">
                {c.title} · {c.role}
              </span>
              {c.proofUrl && (
                <>
                  <br />
                  <a href={c.proofUrl} target="_blank" rel="noreferrer">
                    watch ↗
                  </a>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="contact">
        <div className="sec-head">
          <span className="num">06</span>
          <h2>Contact</h2>
        </div>
        <p className="contact-line">
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </p>
        <p className="contact-sub">
          <a href={contact.x}>X / @{contact.x.split('/').pop()}</a> ·{' '}
          {contact.site}
        </p>
      </section>

      <footer>
        <span>© Eric Zheng</span>
        <span>
          Draft preview — every fact on this page is drawn from the sourced
          archive; open items ship only after review.
        </span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
