import { getRandomNumber } from "../helpers/random.ts";
import DefaultImage from "../assets/Edwin_Andrade.unsplash.webp";
import type { ImageMetadata } from "astro";
import type { JSXElement } from "solid-js";

const UNSPLASH_URL = new URL("https://unsplash.com/");

type BackgroundHeroImageDetailsProps = {
  by: { whom: string; url: URL };
  on: { where: string; url: URL };
};

function BackgroundHeroImageDetails({
                                      by,
                                      on
                                    }: BackgroundHeroImageDetailsProps) {
  return (
    <div class="pointer-events-auto">
      <a class="underline" href={by.url.toString()} target="_blank">
        {by.whom}
      </a>{" "}
      on{" "}
      <a class="underline" href={on.url.toString()} target="_blank">
        {on.where}
      </a>
    </div>
  );
}

type Image = { metadata: ImageMetadata; details: () => JSXElement };

const DEFAULT_IMAGE: Image = {
  metadata: DefaultImage,
  details: () => (
    <BackgroundHeroImageDetails
      by={{
        whom: "Edwin Andrade",
        url: new URL("https://unsplash.com/@theunsteady5")
      }}
      on={{ where: "Unsplash", url: UNSPLASH_URL }}
    />
  )
};

const images: Array<Image> = [DEFAULT_IMAGE];

export class BackgroundHeroImageNotFoundError extends Error {
  constructor() {
    super("Image Not Found");
  }
}

export type BackgroundHeroImage = { randomize?: boolean };

export function BackgroundHeroImage({
                                      randomize = false
                                    }: BackgroundHeroImage) {
  const chosen_idx = randomize ? getRandomNumber(0, images.length) : 0;
  const chosen = images[chosen_idx];

  if (!chosen) {
    throw new BackgroundHeroImageNotFoundError();
  }

  return (
    <div
      class="relative w-screen h-screen opacity-25"
      style={{
        "background-image": `url(${chosen.metadata.src})`,
        "background-size": "cover"
      }}
    >
      <div class="absolute bottom-0 right-0 p-4 text-xs">
        {chosen.details()}
      </div>
    </div>
  );
}
