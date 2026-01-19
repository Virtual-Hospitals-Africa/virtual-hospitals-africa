# Query Performance Monitoring with AWS RDS

This codebase automatically tags all database queries with their source route/function for performance monitoring.

## How It Works

All queries are tagged with PostgreSQL's `application_name` parameter in the format:
```
METHOD:PATH
```

Examples:
- `GET:/patients`
- `POST:/encounters/triage`
- `GET:/api/health_workers`

## Implementation

### Transactional Queries (POST requests)
In [postHandler.ts](../backend/postHandler.ts), we use `SET LOCAL application_name` which:
- Sets the name for the current transaction only
- Automatically resets after the transaction completes
- Shows up in AWS RDS Performance Insights

### Non-Transactional Queries (GET requests, WebSockets)
In [attachTrx.ts](../backend/attachTrx.ts), we use `SET application_name` which:
- Sets the name for the current connection
- Persists until changed or connection closes
- Also visible in AWS RDS Performance Insights

## Viewing Query Performance in AWS RDS

### Option 1: AWS RDS Performance Insights (Recommended)

1. Enable Performance Insights in your RDS instance settings
2. Navigate to RDS Console → Your Database → Performance Insights
3. Filter by "Application" dimension to see queries grouped by route
4. View metrics like:
   - Query execution time
   - Number of executions
   - CPU/IO consumption per route

### Option 2: Query pg_stat_activity

Connect to your database and run:
```sql
SELECT
  application_name,
  state,
  query,
  query_start,
  state_change
FROM pg_stat_activity
WHERE application_name LIKE '%:%'
ORDER BY query_start DESC;
```

### Option 3: Enable Query Logging

In RDS, modify parameter group:
- `log_statement = 'all'` or `log_statement = 'mod'`
- `log_min_duration_statement = 1000` (logs queries > 1s)

Then check CloudWatch Logs for queries tagged with your routes.

## Security Note

The application_name is SQL-escaped using single-quote doubling (`'` → `''`) to prevent injection.
See implementation in [attachTrx.ts:29](../backend/attachTrx.ts#L29) and [postHandler.ts:33](../backend/postHandler.ts#L33).

## Local Development Testing

### Understanding pg_stat_activity

`pg_stat_activity` shows **only currently active queries**. Once a query completes, it disappears from this view. This makes it difficult to test locally since most queries complete in milliseconds.

### Option 1: Use pg_stat_statements (Recommended)

Enable the `pg_stat_statements` extension to accumulate query statistics over time:

```bash
# Run the migration to enable the extension
deno task db:migrate

# Then view accumulated statistics by route
deno run --allow-env --allow-net --allow-read util/queryStats.ts
```

This will show:
- Total calls per route
- Total execution time
- Mean, max, and standard deviation of execution times
- Sample queries

**Reset statistics:**
```sql
SELECT pg_stat_statements_reset();
```

### Option 2: Monitor Active Queries in Real-Time

Use the active queries monitor to see queries as they execute:

```bash
deno run --allow-env --allow-net --allow-read util/activeQueries.ts
```

This refreshes every 2 seconds and shows:
- Which routes are currently executing queries
- Query state (active, idle, etc.)
- What the query is waiting on (if applicable)
- The actual SQL being executed

### Option 3: Direct SQL Query

To see your current connection's tag:
```sql
SELECT application_name, query FROM pg_stat_activity WHERE pid = pg_backend_pid();
```

To see all tagged connections:
```sql
SELECT
  application_name,
  state,
  query_start,
  wait_event,
  LEFT(query, 100) as query
FROM pg_stat_activity
WHERE application_name LIKE '%:%'
ORDER BY query_start DESC;
```

### Testing Tips

1. **For slow queries**: Add a `pg_sleep(2)` in your query to make it visible in `pg_stat_activity`
2. **For load testing**: Use `pg_stat_statements` to accumulate stats across many requests
3. **For debugging**: Use the real-time monitor (`activeQueries.ts`) to see what's happening live
