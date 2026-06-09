## ADDED Requirements

### Requirement: Films section displays Brief History of A Family feature
The top half of the Films section SHALL display the "Brief History of A Family" film entry with a left-aligned poster and right-aligned information block. The info block SHALL include: film title, Sundance Grand Jury Prize Nominee badge, Berlinale Panorama badge, budget ($2.5M), production scope (3-Country Co-Production, 60+ Countries), and director name (Lin Jianjie).

#### Scenario: Film info layout on desktop
- **WHEN** the viewport is >= 768px wide
- **THEN** the poster renders on the left and the film info renders on the right in a two-column layout

#### Scenario: Film info layout on mobile
- **WHEN** the viewport is < 768px wide
- **THEN** the poster renders above the film info in a single-column layout

#### Scenario: Poster placeholder
- **WHEN** no poster image is provided
- **THEN** a styled placeholder div renders with "MOVIE POSTER" label

### Requirement: Films section displays two AI video thumbnails
Below a gold divider line, the section SHALL display two AI video thumbnails side by side: "HOME MANGA" (Anime style) and "HOME live-action" (Cinematic realism). Each thumbnail SHALL have a play button overlay and a short style description below.

#### Scenario: Video thumbnails on desktop
- **WHEN** the viewport is >= 768px wide
- **THEN** both video thumbnails render in a two-column layout

#### Scenario: Video thumbnails on mobile
- **WHEN** the viewport is < 768px wide
- **THEN** both video thumbnails stack vertically

#### Scenario: Video thumbnail placeholder
- **WHEN** no video thumbnail image is provided
- **THEN** a styled placeholder div renders with the video title and play icon overlay
