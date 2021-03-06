import { Step as _Step, Tour as _Tour } from "react-shepherd";
import ShepherdStepInstance from "shepherd.js/src/types/step";
import { ReactChild } from "react";
export interface ButtonWithType extends _Step.StepOptionsButton {
    type?: string;
}
export interface StepInstance extends ShepherdStepInstance {
    el: HTMLElement;
}
export interface TourEventProps {
    step: StepInstance;
    previous: StepInstance;
    tour: Tour;
}
interface When {
    show?: (this: _Step) => void;
    hide?: (this: _Step) => void;
}
interface AdvanceOn extends _Step.StepOptionsAdvanceOn {
    goTo?: string;
    event: string;
}
export interface Step extends Omit<_Step.StepOptions, "when" | "text" | "title"> {
    marker?: string;
    buttons?: ReadonlyArray<_Step.StepOptionsButton | ButtonWithType>;
    when?: When;
    beforeShowPromise?: (this: Step) => Promise<void>;
    waitForElement?: boolean;
    hideOnUnmount?: boolean;
    text: string | JSX.Element;
    title?: string | JSX.Element;
    advanceOn?: AdvanceOn;
}
export declare type Steps = Step[] | readonly Step[];
export interface TourOptions extends Omit<_Tour.TourOptions, "defaultStepOptions"> {
    defaultStepOptions?: Partial<Step>;
}
interface Tour extends _Tour {
    options: TourOptions;
    restart(): void;
}
interface TourProps {
    steps: Step[] | readonly Step[];
    tourOptions: TourOptions;
    children: ReactChild;
}
/**
 * Following features were added:
 * - JSX in `title` and `text`
 * - Gracefull wait if element cannot be find via `waitForElement=true` step option
 * - Hide on **removal** of element (but wait for it to re-appear then show again) via `hideOnUnmount=true` step option
 * - Keep on **removal** of element but update after it re-appears via `hideOnUnmount=true` (default) step option
 * - Add "markers" to steps for custom css styling `[data-x-shepherd-marker="my-marker"] .parent`
 * - Support `goTo` for the declarative `advanceOn` option (remote flow control)
 *
 * Check out the original documentation under [https://shepherdjs.dev/docs](https://shepherdjs.dev/docs/tutorial-02-usage.html)
 */
export declare function ShepherdTour({ steps, tourOptions, children, }: TourProps): JSX.Element;
/** Use `useShepherdTour()` instad of `useContext(ShepherdTourContext)` otherwise some of the included features might not work properly */
export declare function useShepherdTour(): Tour;
/** Returns back a tuple `[currentMarker, isTourActive]`. Re-renders with updated values if required */
export declare function useShepherdTourMarker(): [string | undefined, boolean];
export {};
