# Steaming Display v2

### Features

- Stream SourceHandler
  - A JS file imported and stored in localStorage with all specification for handling a URL and extract the required metadata.

```typescript
type ResolverMetadata = {
  title: string;
  status: "success" | "error" | "unavailable";
  sourceUrl: string;
  allow?: {
    fullscreen?: boolean;
    pip?: boolean;
    refresh?: boolean;
    volume?: boolean;
  };
};
```

```typescript
function SourceHandler(sourceCode: string) {
  try {
    const source = eval(sourceCode);
    return source;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Fail to load SourceHandler", err.message);
    }
  }
}
```

```typescript
export default {
  id: 'resolver-example',
  version: '1.0.0',
  resolver: ({ url }) => {
    ...

    return {
      title: "",
      status: "success",
      sourceUrl: "https://...",
    }
  },
  allow: {
    fullscreen: true,
    pip: true,
    refresh: true,
    volume: true
  }
}

```
