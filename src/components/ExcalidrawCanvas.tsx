"use client"

import React, { useRef, forwardRef, useImperativeHandle, useEffect, useState } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"

interface ExcalidrawCanvasProps {
  onAPIReady?: (api: any) => void;
}

const ExcalidrawCanvas = forwardRef<any, ExcalidrawCanvasProps>((props, ref) => {
  const excalidrawRef = useRef<any>(null)
  const [apiNotified, setApiNotified] = useState(false)

  // Expose the Excalidraw API to parent components
  useImperativeHandle(ref, () => excalidrawRef.current)

  // Poll for API availability and notify parent
  useEffect(() => {
    if (!apiNotified && excalidrawRef.current && props.onAPIReady) {
      console.log("[ExcalidrawCanvas] API detected in useEffect, notifying parent");
      props.onAPIReady(excalidrawRef.current);
      setApiNotified(true);
    }
  }, [excalidrawRef.current, props.onAPIReady, apiNotified])

  // Also set up a polling interval as backup
  useEffect(() => {
    const interval = setInterval(() => {
      if (!apiNotified && excalidrawRef.current && props.onAPIReady) {
        console.log("[ExcalidrawCanvas] API detected via polling, notifying parent");
        props.onAPIReady(excalidrawRef.current);
        setApiNotified(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [apiNotified, props.onAPIReady]);

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
    <div style={{ height: "100%", width: "100%" }}>
      <Excalidraw excalidrawAPI={(api: any) => {
        excalidrawRef.current = api;
        console.log("[ExcalidrawCanvas] API initialized:", !!api);
        if (api && props.onAPIReady) {
          props.onAPIReady(api);
        }
      }} />
    </div>
  )
})

ExcalidrawCanvas.displayName = "ExcalidrawCanvas"

export default ExcalidrawCanvas
