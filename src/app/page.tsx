import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/frame.png`,
  button: {
    title: "Mint [Free/Paid]",
    action: {
      type: "launch_frame",
      name: "WeCastPro Mint Page",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0f172a",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "WeCastPro Mint Page",
    openGraph: {
      title: "WeCastPro Mint Page",
      description: "The mint page for WeCastPro from ChrisCoCreated",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (<App />);
}
