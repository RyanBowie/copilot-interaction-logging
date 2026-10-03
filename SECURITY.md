# Security

## Reporting a vulnerability

Please **don't** open a public issue for a security problem. Report it privately through GitHub's [private vulnerability reporting](https://docs.github.com/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability): open the repository's **Security** tab and select **Report a vulnerability**.

This is a personal community project, maintained on a best-effort basis. There is no SLA for responses or fixes.

Never include secrets, tenant IDs, user names, audit records or other personal data in a report or an issue.

## Scope

This repository publishes documentation only. There's no solution package, flow export or code to patch. Report problems with the guide itself, for example:

- advice that would leave a build insecure;
- a screenshot or example that exposes something it shouldn't.

You own, secure and maintain whatever you build from the guide.

## Security model in brief

Read [Read this first](README.md#read-this-first-high-privilege-tenant-wide-access) in the README before you build. In short:

- **High-privilege identity.** The flows sign in as an app registration with the Microsoft Graph **application** permission `AuditLogsQuery.Read.All`. It reads the audit log for every workload in the tenant, and it can't be scoped down. Protect the credential like a privileged admin credential.
- **Secret storage is your decision.** Azure Key Vault (option A) is recommended. A plain-text environment variable (option B, not recommended) is readable by environment admins and customisers. Its current value is **exported in clear text** if it's in the solution. See [the secret-handling decision](README.md#secret-handling-decision-how-the-client-secret-is-stored).
- **Personal data.** The collected rows hold UPNs, client IP addresses, regions and accessed-resource names. Limit who can read the tables and the flow run history.
- **Run history.** In the reference build, the HTTP actions' outputs and the per-record actions aren't secured. Raw audit records are therefore visible in run history for 28 days. Secure them in your build: see **Run-history exposure** under [Limitations](README.md#limitations).

## Credential hygiene

- Set an expiry on the client secret, name an owner and plan rotation.
- Monitor the app's sign-ins, and consider Conditional Access for workload identities.
- Before you share or commit an export of your build, remove every environment-variable *current value* from the solution, then unzip the export and check that no secret, tenant ID, client ID or email address remains.
- If a secret is exposed, delete it from the app registration straight away, create a new one, and review the app's sign-in logs.
