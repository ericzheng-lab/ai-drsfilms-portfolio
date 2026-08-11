# LOOP-STATE — Alibaba Startup Deck

Tier: L2
Reason: production deployment on ai.drsfilms.com.

## Loop 0 snapshot
- Repo: ericzheng-lab/ai-drsfilms-portfolio
- Base: main at ecc72e87816654c1658a3312b568efb1266f44b6
- Static deployment convention: public/<route>/index.html
- Existing live check: ai.drsfilms.com and /amazon-creator resolve from the portfolio deployment.
- Target: https://ai.drsfilms.com/alibaba-startup

## Guardrails
- No BP, top sheet, financing material, private credentials, private contacts, or non-public screenplay pages.
- Use approved real product evidence only.
- Do not alter existing portfolio routes.

## DoD
- [x] D1: public/alibaba-startup/index.html contains six public company-deck slides and five approved product evidence panels.
- [ ] D2: feature branch page is static-audited and independently reviewed.
- [ ] D3: merged main deployment resolves at /alibaba-startup and matches the intended title/content.

## Loop log
- Loop 0: verified public static folder routing and live /amazon-creator path.
