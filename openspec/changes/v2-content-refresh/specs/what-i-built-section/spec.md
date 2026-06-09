## ADDED Requirements

### Requirement: What I Built section displays three product cards vertically
The section SHALL display three product cards stacked vertically. Each card SHALL contain a full-width screenshot area, product name, one-line tagline, tech stack tags, and two action buttons (Live demo and GitHub).

#### Scenario: Product card structure
- **WHEN** the What I Built section renders
- **THEN** each product card shows: screenshot placeholder, product name (large text), tagline (medium text), tech tags (small pills), Live button, GitHub button

#### Scenario: Product card screenshot placeholder
- **WHEN** no screenshot image is provided for a product
- **THEN** a styled placeholder div renders with the product name and "Screenshot" label

### Requirement: What I Built section links to external resources
Each product card SHALL have up to two action buttons: "Live →" (links to live demo URL) and "GitHub →" (links to repository). Buttons SHALL open in a new tab with rel="noreferrer".

#### Scenario: Product with both links
- **WHEN** a product has both liveUrl and repoUrl defined
- **THEN** both Live and GitHub buttons render and link to the correct URLs

#### Scenario: Product with no links
- **WHEN** a product has neither liveUrl nor repoUrl
- **THEN** no action buttons render for that card

### Requirement: What I Built section shows "See all" link at bottom
The section SHALL display a "See all 7 products on GitHub →" link at the bottom, pointing to the GitHub profile.

#### Scenario: Footer link visibility
- **WHEN** all three product cards have rendered
- **THEN** a GitHub profile link appears below the last card
