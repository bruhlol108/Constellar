/**
 * MCP (Model Context Protocol) Adapter
 *
 * This module acts as a bridge between Gemini's JSON action outputs
 * and Excalidraw's API. It translates high-level action descriptions
 * into concrete Excalidraw element creation calls.
 *
 * This is a lightweight adapter - not a full MCP server implementation.
 * It can be upgraded later to support the full MCP specification.
 */

// Types will be inferred - Excalidraw types are challenging to import correctly
type ExcalidrawElement = any;
type ExcalidrawImperativeAPI = any;

// Action type definitions based on what Gemini can output
export interface CreateShapeAction {
  type: "create_shape";
  shape: "rectangle" | "ellipse" | "diamond";
  x: number;
  y: number;
  text?: string;
  width?: number;
  height?: number;
  fillStyle?: "solid" | "hachure" | "cross-hatch";
  strokeColor?: string;
  backgroundColor?: string;
}

export interface CreateTextAction {
  type: "create_text";
  text: string;
  x: number;
  y: number;
  fontSize?: number;
}

export interface ConnectAction {
  type: "connect";
  from: number; // index of source element
  to: number; // index of target element
  label?: string;
}

export interface CreateArrowAction {
  type: "create_arrow";
  x: number;
  y: number;
  endX: number;
  endY: number;
  label?: string;
}

export type DiagramAction =
  | CreateShapeAction
  | CreateTextAction
  | ConnectAction
  | CreateArrowAction;

/**
 * Generate a random ID for Excalidraw elements
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Create an Excalidraw element from a shape action
 */
function createShapeElement(
  action: CreateShapeAction,
  index: number
): ExcalidrawElement {
  const width = action.width || 200;
  const height = action.height || 100;

  const baseElement = {
    id: generateId(),
    type: action.shape,
    x: action.x,
    y: action.y,
    width,
    height,
    angle: 0,
    strokeColor: action.strokeColor || "#1e1e1e",
    backgroundColor: action.backgroundColor || "#a5d8ff",
    fillStyle: action.fillStyle || "solid",
    strokeWidth: 2,
    strokeStyle: "solid" as const,
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: action.shape === "rectangle" ? { type: 3 } : null,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  };

  return baseElement as ExcalidrawElement;
}

/**
 * Create a text element
 */
function createTextElement(
  action: CreateTextAction,
  index: number
): ExcalidrawElement {
  const fontSize = action.fontSize || 20;

  return {
    id: generateId(),
    type: "text",
    x: action.x,
    y: action.y,
    width: action.text.length * fontSize * 0.6,
    height: fontSize * 1.2,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    text: action.text,
    fontSize,
    fontFamily: 1,
    textAlign: "left",
    verticalAlign: "top",
    baseline: fontSize,
    containerId: null,
    originalText: action.text,
    autoResize: true,
    lineHeight: 1.25,
  } as ExcalidrawElement;
}

/**
 * Create an arrow connecting two elements
 */
function createArrowBetweenElements(
  action: ConnectAction,
  elements: ExcalidrawElement[]
): ExcalidrawElement | null {
  const fromElement = elements[action.from];
  const toElement = elements[action.to];

  if (!fromElement || !toElement) {
    console.warn(`Cannot connect: element at index ${action.from} or ${action.to} not found`);
    return null;
  }

  // Calculate start and end points (center of each shape)
  const startX = fromElement.x + fromElement.width / 2;
  const startY = fromElement.y + fromElement.height / 2;
  const endX = toElement.x + toElement.width / 2;
  const endY = toElement.y + toElement.height / 2;

  return {
    id: generateId(),
    type: "arrow",
    x: startX,
    y: startY,
    width: endX - startX,
    height: endY - startY,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 2 },
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    points: [
      [0, 0],
      [endX - startX, endY - startY],
    ],
    lastCommittedPoint: null,
    startBinding: {
      elementId: fromElement.id,
      focus: 0,
      gap: 1,
      fixedPoint: null,
    },
    endBinding: {
      elementId: toElement.id,
      focus: 0,
      gap: 1,
      fixedPoint: null,
    },
    startArrowhead: null,
    endArrowhead: "arrow",
  } as ExcalidrawElement;
}

/**
 * Create a standalone arrow
 */
function createArrowElement(action: CreateArrowAction): ExcalidrawElement {
  return {
    id: generateId(),
    type: "arrow",
    x: action.x,
    y: action.y,
    width: action.endX - action.x,
    height: action.endY - action.y,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 2 },
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    points: [
      [0, 0],
      [action.endX - action.x, action.endY - action.y],
    ],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: "arrow",
  } as ExcalidrawElement;
}

/**
 * Main adapter function: converts Gemini actions into Excalidraw elements
 *
 * @param actions - Array of diagram actions from Gemini
 * @param excalidrawAPI - Reference to Excalidraw's imperative API
 * @returns Array of created Excalidraw elements
 */
export function executeActions(
  actions: DiagramAction[],
  excalidrawAPI: ExcalidrawImperativeAPI | null
): ExcalidrawElement[] {
  if (!excalidrawAPI) {
    console.error("Excalidraw API not available");
    return [];
  }

  const newElements: ExcalidrawElement[] = [];
  const currentElements = excalidrawAPI.getSceneElements();

  // First pass: create all shape and text elements
  actions.forEach((action, index) => {
    try {
      if (action.type === "create_shape") {
        const element = createShapeElement(action, index);
        newElements.push(element);
      } else if (action.type === "create_text") {
        const element = createTextElement(action, index);
        newElements.push(element);
      } else if (action.type === "create_arrow") {
        const element = createArrowElement(action);
        newElements.push(element);
      }
    } catch (error) {
      console.error(`Failed to create element for action ${index}:`, error);
    }
  });

  // Second pass: create connections (arrows between elements)
  actions.forEach((action, index) => {
    try {
      if (action.type === "connect") {
        const arrow = createArrowBetweenElements(action, newElements);
        if (arrow) {
          newElements.push(arrow);
        }
      }
    } catch (error) {
      console.error(`Failed to create connection for action ${index}:`, error);
    }
  });

  // Update the scene with new elements
  excalidrawAPI.updateScene({
    elements: [...currentElements, ...newElements],
  });

  console.log(`Created ${newElements.length} new elements from ${actions.length} actions`);

  return newElements;
}

/**
 * Validate action structure
 */
export function validateAction(action: any): action is DiagramAction {
  if (!action || typeof action !== "object") return false;

  const validTypes = ["create_shape", "create_text", "connect", "create_arrow"];
  if (!validTypes.includes(action.type)) return false;

  switch (action.type) {
    case "create_shape":
      return (
        ["rectangle", "ellipse", "diamond"].includes(action.shape) &&
        typeof action.x === "number" &&
        typeof action.y === "number"
      );
    case "create_text":
      return (
        typeof action.text === "string" &&
        typeof action.x === "number" &&
        typeof action.y === "number"
      );
    case "connect":
      return (
        typeof action.from === "number" &&
        typeof action.to === "number"
      );
    case "create_arrow":
      return (
        typeof action.x === "number" &&
        typeof action.y === "number" &&
        typeof action.endX === "number" &&
        typeof action.endY === "number"
      );
    default:
      return false;
  }
}
