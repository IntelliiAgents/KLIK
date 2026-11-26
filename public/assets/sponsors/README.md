# KLiK Quest Adventure Partner Assets

Drop the approved sponsor photographs and logos into this folder (`public/assets/sponsors/`):

1. **Pura Vida Kayaking Adventures**
   - Feature photograph (recommended `16:9`, ~1200×675 JPEG/WebP, <200 KB):
     `public/assets/sponsors/pura-vida-kayaking.jpg`
   - Logo (transparent PNG/WebP, ~400px wide):
     `public/assets/sponsors/pura-vida-logo.png`

2. **E-Motion E-Bike Adventures**
   - Feature photograph (recommended `16:9`, ~1200×675 JPEG/WebP, <200 KB):
     `public/assets/sponsors/emotion-ebike.jpg`
   - Logo (transparent PNG/WebP, ~400px wide):
     `public/assets/sponsors/emotion-logo.png`

Once placed in this directory, update `imageUrl` and `logoUrl` for each partner in `src/lib/config.ts` (`QUEST_SPONSORS`):

```ts
imageUrl: "/assets/sponsors/pura-vida-kayaking.jpg",
logoUrl: "/assets/sponsors/pura-vida-logo.png",
```

and

```ts
imageUrl: "/assets/sponsors/emotion-ebike.jpg",
logoUrl: "/assets/sponsors/emotion-logo.png",
```

No other components need to be modified — `SponsorShowcase` automatically renders responsive lazy-loaded images and logos across all placements.
