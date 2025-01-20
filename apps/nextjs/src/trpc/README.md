# tRPC Setup Documentation

This folder contains the tRPC client and server setup for the Next.js application. tRPC enables end-to-end typesafe APIs between the client and server.

## File Structure

### `react.tsx`
Client-side tRPC setup for React components.

- `TRPCReactProvider`: Main provider component that wraps your application
- `api`: tRPC client instance
- Key features:
  - Query client singleton management
  - Batch link configuration
  - Logger setup for development

Example usage:
```typescript
// In your root layout
import { TRPCReactProvider } from "~/trpc/react";

export default function RootLayout({ children }) {
  return (
    <TRPCReactProvider>
      {children}
    </TRPCReactProvider>
  );
}
```

### `server.ts`
Server-side tRPC setup for React Server Components (RSC).

- `createContext`: Creates tRPC context with auth session
- `api`: Server-side tRPC instance
- `HydrateClient`: Component for hydrating client-side state

Example usage:
```typescript
// In a React Server Component
import { api } from "~/trpc/server";

export default async function ServerComponent() {
  const data = await api.yourProcedure.query();
  return <div>{data}</div>;
}
```

### `query-client.ts`
Configures the TanStack Query client used by tRPC.

Key configurations:
- Default stale time: 30 seconds
- SuperJSON serialization for complex data types
- Custom dehydration/hydration settings

## Usage Examples

### Client-side Query
```typescript
import { api } from "~/trpc/react";

export function ClientComponent() {
  const { data } = api.yourProcedure.useQuery();
  return <div>{data}</div>;
}
```

### Server-side Query
```typescript
import { api } from "~/trpc/server";

export default async function ServerComponent() {
  const data = await api.yourProcedure.query();
  return <div>{data}</div>;
}
```

### Mutation Example
```typescript
import { api } from "~/trpc/react";

export function MutationComponent() {
  const mutation = api.yourProcedure.useMutation();
  
  return (
    <button onClick={() => mutation.mutate(data)}>
      Submit
    </button>
  );
}
```

## Key Features

1. **Type Safety**: Full end-to-end type safety between client and server
2. **React Query Integration**: Built-in caching and state management
3. **SuperJSON**: Handles complex data types (Dates, BigInt, etc.)
4. **RSC Support**: Works with both client and server components
5. **Automatic Request Batching**: Optimizes multiple concurrent requests

## Environment Configuration

The setup uses the following environment variables:
- `NODE_ENV`: For development logging
- `VERCEL_URL`: For Vercel deployments
- `PORT`: For local development (defaults to 3000)

## Best Practices

1. Use server components for initial data fetching when possible
2. Leverage React Query's caching capabilities
3. Implement proper error handling in your procedures
4. Use mutations for data modifications
5. Take advantage of procedure input validation

## Additional Resources

- [tRPC Documentation](https://trpc.io/)
- [React Query Documentation](https://tanstack.com/query/latest/)
- [Next.js RSC Documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)