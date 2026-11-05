export const DEFAULT_PAGE_TURN_ANIMATION = "scroll";

export const PAGE_TURN_ANIMATION_OPTIONS = [
    { label: "Classic bounce", value: "scroll" },
    { label: "Paper fold", value: "paper" },
    { label: "3D cube", value: "three-d" },
    { label: "None", value: "none" }
] as const;

export type PageTurnAnimation = (typeof PAGE_TURN_ANIMATION_OPTIONS)[number]["value"];

export function isPageTurnAnimation(value: unknown): value is PageTurnAnimation {
    return PAGE_TURN_ANIMATION_OPTIONS.some((option) => option.value === value);
}

export const PAPER_FOLD_DURATION_MS = 720;

/**
 * Width of the curl transition zone, as a fraction of the sheet width.
 * Smaller values emulate stiffer paper (a tight fold), larger values a
 * softer, floppier sheet.
 */
export const PAPER_FOLD_CURL_DELTA = 0.55;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const smoothstep = (value: number): number => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
};

/**
 * Absolute rotation (degrees, 0..180) for every strip at a given progress,
 * ordered from the spine outward (index 0 sits at the spine).
 *
 * The fold front starts just past the grabbed edge and travels to just past
 * the spine, so at progress 0 every strip is flat and at progress 1 every
 * strip is folded a full 180 degrees.
 */
export function computePaperSliceAngles(
    progress: number,
    sliceCount: number,
    curlDelta: number = PAPER_FOLD_CURL_DELTA
): number[] {
    const clampedProgress = clamp01(progress);
    if (sliceCount <= 0) return [];

    const curl = Math.min(0.95, Math.max(0.1, curlDelta));
    const foldFront = 1 + curl / 2 - clampedProgress * (1 + curl);
    const angles: number[] = [];

    for (let index = 0; index < sliceCount; index += 1) {
        const stripCenter = (index + 0.5) / sliceCount;
        angles.push(180 * smoothstep((stripCenter - foldFront + curl / 2) / curl));
    }

    return angles;
}

export type PaperFoldShadow = {
    /** Distance from the spine to the near edge of the shadow band (px, along the sheet). */
    start: number;
    /** Distance from the spine to the far edge of the shadow band (px, along the sheet). */
    end: number;
    /** Distance from the spine to the fold line itself (px, along the sheet). */
    fold: number;
    /** Shadow intensity 0..1, peaks when the fold is steepest. */
    strength: number;
};

/**
 * Forward kinematics for the strip chain: walks the hinges and returns where
 * the shadow cast by the airborne part of the sheet falls on the page below.
 * Distances are measured from the spine along the (unfolded) sheet direction.
 * Returns null while the sheet is essentially flat.
 */
export function computePaperFoldShadow(angles: number[], sliceWidth: number): PaperFoldShadow | null {
    if (angles.length === 0 || sliceWidth <= 0) return null;

    let maxAngle = 0;
    let foldStart: number | null = null;
    let collapsedWidth = 0;

    for (let index = 0; index < angles.length; index += 1) {
        const angle = angles[index];
        if (angle > maxAngle) maxAngle = angle;
        if (foldStart === null && angle > 4) foldStart = collapsedWidth;
        collapsedWidth += sliceWidth * Math.cos((angle * Math.PI) / 180);
    }

    if (maxAngle < 4) return null;

    const fold = foldStart ?? collapsedWidth;
    const padding = sliceWidth * 1.6;
    const flatWidth = angles.length * sliceWidth;
    const foldRatio = Math.min(1, Math.max(0, fold / flatWidth));

    return {
        start: Math.min(fold, collapsedWidth) - padding,
        end: Math.max(fold, collapsedWidth) + padding,
        fold,
        strength: Math.sin(foldRatio * Math.PI)
    };
}
