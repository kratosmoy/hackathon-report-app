# Component Guidelines

> How components are built in this project.

---

## Overview

This project uses **Angular standalone components**.
Components are class-based Angular components, not React-style functions.
Most current components are route-level screens, and they often depend directly on services plus router state.

New component work should align with the existing Angular style while avoiding the current oversized-component pattern.

---

## Component Structure

### Preferred structure

1. imports
2. local interfaces or view-model types
3. `@Component` metadata
4. exported component class
5. small helper methods grouped by responsibility

### Current examples

External template/styles:

```ts
@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.css']
})
export class ReportViewerComponent implements OnInit {}
```

Inline template/styles for smaller pages:

```ts
@Component({
  selector: 'app-report-run-flow',
  standalone: true,
  imports: [CommonModule],
  template: `...`,
  styles: [`...`]
})
export class ReportRunFlowComponent implements OnInit {}
```

### Guidance

- Use standalone components for new screens and shared widgets.
- Use external HTML/CSS when the template grows beyond a small screen or contains repeated sections.
- Keep data loading and event handlers readable; when a component becomes workflow-heavy, move reusable logic into services or helper functions.

---

## Props Conventions

Most current route components do not use `@Input()` heavily because they are loaded directly by the router.
When you add reusable child components:

- define `@Input()` and `@Output()` explicitly
- type them strictly
- avoid `any`
- prefer simple input models over passing the whole service or router into a child

### Good example

```ts
@Input({ required: true }) runId!: number;
@Output() approved = new EventEmitter<void>();
```

### Avoid

```ts
@Input() data: any;
```

If a type is only used by one component, keep it local in that file.
If it is shared with API calls, move it into the relevant service or a dedicated model file when the app grows.

---

## Styling Patterns

Current styling patterns are mixed:

- some components use external `.css` files
- some smaller components use inline `styles`

Use the simplest option that keeps the file readable:

- external CSS for larger route components
- inline styles only for very small, self-contained screens

Do not introduce a new styling system (Tailwind, CSS-in-JS, etc.) for isolated changes.

### Good example

```ts
styleUrls: ['./report-viewer.component.css']
```

---

## Accessibility

The current app is basic, but new components should preserve semantic HTML:

- use `<button>` for actions
- use `<label>` for form fields
- keep error messages visible in text, not color only
- keep route titles and action labels descriptive

### Example from current code

```html
<label>
  用户名：
  <input [(ngModel)]="username" name="username" required />
</label>
```

When adding approval or export actions, prefer explicit button text over icon-only controls.

---

## Common Mistakes

- Putting too much workflow logic into a single route component. `report-viewer.component.ts` currently manages login, report execution, maker flow, checker flow, history, and export.
- Hardcoding demo credentials in component state. Treat values like `username = 'admin'` as bootstrap/demo behavior, not a pattern to copy.
- Keeping large lookup maps and business presentation logic inside component classes when they could be extracted later.
- Subscribing everywhere without first checking whether logic belongs in a service or a smaller child component.
