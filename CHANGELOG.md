# Changelog

Notable changes to this guide. The guide is documentation only: no solution package, flow export or source code is published.

## 2026-10-03

First version of the build guide.

### Added

- **[README](README.md).** It covers:
  - what you build and who should approve it;
  - prerequisites and how the two flows work;
  - the secret-handling decision and environment variables;
  - the build steps and data model;
  - operations, troubleshooting and limitations.
- **[Action reference](docs/ACTION_REFERENCE.md).** Every action in both flows: what it does, why it exists and what to change in a clean build. It also covers loop limits, failure paths, known issues and a clean-build checklist.
- **Documentation site (`docs/`, published with GitHub Pages).** The README as a single page. It adds:
  - an architecture diagram;
  - annotated screenshots of the reference build;
  - an approval checklist;
  - a build-step tracker;
  - a back-fill helper.
- **Secret-handling decision.** Three ways to store the Microsoft Graph credential:
  - Azure Key Vault (recommended);
  - a plain-text environment variable (dev/test only);
  - a certificate.

  Nothing is pre-filled: you choose the option and set every value yourself.
- **Origins and credit.** The build adapts the audit log pattern from the [Microsoft Power Platform CoE Starter Kit](https://github.com/microsoft/coe-starter-kit).

### Reference build

The guide describes a reference build tested in a demo environment. In the action reference, observed behaviour is marked **Tested** and everything else is marked as from the design. See [Run-time behaviour](docs/ACTION_REFERENCE.md#run-time-behaviour), [Failure paths](docs/ACTION_REFERENCE.md#failure-paths) and [Known issues](docs/ACTION_REFERENCE.md#known-issues).
