# Security Notes

## Dependency audit exception: Next.js-bundled PostCSS

As of September 1, 2026, EERS uses Next.js 15.5.25. The application's direct `postcss` dependency is pinned to a patched 8.5.x release and `sharp` is pinned to 0.35.4.

`npm ls next postcss sharp` confirms that the remaining PostCSS finding comes from Next.js's own transitive dependency:

```text
next@15.5.25
└── postcss@8.4.31
```

This is an upstream dependency-resolution issue in the Next.js 15.x package. A current Next.js issue documents the same 15.5.x behavior and the need for the 15.x release branch to bump its bundled PostCSS dependency. The EERS application must not use `npm audit fix --force` to jump to Next.js 16 solely to eliminate this finding.

### Current validation

- `npm run typecheck` passes.
- `npm run build` passes.
- Direct `postcss` is patched.
- Direct `sharp` is patched.
- The remaining high-severity PostCSS audit finding is transitive through Next.js 15.5.25.

### Policy

Do not suppress or ignore new audit findings. Revisit this exception whenever a compatible Next.js 15.x patch ships with the bundled PostCSS dependency updated, or when EERS is intentionally upgraded to a newer supported Next.js major/minor release.

Before production deployment, run:

```bash
npm audit --omit=dev
npm run typecheck
npm run build
```

If the audit reports any finding that does not trace to `next@15.5.25 -> postcss@8.4.31`, stop deployment and investigate it separately.
