import { Metadata } from "next";
import { FAQClient } from "./client";

export const metadata: Metadata = {
  title: "FAQ - Mining Pool",
  description: "Frequently asked questions about our mining pool",
};

export default function FAQPage() {
  return <FAQClient />;
}