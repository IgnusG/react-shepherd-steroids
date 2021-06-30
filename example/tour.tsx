// @ts-expect-error
import { tw } from "https://cdn.skypack.dev/twind";

import { Fragment } from "react";

import { Steps, TourOptions } from "../lib";

function RainbowJSXMessage() {
    return (
      <span>
        <span className={tw("text-pink-600")}>Support</span>{" "}
        <span className={tw("text-red-500")}>for</span>{" "}
        <span className={tw("text-purple-600")}>JSX</span>{" "}
        <span className={tw("text-blue-600")}>is</span>{" "}
        <span className={tw("text-green-600")}>a given 🎉</span>
      </span>
    );
  }
  
  function DisappearingExplanation() {
    return (
      <Fragment>
        Or you can keep it displayed when it gets removed
  
        <blockquote className={tw("mt-2 text-gray-400 text-sm")}>
          The size of the overlay area will adjust whenever the anchor remounts.
        </blockquote>
      </Fragment>
    );
  }

  function WhatsTheProcedure() {
    return (
      <Fragment>
        What's the procedure?
  
        <blockquote className={tw("mt-2 text-gray-400 text-sm")}>
          I'm only attached to the text not the <a href="https://kaomojihub.com/">Kaomoji</a> but even if the text disappears I will stay open.
          This can be useful for eg. video controls that may suddenly disappear on video loading but we still want to keep the tutorial intact.
        </blockquote>
      </Fragment>
    );
  }

export const steps: Steps = [
    {
      attachTo: { element: "#title", on: "top" },
      text: <RainbowJSXMessage />,
      buttons: [
        {
          action(): void {
            this.next();
          },
          text: "Next",
        },
      ],
    },
    {
      attachTo: { element: "#more-content", on: "bottom" },
      modalOverlayOpeningPadding: 5,
      text: "Click on the button above. I will wait with displaying the next message until that content loads",
      advanceOn: { selector: "#more-content", event: "click" },
    },
    {
      attachTo: { element: "#info", on: "top" },
      text: "See - didn't crash. Those days are finally over",
      buttons: [
        {
          action(): void {
            this.next();
          },
          text: "Next",
        },
      ],
    },
    {
      attachTo: { element: "#disappearing-toggle", on: "top" },
      text: "If the anchor dissappears while I'm shown I can be hidden and reopened once it appears again. Try it out!",
      advanceOn: { selector: "#disappearing-toggle", event: "click" },
    },
    {
      attachTo: { element: "#flickering-hide", on: "top" },
      text: "Hello there",
      hideOnUnmount: true,
    },
    {
      attachTo: { element: "#disappearing-toggle", on: "top" },
      text: <DisappearingExplanation />,
      advanceOn: { selector: "#disappearing-toggle", event: "click" },
    },
    {
      attachTo: { element: "#flickering-show", on: "top" },
      text: <WhatsTheProcedure />,
      buttons: [
        {
          action(): void {
            this.next();
          },
          text: "Next",
        },
      ],
    },
    {
      id: "last",
      text: "And that's all folks! Thanks for visiting :)",
      buttons: [
        {
          action(): void {
            this.complete();
          },
          text: "Finish",
        },
      ],
    },
  ] as const;
  
  export const config: TourOptions = {
    defaultStepOptions: {
      waitForElement: true,
      hideOnUnmount: false,
      popperOptions: {
        modifiers: [{ name: "offset", options: { offset: [0, 6] } }],
      },
      modalOverlayOpeningPadding: 5,
      modalOverlayOpeningRadius: 10,
    },
    useModalOverlay: true,
  };
