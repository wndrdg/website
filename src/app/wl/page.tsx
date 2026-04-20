"use client";

import { Suspense } from "react";
import { HomeContent } from "../page";

export default function WaitlistInvite() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent showSmsConsent={false} />
    </Suspense>
  );
}
