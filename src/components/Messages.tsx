import { getRandomNumber } from "../helpers/random.ts";
import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";

const messages = [
  "Let's do it",
  "We matter",
  "Only people",
  "Our voice",
  "In public",
  "Non-profit",
  "Open source"
];

function getNewMessageIdx() {
  return getRandomNumber(0, messages.length - 1);
}

function getMessage(idx: number) {
  const message = messages[idx];

  if (!message) {
    throw new Error(`Message at ${idx} not found.`);
  }

  return message;
}

type MessageProps = {
  message: Accessor<string>;
  show: Accessor<boolean>;
};

function Message({ message, show }: MessageProps) {
  const [classes, setClasses] = createSignal(show() ? "opacity-100" : "");

  createEffect(() => {
    setClasses(show() ? "opacity-100" : "");
  });

  return (
    <div
      class={`ease-in-out duration-[1s] absolute top-0 right-0 w-full h-full flex items-center opacity-0 ${classes()}`.trim()}
    >
      {message()}
    </div>
  );
}

export default function Messages() {
  const [idx, setIdx] = createSignal(getNewMessageIdx());
  const [prev_idx, setPrefIdx] = createSignal(idx());

  const [message, setMessage] = createSignal(getMessage(idx()));
  const [prev_message, setPrevMessage] = createSignal(getMessage(prev_idx()));

  const [show_message, setShowMessage] = createSignal(true);
  const [prev_show_message, setPrevShowMessage] = createSignal(true);

  if (!message) {
    throw new Error(`Unknown message at index ${idx()}`);
  } else if (!prev_message) {
    throw new Error(`Unknown message at index ${prev_idx()}`);
  }

  const interval = setInterval(() => {
    if (idx() === prev_idx()) {
      const new_idx = getNewMessageIdx();

      setIdx(new_idx);
    } else {
      setPrefIdx(idx());
    }
  }, 15 * 1000);

  createEffect(() => {
    setMessage(getMessage(idx()));
    setPrevMessage(getMessage(prev_idx()));

    if (idx() === prev_idx()) {
      setShowMessage(false);
      setPrevShowMessage(true);
    } else {
      setShowMessage(true);
      setPrevShowMessage(false);
    }
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <div class="w-full h-full relative">
      <Message show={prev_show_message} message={prev_message} />
      <Message show={show_message} message={message} />
    </div>
  );
}
