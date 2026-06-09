## ADDED Requirements

### Requirement: Track Record section displays three key metrics
The Track Record section SHALL display three metrics horizontally: total campaign value ($8M+), festival recognition (Sundance Grand Jury Nominee), and global reach (60+ Countries Released). Each metric SHALL show a large number value, a short label below, and an optional sublabel.

#### Scenario: Desktop layout
- **WHEN** the viewport is >= 768px wide
- **THEN** the three metrics render in a single horizontal row, evenly spaced

#### Scenario: Mobile layout
- **WHEN** the viewport is < 768px wide
- **THEN** the three metrics stack vertically, centered

### Requirement: Track Record section displays brand logo matrix
The section SHALL display a row of brand logos below the metrics, separated by a gold divider line. Logos SHALL be rendered as monochrome (grayscale) images. On hover, each logo SHALL transition to gold tint.

#### Scenario: Logo hover effect
- **WHEN** a user hovers over a brand logo
- **THEN** the logo transitions from monochrome to gold tint with a smooth CSS transition

#### Scenario: Placeholder logos before assets arrive
- **WHEN** logo image files are not yet provided
- **THEN** each logo renders as a styled text placeholder with the brand name

### Requirement: Track Record section displays company history
The section SHALL display two lines of company history below the logo matrix: "Final Frontier (Executive Producer)" and "First Light Films (Founder)", rendered in warm gray small text.

#### Scenario: Company history visibility
- **WHEN** the Track Record section is in view
- **THEN** both company history lines are visible below the logo matrix
