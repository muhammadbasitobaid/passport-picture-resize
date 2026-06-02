import { env } from "@/env.mjs";

export const siteConfig = {
  title: "Passport Picture Resize",
  description:
    "Resize and crop your photos to standard passport and ID dimensions right in your browser.",
  keywords: ["passport photo", "id photo", "image resize", "photo cropper"],
  url: env.APP_URL || "http://localhost:3000",
  googleSiteVerificationId: env.GOOGLE_SITE_VERIFICATION_ID || "",
};
