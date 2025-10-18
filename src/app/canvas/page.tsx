"use client"

import React from "react"
import dynamic from "next/dynamic"

const ExcalidrawCanvas = dynamic(
  () => import("../../components/ExcalidrawCanvas").then((m) => m.default),
  { ssr: false }
)

export default function Page() {
  return (
    <div style={{ height: "100vh" }}>
      <ExcalidrawCanvas />
    </div>
  )
}
