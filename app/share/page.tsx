"use client";

import { useRouter } from "next/navigation";
import { QRShare } from "@/components/QRShare";

export default function SharePage() {
  const router = useRouter();
  return <QRShare onBack={() => router.push("/")} />;
}
