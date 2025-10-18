"use client"

import React, { useRef } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"

export default function ExcalidrawCanvas() {
  const excalidrawRef = useRef<any>(null)

  const handleSaveJSON = async () => {
    try {
      const elements = await excalidrawRef.current?.getSceneElements?.()
      const appState = await excalidrawRef.current?.getAppState?.()
      const data = { elements, appState }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "excalidraw.json"
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert("Failed to save JSON: " + (err as any)?.message)
    }
  }

  const handleLoadJSON = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const text = reader.result as string
        const parsed = JSON.parse(text)
        const elements = parsed.elements ?? parsed.scene ?? []
        const appState = parsed.appState ?? parsed.state ?? undefined
        // updateScene is provided by Excalidraw React ref API
        await excalidrawRef.current?.updateScene?.({ elements, appState })
      } catch (err) {
        console.error(err)
        alert("Failed to load JSON: " + (err as any)?.message)
      }
    }
    reader.readAsText(file)
    // clear the input so same file can be re-selected
    ev.currentTarget.value = ""
  }

  const handleExportPNG = async () => {
    try {
      // Excalidraw instance exposes exportToBlob in newer versions
      const blob = await excalidrawRef.current?.exportToBlob?.({})
      if (!blob) {
        alert("Export to PNG not available in this build of Excalidraw.")
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "excalidraw.png"
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert("Failed to export PNG: " + (err as any)?.message)
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 12, display: "flex", gap: 8, background: "var(--background, #fff)" }}>
        <button onClick={handleSaveJSON} className="btn">
          Save JSON
        </button>
        <label style={{ display: "inline-flex", alignItems: "center" }}>
          <input type="file" accept="application/json" onChange={handleLoadJSON} style={{ display: "none" }} />
          <span className="btn">Load JSON</span>
        </label>
        <button onClick={handleExportPNG} className="btn">
          Export PNG
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <Excalidraw ref={excalidrawRef} />
      </div>
    </div>
  )
}
