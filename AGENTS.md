# Project architecture
- Treat cloud inventory as authoritative; never substitute purchasable default products when reads fail.
- Save admin menu changes through the atomic save_menu_inventory RPC with explicitly edited stock IDs; reconcile reservations before overriding stock to prevent stale returns.
- Centralize availability and checkout payment choices in domain helpers shared by the UI and tests.