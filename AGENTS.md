# Next.js 16 Breaking Changes

## Route Handler params
In Next.js 16, the `params` object in route handlers is a Promise. You must await it:

```typescript
// CORRECT
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// WRONG - will cause runtime error
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
}
```

This applies to all route handlers: GET, POST, PUT, PATCH, DELETE, etc.
