"use client";

import {lazy, Suspense} from "react";
import type {HTMLProps} from "react";

const RixlVideo = lazy(() => import("@rixl/media-react").then((mod) => ({default: mod.Video})));

declare type VideoTheme = "default" | "minimal" | "hover" | "feed" | "hideUI";

declare interface VideoProps extends HTMLProps<HTMLVideoElement> {
  id?: string;
  progressBar?: boolean;
  allowPlayPause?: boolean;
  allowFullscreen?: boolean;
  allowPictureInPicture?: boolean;
  volume?: number;
  theme?: VideoTheme;
  lang?: "en" | "de" | "es" | "fr" | "it" | "pl" | "ru" | "tr" | "uk";
}

export const Video = (props: VideoProps) => {
  return (
    <div className="flex overflow-hidden w-full h-[500px] rounded-0.25 drop-shadow-xl max-w-fd-container">
      <Suspense fallback={<div className="flex items-center justify-center w-full h-full bg-gray-100">Loading video...</div>}>
        <RixlVideo {...props} />
      </Suspense>
    </div>
  );
};
