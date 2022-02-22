var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { ShepherdTour as ShepherdTour$1, ShepherdTourContext as ShepherdTourContext$1 } from "react-shepherd";
import { useMemo, createElement, useContext, useEffect, useState } from "react";
import { render } from "react-dom";
var style = "";
function delay(waitSeconds, timeoutHandler = () => void 0) {
  return new Promise((resolve) => {
    timeoutHandler(setTimeout(resolve, waitSeconds * 1e3));
  });
}
const ShepherdTourComponent = ShepherdTour$1;
const ShepherdTourContext = ShepherdTourContext$1;
const disableTransitionAttribute = "data-x-shepherd-disable-transitions";
function createIsElementPresent(element, callbacks, options = {}) {
  let elementRemovedBefore = false;
  let stop = false;
  let lastFrame;
  function checkElementPresence() {
    lastFrame = requestAnimationFrame(() => {
      const elementExists = document.querySelector(element);
      if (elementRemovedBefore && elementExists) {
        elementRemovedBefore = false;
        document.body.setAttribute(disableTransitionAttribute, "true");
        callbacks.show();
        requestAnimationFrame(() => document.body.removeAttribute(disableTransitionAttribute));
      }
      if (!elementRemovedBefore && !elementExists) {
        elementRemovedBefore = true;
        if (options.hideOnUnmount) {
          callbacks.hide();
        }
      }
      if (!stop)
        checkElementPresence();
    });
  }
  return [
    checkElementPresence,
    () => {
      stop = false;
      cancelAnimationFrame(lastFrame);
    }
  ];
}
function renderJSX(component, location, parent) {
  const root = parent.querySelector(location);
  if (root)
    render(component, root);
}
const markerAttribute = "data-x-shepherd-marker";
function createTourStep(step, tourOptions) {
  let targetTracker;
  let handleGoToTarget;
  let handleGoTo;
  return __spreadProps(__spreadValues({}, step), {
    text: typeof step.text !== "string" ? "" : step.text,
    title: typeof step.title !== "string" ? "" : step.title,
    when: {
      show() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const target = (_a = step.attachTo) == null ? void 0 : _a.element;
        const marker = step.marker;
        const hideOnUnmount = (_c = step.hideOnUnmount) != null ? _c : (_b = tourOptions == null ? void 0 : tourOptions.defaultStepOptions) == null ? void 0 : _b.hideOnUnmount;
        const tour = this.getTour();
        const id = this.id;
        const container = this.el;
        if (marker)
          document.body.setAttribute(markerAttribute, marker);
        else
          document.body.removeAttribute(markerAttribute);
        targetTracker == null ? void 0 : targetTracker();
        if (typeof step.text !== "string") {
          renderJSX(step.text, ".shepherd-text", container);
        }
        if (step.title && typeof step.title !== "string") {
          renderJSX(step.title, ".shepherd-title", container);
        }
        if (typeof target === "string") {
          const [trackTarget, stopTrackingTarget] = createIsElementPresent(target, {
            show: () => {
              tour.show(id);
            },
            hide: () => {
              this.hide();
            }
          }, { hideOnUnmount });
          trackTarget();
          targetTracker = stopTrackingTarget;
        }
        if (step.advanceOn) {
          const targetSelector = (_e = step.advanceOn.selector) != null ? _e : (_d = step.attachTo) == null ? void 0 : _d.element;
          handleGoToTarget = (_f = typeof targetSelector === "string" ? document.querySelector(targetSelector) : targetSelector) != null ? _f : document.body;
          handleGoTo = () => {
            var _a2, _b2, _c2;
            if ((_a2 = step.advanceOn) == null ? void 0 : _a2.goTo)
              return tour.show((_b2 = step.advanceOn) == null ? void 0 : _b2.goTo);
            if (!((_c2 = step.advanceOn) == null ? void 0 : _c2.selector))
              return tour.next();
          };
          handleGoToTarget.addEventListener(step.advanceOn.event, handleGoTo);
        }
        (_h = (_g = step == null ? void 0 : step.when) == null ? void 0 : _g.show) == null ? void 0 : _h.call(this);
      },
      hide() {
        var _a, _b;
        targetTracker == null ? void 0 : targetTracker();
        if (step.advanceOn)
          handleGoToTarget == null ? void 0 : handleGoToTarget.removeEventListener(step.advanceOn.event, handleGoTo);
        (_b = (_a = step == null ? void 0 : step.when) == null ? void 0 : _a.hide) == null ? void 0 : _b.call(this);
      }
    },
    async beforeShowPromise() {
      var _a, _b, _c, _d;
      const element = (_a = step.attachTo) == null ? void 0 : _a.element;
      const wait = (_c = step.waitForElement) != null ? _c : (_b = tourOptions == null ? void 0 : tourOptions.defaultStepOptions) == null ? void 0 : _b.waitForElement;
      if (typeof element === "string" && wait)
        while (!document.querySelector(element))
          await delay(0.5);
      return (_d = step == null ? void 0 : step.beforeShowPromise) == null ? void 0 : _d.call(this);
    }
  });
}
function ShepherdTour({
  steps,
  tourOptions,
  children
}) {
  const adjustedSteps = useMemo(() => steps.map((step) => createTourStep(step, tourOptions)), [steps, tourOptions]);
  return createElement(ShepherdTourComponent, {
    steps: adjustedSteps,
    tourOptions,
    children
  });
}
function useShepherdTour() {
  const tour = useContext(ShepherdTourContext);
  if (tour === null) {
    throw new Error("Shepherd has been requested outside of it's access - remember to wrap your app in <ShepherdTour>");
  }
  useEffect(() => {
    let restartWarningGiven = false;
    const originalCancel = tour.cancel;
    const originalAddStep = tour.addStep;
    const originalStart = tour.start;
    tour.addStep = (options, index) => {
      const tourOptions = tour.options;
      const step = createTourStep(options, tourOptions);
      return originalAddStep.call(tour, step, index);
    };
    tour.start = () => {
      if (tour.isActive()) {
        if (!restartWarningGiven) {
          restartWarningGiven = true;
          console.warn("A tour is already active - if you want to restart it use tour.restart");
        }
        return;
      }
      return originalStart.call(tour);
    };
    tour.restart = () => {
      if (tour.isActive()) {
        originalCancel.call(tour);
        originalStart.call(tour);
      } else {
        originalStart.call(tour);
      }
    };
    tour.on("complete", () => {
      document.body.removeAttribute(markerAttribute);
    });
    tour.on("cancel", () => {
      document.body.removeAttribute(markerAttribute);
    });
  }, [tour]);
  return tour;
}
function useShepherdTourMarker() {
  const tour = useShepherdTour();
  const [tourActive, setTourActive] = useState(false);
  const [marker, setMarker] = useState(void 0);
  useEffect(() => {
    function handleStart() {
      setTourActive(true);
    }
    function handleShow(event) {
      setMarker(event.step.options.marker);
    }
    function handleComplete() {
      setMarker(void 0);
      setTourActive(false);
    }
    tour.on("show", handleShow);
    tour.on("complete", handleComplete);
    tour.on("start", handleStart);
    return () => {
      tour.off("show", handleShow);
      tour.off("complete", handleComplete);
      tour.off("start", handleStart);
    };
  });
  return [marker, tourActive];
}
export { ShepherdTour, useShepherdTour, useShepherdTourMarker };
