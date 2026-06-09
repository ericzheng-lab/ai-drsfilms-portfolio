## ADDED Requirements

### Requirement: Tool Stack section displays five tool categories
The Tool Stack section SHALL display 5 tool categories vertically: AI Orchestration, Video, Image, Audio, and Build Stack. Each category SHALL have a title (Space Mono uppercase, warm gray) and a row of tool logos below.

#### Scenario: Category layout
- **WHEN** the Tool Stack section renders
- **THEN** each category displays its title and tool logo row, with consistent vertical spacing between categories

### Requirement: Tool logos render as monochrome with hover effect
Each tool logo SHALL render in monochrome (grayscale or white-on-dark). On hover, the logo SHALL transition to gold tint and display the tool name as a tooltip or adjacent label.

#### Scenario: Logo hover
- **WHEN** a user hovers over a tool logo
- **THEN** the logo transitions to gold and the tool name becomes visible

#### Scenario: Logo placeholder before assets
- **WHEN** no logo image file is provided for a tool
- **THEN** a styled text placeholder renders with the tool name

### Requirement: Tool Stack section has no description text
The Tool Stack section SHALL NOT include any paragraph descriptions. Only category titles and logo rows are displayed. The section header provides the context ("What I use, daily.").

#### Scenario: Section content
- **WHEN** the Tool Stack section renders
- **THEN** only the section header, category titles, and tool logos are visible — no descriptive paragraphs
