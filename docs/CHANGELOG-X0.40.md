# X0.40 · Industrial Platform Design System

A visual/product-design release built on X0.38.

## Hero
- Removed every AI card from the hero.
- Device/online-analysis system is now the only right-side focal object.
- Retained restrained spectral grid/orbit language.
- Real Product CMS image remains data-driven.

## AI
- Truly fixed bottom-right AI utility.
- Compact launcher, modal only appears after click.
- Modal has backdrop blur, suggestions, reply area and mobile layout.
- AI no longer participates in page layout.

## Homepage architecture
Hero → industries → industrial platform/solutions → products → data-to-decision → engineering cases → news → technical CTA → footer.

## News
Homepage news is no longer a large empty card grid.
It is an editorial list with date, title, summary and arrow.

## Motion
- route entrance 420ms
- scroll reveal via IntersectionObserver
- product/card hover motion
- respects reduced-motion preference
- no animation framework dependency

## Design system
Introduced reusable visual tokens for ink, paper, orange accent, borders, radii and motion.
This release intentionally focuses on perceived product value rather than adding backend scope.
