# Motion System

## Direction

Architectural precision with a little delight: measured movement, clear hierarchy, and real construction photography. Keep the existing brown, gold, cream, and white identity, Archivo/Inter typography, content, and one-page navigation.

## Principles

- Use GSAP 3 and ScrollTrigger for orchestrated or scroll-based motion; use CSS for simple focus, underline, and color changes.
- Favor opacity and transforms. Do not animate layout dimensions or pin long sections.
- Keep hero entrance to about 1.5 seconds, scroll reveals to 0.5-0.8 seconds, and interaction transitions to 0.3-0.7 seconds.
- Delay project-photo expansion by 1.5 seconds; use a clipped frame and a maximum scale of 1.12.
- Keep essential content visible if JavaScript, GSAP, or ScrollTrigger is unavailable.
- Respect `prefers-reduced-motion` on initial load and when the preference changes.
- Detect input with `any-hover` and `any-pointer` where a touch-first device may also have a mouse; do not infer input solely from viewport width.
- Touch gallery gestures only consume dominant horizontal swipes; vertical movement remains native scrolling.
- Do not use hover-only access, invented project imagery, or a before/after slider.

## Planned Interactions

- Hero: prioritized background image and a 1.5-second GSAP timeline for image zoom-out, masked headline rise, supporting copy, and CTA entrance. Implemented.
- Services and project cards: one-time ScrollTrigger reveals with restrained stagger. Implemented.
- Project photos: cancellable 1.5-second mouse-hover/keyboard-focus delay to 1.12 scale; touch activation opens the project viewer. Capability queries permit a mouse on a touch-first device. Implemented.
- Project viewer: native dialog with project details, photo selection, buttons, keyboard arrows, horizontal touch swipe, Escape close, focus restoration, URL/history integration, and Back/Forward support. Vertical swipes preserve page scrolling. Implemented.
- Project chapters: keyboard-operable Overview, Details, and Photos tabs populated only from existing client, site, contact, and image data. Implemented.
- About photography: low-intensity desktop-only parallax, disabled on touch and reduced-motion devices. Implemented.
- Primary actions: restrained pointer magnetism on fine-pointer devices; normal focus/touch behavior remains unchanged. Implemented.
- Navigation: native in-page anchors, full-screen editorial menu, active-section indicator, and scroll progress. The menu includes a real-photo preview that follows link hover/focus, supports focus restoration and Escape, and leaves the original nav usable if JavaScript is unavailable. This site has one HTML page, so no cross-page route transition is applicable.
- Project inquiry: five guided steps collect the project type, location, optional details, and contact details, then prepare a `mailto:` draft. There is no backend, so the interface explicitly does not claim delivery.

## Asset and Scope Notes

The project gallery contains real project photos and can support an expanded viewer. There is no matching blueprint or reliable six-stage construction photo sequence, so no blueprint transformation or image-based construction story should be shown. No before/after slider is planned. The contact section has direct phone and email actions but no form backend; do not present a nonfunctional form. Responsive image conversion or compression should be evaluated separately against the existing source quality and deployment needs.

## Verified Behavior

- Delayed photo expansion cancels on early pointer exit, reaches 1.12 after sustained hover, and returns to scale 1.
- Project viewer opens from keyboard-operable photo buttons, changes photos with arrow keys, supports browser Back/Forward, closes with Escape, and restores focus to its opener.
- Reduced-motion changes kill scroll triggers and in-progress motion while keeping page content and the viewer available.
- Mobile-menu focus, Escape/outside close, and scroll-lock behavior; horizontal gallery swipe advances photos while a vertical gesture does not.
- Editorial menu image preview follows focused/hovered destinations, project chapter tabs support arrow keys, and inquiry validation/review produces a prefilled email draft without claiming it was sent.
- The gallery currently uses real project photos only; the dialog reuses these images and existing project copy.

## Verification

Test normal and reduced-motion modes, direct hash navigation, mouse timer cancellation/expansion, keyboard focus/open/close, touch-sized viewport layout, browser Back/Forward, image loading, and console errors. Measure Core Web Vitals on representative deployed devices before making performance claims.
