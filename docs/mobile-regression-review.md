# Mobile regression review — 2026-09-17

Reviewed the current working tree, including the manually restored sliding menu and removal of global coarse-pointer minimum sizes. Those visual decisions are preserved. This review makes no changes to shared button/input typography, account settings, or the removed PWA controls.

## Findings and corrections

- **Page state loss on breakpoint changes:** putting page children inside two alternative layout components remounted them when changing viewport. The page container now remains mounted independently of the header. The existing unsaved-draft regression test passes again. This also avoids remount-driven data requests.
- **Tablet header compression:** at 820px the full desktop navigation squeezed the logo nearly out of view. The sliding navigation now covers widths below 1280px; desktop navigation begins at 1280px.
- **Hidden menu remained focusable:** `aria-hidden` alone did not stop focus entering offscreen links. The closed menu is now inert.
- **Dismissal failures:** Escape and selecting the current page did not close the menu. Both now close it; navigation clicks are captured before client-side routing prevents the default event.
- **Background interaction:** opening the menu locks body scrolling and contains keyboard Tab navigation. Escape returns focus to the toggle; closing/unmounting restores scrolling. Native dialogs retain their own keyboard handling.
- **Touch sizing:** menu toggle, mobile cart, and menu toolbar controls have scoped 44px minimum targets. No blanket sizing rule was restored. Shared compact controls retain their existing dimensions; this is not a certification that every control throughout the product is 44px.

## Validation

- Browser navigation checks at 320, 390, 768, 820, 1024, and 1280px.
- Escape, same-page dismissal, closed-menu focus exclusion, header geometry, and horizontal overflow checked.
- Public events, community, event map, Ukrainian venues, posts, and guides checked at 320 and 390px: no main-content horizontal overflow or page JavaScript errors observed.
- Sign-in dialog opens from the menu, closes with Escape, and leaves the menu closed at both phone widths.
- Existing 1,098 unit tests passed. Two new menu regression tests passed after correcting their isolated router mock; the existing layout draft-preservation test also passed.
- TypeScript, MainLayout ESLint, and whitespace checks passed.

Browser checks used local development mode with desktop Chrome touch/viewport emulation. Authenticated account/admin workflows, physical iOS Safari, and installed-PWA safe areas were not validated in this pass. No deployment or database changes were made.
