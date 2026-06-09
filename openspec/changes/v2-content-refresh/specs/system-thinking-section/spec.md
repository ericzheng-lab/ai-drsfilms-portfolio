## ADDED Requirements

### Requirement: System Thinking section displays manifesto quote
The top of the section SHALL display a two-line manifesto: "Creative work is 90% logistics. AI changes who can deliver it." — rendered in large, italicized text above a gold divider line.

#### Scenario: Manifesto visibility
- **WHEN** the System Thinking section enters the viewport
- **THEN** the manifesto text is visible above the divider

### Requirement: System Thinking section displays OpenClaw architecture diagram
Below the manifesto, the section SHALL display the OpenClaw SVG architecture diagram (existing file: `OpenClaw-Agent-Control-v1.svg`). The diagram SHALL be centered and responsive (max-width constrained).

#### Scenario: SVG diagram rendering
- **WHEN** the section renders
- **THEN** the OpenClaw SVG architecture diagram is displayed centered in the section

#### Scenario: SVG diagram placeholder
- **WHEN** the SVG file is not yet in the public directory
- **THEN** a placeholder div renders with "OpenClaw Architecture Diagram" label

### Requirement: System Thinking section displays agent role annotations
Below or beside the diagram, the section SHALL list agent roles as short annotations (max 3 words each): General orchestrates, Engineer builds, Creator writes, Wiseman advises.

#### Scenario: Agent role list
- **WHEN** the diagram section renders
- **THEN** at least 4 agent role annotations are visible as concise labels

### Requirement: System Thinking section has depth link
The section SHALL display a hook sentence ("This is one system. The thinking scales beyond it.") and a "How I built this →" link at the bottom.

#### Scenario: Depth link
- **WHEN** the section renders
- **THEN** the hook sentence and a link are visible at the bottom
