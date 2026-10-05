# bok

A React component library for reading EPUB files. Built with React, TypeScript, and Vite.

The reader that is spawned will render a column view, with each column representing a page of the book. The user is able to change the font size, font family, line spacing, top padding, side margin and toggle the reader in fullscreen.

Butt.

## Installation

```bash
npm install bok
# or
yarn add bok
```

## Usage

```jsx
import React from "react";
import { BokReader } from "bok-reader";

function MyBookViewer() {
    const epubUrl = "https://www.path.com/to/your/book.epub"; // Can be a URL, File object, or ArrayBuffer

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
        }}>
            <BokReader epubDataSource={epubUrl} />
        </div>
    );
}

export default MyBookViewer;
```

## Props to BokReader

-   `epubDataSource`: `File | ArrayBuffer | string | null` - The source of the EPUB file (File object, ArrayBuffer, or URL string).
-   `onTitleChange?`: `(title: string) => void` - Callback when the book title is loaded.
-   `onLoadingChange?`: `(isLoading: boolean) => void` - Callback when the loading state changes.
-   `onError?`: `(errorMsg: string) => void` - Callback when an error occurs during loading or processing.
-   `onSyncEvent?`: `(event: BokReaderSyncEvent) => void` - Emits semantic local mutations for sync queues (`progress.set`, `highlight.add`, `highlight.remove`, `highlight.updateColor`, `highlight.updateNote`). `progress.set` is only emitted for real page turns, not when the stored position is restored, the book is re-laid out, or a `syncState` is applied.
-   `syncState?`: `BokReaderSyncState | null` - Host-provided remote/hydrated state for the current `bookId`.
-   `onConflictDetected?`: `(conflict: BokReaderSyncConflict) => void` - Called when incoming `syncState` conflicts with non-empty local data and `forceApply` is not set. Progress only conflicts when the two positions are more than a page apart.
-   `onSyncStateApplied?`: `(syncState: BokReaderSyncState) => void` - Called after an incoming `syncState` (or `applySyncState`) has been applied. Together with `onConflictDetected`, every `syncState` ends in exactly one of the two.
-   `onSyncReady?`: `(snapshot: BokReaderSyncSnapshot) => void` - Called once per book, after it is laid out and its locally stored progress/highlights are restored. Use it to pull remote state for `snapshot.bookId`.
-   `theme?`: `string` - Controlled theme name. When set, it overrides (and is persisted to) the locally stored theme; use it to apply a synced theme. Leave `undefined` to let the reader manage the theme itself.
-   `onThemeChange?`: `(theme: string) => void` - Called when the user picks a theme in the options menu. When `theme` is controlled, update it from here.
-   `supportedFonts?`: `{ displayName: string; name: string }[]` - Array of custom fonts to make available in the options menu.
-   `defaultFontFamily?`: `string` - Default reader font family used only when `bok_global_font_family` is not already set in localStorage (falls back to `"Courier New"`).
-   `color?`: `string` - Hexadecimal value. Color tint of the component.
-   `style?`: `React.CSSProperties` - Optional inline styles for the main wrapper component.

## Imperative Sync API (ref)

`BokReader` exposes a ref handle:

-   `getSyncSnapshot(): BokReaderSyncSnapshot | null`
-   `applySyncState(syncState: BokReaderSyncState, options?: { forceApply?: boolean }): boolean` (`true` means accepted: applied now or queued until reader is ready)
-   `getPendingSyncEvents(): BokReaderSyncEvent[]`
-   `acknowledgeSyncEvents(mutationIds: string | string[]): void`
-   `getTheme(): string` - Name of the theme currently shown (useful for seeding a remote copy).

## Development Scripts

-   `npm run dev`: Start development server.
-   `npm run build`: Build the library for production.
-   `npm run lint`: Lint the project files.
-   `npm run preview`: Preview the production build locally.

## Dependencies

-   jszip

## Peer Dependencies

-   react >=18.3.1
-   react-dom >=18.3.1
