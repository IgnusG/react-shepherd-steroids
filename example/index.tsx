// @ts-expect-error
import { tw } from "https://cdn.skypack.dev/twind";

import {
  useEffect,
  useState,
  Fragment,
  useRef,
  PropsWithChildren,
} from "react";
import { render } from "react-dom";

// Don't forget the default styles if you don't B(ring)Y(our)O(wn)
import "shepherd.js/dist/css/shepherd.css";

import { TourEventProps, ShepherdTour, useShepherdTour } from "../lib";
// You need to import these styles otherwise the hideOnUnmount: false option will cause flickering
import "../lib/style.css";

import { config, steps } from "./tour";

function Flicker(props: PropsWithChildren<{ id: string; onDone?: () => void }>) {
  const [show, setShow] = useState(true);
  const counter = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setShow((previous) => !previous);

      if (counter.current++ === 3) {
        clearInterval(timer);
        props.onDone?.();
      }
    }, 1500);

    return () => clearInterval(timer);
  });

  if (!show) return <span className={tw("w-max")}>¯\_(ツ)_/¯</span>;

  return (
    <span id={props.id} className={tw("w-max")}>
      {props.children}
    </span>
  );
}

const buttonStyles = tw("py-2 px-4 bg-blue-500 text-white rounded my-2");

function App() {
  const [showFirstPart, setShowFirstPart] = useState(false);

  const [showSecondPart, setShowSecondPart] = useState(false);
  const secondPartComplete = useRef(false);

  const [showThirdPart, setShowThirdPart] = useState(false);
  const [finalPartComplete, setFinalPartComplete] = useState(false);

  const tour = useShepherdTour();

  useEffect(() => {
    tour.start();

    tour.on("show", (e: TourEventProps) => {
      if (e.step.id === "last") {
        setShowThirdPart(false);
        setFinalPartComplete(true);
      }
    });
  }, []);

  return (
    <main
      className={tw(
        "w-screen h-screen flex items-center justify-center bg-gray-100"
      )}
    >
      <div className={tw("w-[50ch] flex justify-center flex-col")}>
        <h1 id="title" className={tw("p-3 text-3xl")}>
          Hello!
        </h1>
        <p>This is the demo for the react-shepherd-steroids library!</p>

        <button
          id="more-content"
          className={buttonStyles}
          onClick={() => setTimeout(() => setShowFirstPart(true), 1000)}
        >
          Show more information (with a slight delay)
        </button>

        {showFirstPart && (
          <Fragment>
            <p id="info" className={tw("py-5")}>
              This library is an "elevated" version of the awesome{" "}
              <a href="https://github.com/shipshapecode/react-shepherd">
                <code>react-shepherd</code> library
              </a>
            </p>

            {finalPartComplete || (
              <button
                id="disappearing-toggle"
                className={buttonStyles}
                onClick={() => {
                  if (!secondPartComplete.current) setShowSecondPart(true);
                  else setShowThirdPart(true);
                }}
              >
                Toggle the counter bellow to flicker
              </button>
            )}

            {showSecondPart && (
              <Flicker
                id="flickering-hide"
                onDone={() => {
                  tour.next();
                  setShowSecondPart(false);
                  secondPartComplete.current = true;
                }}
              >
                General Kenobi
              </Flicker>
            )}

            {showThirdPart && (
              <Flicker
                id="flickering-show"
              >
                Okay it's happening everybody!
              </Flicker>
            )}

            {finalPartComplete && (
              <p>
                Check out the base documentation for shepherd to learn how to
                use all the originally built-in functions:{" "}
                <a href="https://shepherdjs.dev/docs/tutorial-02-usage.html">
                  https://shepherdjs.dev/docs
                </a>
              </p>
            )}
          </Fragment>
        )}
      </div>
    </main>
  );
}

render(
  <ShepherdTour steps={steps} tourOptions={config}>
    <App />
  </ShepherdTour>,
  document.getElementById("root")
);
