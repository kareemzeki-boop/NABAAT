---
name: GitHub workspace auth
description: Distinguishes an account-level GitHub connection from usable workspace Git/API access.
---

A connected GitHub source-control indicator does not by itself prove that the current workspace can use GitHub CLI or API access. Verify the available authentication path before creating or changing a remote repository, and preserve the existing Replit remote unless the user explicitly asks to change it.

**Why:** In this workspace, the GitHub connection was presented as active, but integration discovery still reported it as not added, the CLI had no authenticated host, and the connector API was not available in the execution environment.

**How to apply:** Before pushing or creating a repository, confirm that the workspace Git pane or an authenticated CLI/API path is available. Do not request a GitHub token when the user has already connected an integration.
