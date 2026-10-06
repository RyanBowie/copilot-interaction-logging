# Changelog

Notable changes to this guide. The guide is documentation only: no solution package, flow export or source code is published.

## 2026-10-06

### Added

- **Custom connector recommendation.** The flows call Graph with HTTP actions because they're adapted from the CoE Starter Kit pattern. The guide now recommends reviewing them and considering a custom connector instead. It sets out the benefits and what to check first, including the change of sign-in, because custom connectors don't support the client credentials grant. See [Recommended: consider a custom connector](README.md#recommended-consider-a-custom-connector) and, on the site, [The HTTP calls](https://ryanbowie.github.io/copilot-interaction-logging/#custom-connector).
- **AI Video Creation Guide.** Added to More community projects on the site and in the README.
- **Copilot Autoharness.** Added to More community projects on the site and in the README.

### Changed

- **Custom Agent Reporting – Architecture links.** These now go to its site rather than its repository, and describe it as an architecture showcase with no Power BI solution provided.
- **Origins and credit.** Now explains that the very first build was created manually, and that later versions and changes were made with GitHub Copilot using the Power Automate plugin skills from [microsoft/power-platform-skills](https://github.com/microsoft/power-platform-skills). The solution is presented as a vibe-coded demonstration of pulling data from the audit log with Power Automate.

### Removed

- **Back-fill helper on the site.** The interactive date calculator is gone. The manual back-fill guidance stays: EndDate is exclusive, keep EndDate at least 48 hours in the past and StartDate within 180 days, and allow for British Summer Time.

### Fixed

- **Links to sections further down the page.** Links that jump to a section that hasn't faded in yet, such as the build steps, now land just below the header. Before, the section could end up partly hidden under the header once it finished sliding into place.

## 2026-10-03

First version of the build guide.

### Added

- **[README](README.md).** It covers:
  - what you build and the approvals to get before you build;
  - prerequisites and how the two flows work;
  - the HTTP calls each flow makes, with inputs and expected responses;
  - the secret-handling decision and environment variables;
  - how to build from scratch, and the data model;
  - operations, troubleshooting and limitations.
- **[Action reference](docs/ACTION_REFERENCE.md).** Every action in both flows: what it does, why it exists and what to change in a clean build. It also covers loop limits, failure paths, known issues and a clean-build checklist.
- **Documentation site (`docs/`, published with GitHub Pages).** The README as a single page. It adds:
  - an architecture diagram;
  - annotated screenshots of the reference build;
  - a build-step tracker;
  - a back-fill helper;
  - links to more community projects.
- **Secret-handling decision.** Three ways to store the Microsoft Graph credential:
  - Azure Key Vault (recommended);
  - a plain-text environment variable (not recommended);
  - a certificate.

  Nothing is pre-filled: you choose the option and set every value yourself.
- **Origins and credit.** The build adapts the audit log pattern from the [Microsoft Power Platform CoE Starter Kit](https://github.com/microsoft/coe-starter-kit).

### Changed (same day, after first publication)

- Removed the approval checklist. A short "Get approval before you build" note replaces it.
- Removed the Export hygiene section. Its guidance is now part of build step 10.
- Labelled the plain-text environment variable "Not recommended".
- Renamed "Build steps" to "Build from scratch".

### Reference build

The guide describes a reference build tested in a demo environment. In the action reference, observed behaviour is marked **Tested** and everything else is marked as from the design. See [Run-time behaviour](docs/ACTION_REFERENCE.md#run-time-behaviour), [Failure paths](docs/ACTION_REFERENCE.md#failure-paths) and [Known issues](docs/ACTION_REFERENCE.md#known-issues).
