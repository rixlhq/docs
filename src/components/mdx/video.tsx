"use client";

import {lazy, Suspense, type ReactElement} from "react";
import type {VideoProps} from "@rixl/media-react";

const RixlVideo = lazy(() => import("@rixl/media-react").then((mod) => ({default: mod.Video})));

export function Video(props: VideoProps): ReactElement {
  return (
    <div className="flex overflow-hidden w-full h-[500px] rounded-0.25 drop-shadow-xl max-w-fd-container">
      <Suspense fallback={<div className="flex items-center justify-center w-full h-full bg-gray-100">Loading video...</div>}>
        <RixlVideo {...props} />
      </Suspense>
    </div>
  );
}
