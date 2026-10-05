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
