"use client";

import {lazy, Suspense} from "react";
import type {HTMLProps} from "react";

const RixlVideo = lazy(() => import("@rixl/media-react").then((mod) => ({default: mod.Video})));

type Page = "feed" | "standalone" | "profile";

interface VideoProps extends Omit<HTMLProps<HTMLVideoElement>, "onEnded"> {
  id?: string;
  src?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  analytics?: boolean;
  analyticsPage?: Page;
  feedId?: string;
  postId?: string;
  isCurrent?: boolean;
  onRixlAnalytics?: (event: CustomEvent<{event: unknown}>) => void;
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
