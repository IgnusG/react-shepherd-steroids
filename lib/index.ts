import {
  ShepherdTour as _ShepherdTour,
  ShepherdTourContext as _ShepherdTourContext,
  Step as _Step,
  Tour as _Tour,
} from "react-shepherd";
import ShepherdStepInstance from "shepherd.js/src/types/step";

import {
  ReactChild,
  Context,
  FunctionComponent,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

import { createElement } from "react";
import { render } from "react-dom";

import "./style.css";
import { delay } from "./delay";

export interface ButtonWithType extends _Step.StepOptionsButton {
  type?: string;
}

// Fill in missing properties
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

export interface Step
  extends Omit<_Step.StepOptions, "when" | "text" | "title"> {
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

export type Steps = Step[] | readonly Step[];

export interface TourOptions
  extends Omit<_Tour.TourOptions, "defaultStepOptions"> {
  defaultStepOptions?: Partial<Step>;
}

interface Tour extends _Tour {
  options: TourOptions;
  restart(): void;
}

interface AdjustedShepherdStepOptions extends _Step.StepOptions {
  marker?: string;
  buttons?: ReadonlyArray<_Step.StepOptionsButton | ButtonWithType>;
}
interface AdjustedShepherdProps {
  steps: AdjustedShepherdStepOptions[] | readonly AdjustedShepherdStepOptions[];
  tourOptions: _Tour.TourOptions;
  children: ReactChild;
}

const ShepherdTourComponent =
  _ShepherdTour as FunctionComponent<AdjustedShepherdProps>;

const ShepherdTourContext = _ShepherdTourContext as Context<null | _Tour>;

interface TourProps {
  steps: Step[] | readonly Step[];
  tourOptions: TourOptions;
  children: ReactChild;
}

const disableTransitionAttribute = "data-x-shepherd-disable-transitions";

function createIsElementPresent(
  element: string,
  callbacks: { hide: () => void; show: () => void },
  options: { hideOnUnmount?: boolean } = {}
): [() => void, () => void] {
  let elementRemovedBefore = false;
  let stop = false;

  let lastFrame: number;

  function checkElementPresence(): void {
    lastFrame = requestAnimationFrame(() => {
      const elementExists = document.querySelector(element);

      if (elementRemovedBefore && elementExists) {
        elementRemovedBefore = false;

        document.body.setAttribute(disableTransitionAttribute, "true");
        callbacks.show();

        requestAnimationFrame(() =>
          document.body.removeAttribute(disableTransitionAttribute)
        );
      }

      if (!elementRemovedBefore && !elementExists) {
        elementRemovedBefore = true;

        if (options.hideOnUnmount) {
          callbacks.hide();
        }
      }

      if (!stop) checkElementPresence();
    });
  }

  return [
    checkElementPresence,
    (): void => {
      stop = false;
      cancelAnimationFrame(lastFrame);
    },
  ];
}

function renderJSX(
  component: JSX.Element,
  location: string,
  parent: HTMLElement
): void {
  const root = parent.querySelector(location);

  if (root) render(component, root);
}

const markerAttribute = "data-x-shepherd-marker";

function createTourStep(
  step: Step,
  tourOptions: TourOptions
): _Step.StepOptions {
  let targetTracker: undefined | (() => void);
  
  let handleGoToTarget: Element; 
  let handleGoTo: () => void;

  return {
    ...step,
    text: typeof step.text !== "string" ? "" : step.text,
    title: typeof step.title !== "string" ? "" : step.title,
    when: {
      show(this: _Step): void {
        const target = step.attachTo?.element;
        const marker = step.marker;
        const hideOnUnmount =
          step.hideOnUnmount ?? tourOptions?.defaultStepOptions?.hideOnUnmount;

        const tour = this.getTour();
        const id = this.id;
        const container = (this as StepInstance).el;

        if (marker) document.body.setAttribute(markerAttribute, marker);
        else document.body.removeAttribute(markerAttribute);

        targetTracker?.();

        if (typeof step.text !== "string") {
          renderJSX(step.text, ".shepherd-text", container);
        }

        if (step.title && typeof step.title !== "string") {
          renderJSX(step.title, ".shepherd-title", container);
        }

        if (typeof target === "string") {
          const [trackTarget, stopTrackingTarget] = createIsElementPresent(
            target,
            {
              show: () => {
                tour.show(id);
              },
              hide: () => {
                this.hide();
              },
            },
            { hideOnUnmount }
          );

          trackTarget();
          targetTracker = stopTrackingTarget;
        }

        if (step.advanceOn) {
          const targetSelector = step.advanceOn.selector ?? step.attachTo?.element;
          
          handleGoToTarget = (typeof targetSelector === "string" ? document.querySelector(targetSelector) : targetSelector) ?? document.body;
      
          handleGoTo = () => {
            if (step.advanceOn?.goTo)
              return tour.show(step.advanceOn?.goTo);

            // Shepherd does not support empty selectors - we default to the target element or body if target is not defined
            if (!step.advanceOn?.selector)
              return tour.next();
          };

          handleGoToTarget.addEventListener(step.advanceOn.event, handleGoTo);
        }

        step?.when?.show?.call(this);
      },
      hide(this: _Step): void {
        targetTracker?.();

        if (step.advanceOn)
          handleGoToTarget?.removeEventListener(step.advanceOn.event, handleGoTo);

        step?.when?.hide?.call(this);
      }
    },
    async beforeShowPromise(this: Step): Promise<void> {
      const element = step.attachTo?.element;
      const wait =
        step.waitForElement ?? tourOptions?.defaultStepOptions?.waitForElement;

      if (typeof element === "string" && wait)
        while (!document.querySelector(element)) await delay(0.5);

      return step?.beforeShowPromise?.call(this);
    },
  };
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
export function ShepherdTour({
  steps,
  tourOptions,
  children,
}: TourProps): JSX.Element {
  const adjustedSteps: AdjustedShepherdStepOptions[] = useMemo(() => steps.map((step) =>
    createTourStep(step, tourOptions)
  ), [steps, tourOptions]);

  return createElement(ShepherdTourComponent, {
    steps: adjustedSteps,
    tourOptions: tourOptions as _Tour.TourOptions,
    children,
  });
}

/** Use `useShepherdTour()` instad of `useContext(ShepherdTourContext)` otherwise some of the included features might not work properly */
export function useShepherdTour(): Tour {
  const tour = useContext(ShepherdTourContext) as Tour;

  if (tour === null) {
    throw new Error(
      "Shepherd has been requested outside of it's access - remember to wrap your app in <ShepherdTour>"
    );
  }

  useEffect(() => {
    let restartWarningGiven = false;

    const originalCancel = tour.cancel;
    const originalAddStep = tour.addStep;
    const originalStart = tour.start;

    tour.addStep = ((options: Step, index?: number | undefined): _Step => {
      const tourOptions = (tour as Tour).options;

      const step = createTourStep(options, tourOptions);

      return originalAddStep.call(tour, step, index);
    }) as typeof originalAddStep;

    tour.start = () => {
      if (tour.isActive()) {
        if (!restartWarningGiven) {
          restartWarningGiven = true;
          console.warn("A tour is already active - if you want to restart it use tour.restart");
        }

        return;
      }

      return originalStart.call(tour);
    }

    tour.restart = () => {
      if (tour.isActive()) {
        originalCancel.call(tour);
        originalStart.call(tour);
      } else {
        originalStart.call(tour);
      }
    }

    // Remove our left-over marker attributes in case of sudden closure of tour
    tour.on("complete", () => {
      document.body.removeAttribute(markerAttribute);
    });

    tour.on("cancel", () => {
      document.body.removeAttribute(markerAttribute);
    });
  }, [tour]);

  return tour;
}

/** Returns back a tuple `[currentMarker, isTourActive]`. Re-renders with updated values if required */
export function useShepherdTourMarker(): [string | undefined, boolean] {
  const tour = useShepherdTour();

  const [tourActive, setTourActive] = useState(false);
  const [marker, setMarker] = useState<undefined | string>(undefined);

  useEffect(() => {
    function handleStart(): void {
      setTourActive(true);
    }

    function handleShow(event: { step: _Step }): void {
      setMarker((event.step.options as Step).marker);
    }

    function handleComplete(): void {
      setMarker(undefined);
      setTourActive(false);
    }

    tour.on("show", handleShow);
    tour.on("complete", handleComplete);
    tour.on("start", handleStart);

    return (): void => {
      tour.off("show", handleShow);
      tour.off("complete", handleComplete);
      tour.off("start", handleStart);
    };
  });

  return [marker, tourActive];
}
