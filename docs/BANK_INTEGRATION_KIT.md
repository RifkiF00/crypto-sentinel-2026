# Crypto-Sentinel Bank Integration Kit

## Runtime modes

Set dashboard environment variables before building:

- `VITE_SENTINEL_API_URL`: Sentinel scoring API base URL.
- `VITE_CORE_API_URL`: Core-banking adapter/API base URL.
- `VITE_APP_MODE`: `live`, `demo`, or `hybrid`.

`live` is fail-closed: API errors produce an empty/error state and never silently display fixtures. `demo` may use clearly labelled synthetic fixtures for judging and rehearsals. `hybrid` is intended only for controlled testing where live and demo sources are intentionally compared.

Copy [`dashboard-crypto-sentinel/.env.example`](../dashboard-crypto-sentinel/.env.example) to `.env.local`; do not commit credentials or customer data.

## Integration contract

The bank adapter should expose:

- `GET /` — health check;
- `GET /api/v1/bjb/transactions` — canonical transaction list;
- `POST /api/v1/sentinel/alerts/resolve/{transaction_id}` — persisted case action;
- `POST /api/v1/bri/simulate-smurfing` — sandbox-only test endpoint.

Transaction records should include a stable `transaction_id`, UTC `timestamp`, `amount`, sender/destination identifiers, `status`, `risk_score`, and `reasons`. Tenant identity must be supplied by the adapter and enforced server-side.

## Deployment sequence

1. Deploy Sentinel and the bank adapter inside the approved private network or sandbox.
2. Configure TLS, allowed origins, service authentication, tenant identifiers, and timeouts.
3. Map the bank's CBS/event schema to the canonical contract; do not send raw customer data to the demo dashboard.
4. Execute connectivity, decision, duplicate-event, timeout, fail-open/fail-closed, privacy masking, alert persistence, and audit-log UAT cases.
5. Record evidence, latency percentiles, model version, rule version, and rollback owner before pilot approval.

The current repository is a field-validated prototype and controlled-sandbox candidate. Production banking deployment still requires bank security review, IAM/RBAC enforcement, durable audit storage, secrets management, observability, disaster recovery, and formal UAT/sign-off.
