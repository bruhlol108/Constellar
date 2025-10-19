/**
 * Excalidraw Element Generator
 * Utilities for generating valid Excalidraw elements from AI descriptions
 */

function generateId(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createBaseElement(
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: any = {}
): any {
  return {
    id: generateId(),
    type,
    x,
    y,
    width,
    height,
    angle: options.angle || 0,
    strokeColor: options.strokeColor || "#8b5cf6",
    backgroundColor: options.backgroundColor || "transparent",
    fillStyle: options.fillStyle || "solid",
    strokeWidth: options.strokeWidth || 2,
    strokeStyle: options.strokeStyle || "solid",
    roughness: options.roughness || 1,
    opacity: options.opacity || 100,
    groupIds: [],
    frameId: null,
    roundness: options.roundness || null,
    seed: Math.floor(Math.random() * 2147483647),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2147483647),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  };
}

function createText(
  x: number,
  y: number,
  text: string,
  options: any = {}
): any {
  const fontSize = options.fontSize || 20;
  const charWidth = fontSize * 0.6;
  const lineHeight = fontSize * 1.4;
  const lines = text.split("\n");
  const width = Math.max(...lines.map((line) => line.length * charWidth));
  const height = lines.length * lineHeight;

  const textAlign = options.textAlign || "left";
  const verticalAlign = options.verticalAlign || "top";

  const element = createBaseElement(
    "text",
    x - (textAlign === "center" ? width / 2 : 0),
    y - (verticalAlign === "middle" ? height / 2 : 0),
    width,
    height,
    { strokeColor: options.strokeColor || "#e9ecef" }
  );

  return {
    ...element,
    text,
    fontSize,
    fontFamily: options.fontFamily || 1,
    textAlign,
    verticalAlign,
    baseline: fontSize,
    containerId: options.containerId || null,
    originalText: text,
    lineHeight: 1.25,
  };
}

export function createRectangle(
  x: number,
  y: number,
  width: number = 200,
  height: number = 100,
  options: any = {}
): any[] {
  const element = createBaseElement("rectangle", x, y, width, height, {
    ...options,
    roundness: { type: 3 },
  });

  const elements = [element];

  if (options.label) {
    const textElement = createText(x + width / 2, y + height / 2, options.label, {
      fontSize: 20,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: element.id,
    });
    element.boundElements = [{ type: "text", id: textElement.id }];
    elements.push(textElement);
  }

  return elements;
}

export function createEllipse(
  x: number,
  y: number,
  width: number = 150,
  height: number = 150,
  options: any = {}
): any[] {
  const element = createBaseElement("ellipse", x, y, width, height, options);
  const elements = [element];

  if (options.label) {
    const textElement = createText(x + width / 2, y + height / 2, options.label, {
      fontSize: 20,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: element.id,
    });
    element.boundElements = [{ type: "text", id: textElement.id }];
    elements.push(textElement);
  }

  return elements;
}

export function createDiamond(
  x: number,
  y: number,
  width: number = 150,
  height: number = 150,
  options: any = {}
): any[] {
  const element = createBaseElement("diamond", x, y, width, height, options);
  const elements = [element];

  if (options.label) {
    const textElement = createText(x + width / 2, y + height / 2, options.label, {
      fontSize: 20,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: element.id,
    });
    element.boundElements = [{ type: "text", id: textElement.id }];
    elements.push(textElement);
  }

  return elements;
}

export function createArrow(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: any = {}
): any[] {
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  const element = createBaseElement(
    "arrow",
    Math.min(startX, endX),
    Math.min(startY, endY),
    width,
    height,
    options
  );

  element.points = [
    [0, 0],
    [endX - startX, endY - startY],
  ];
  element.lastCommittedPoint = null;
  element.startBinding = null;
  element.endBinding = null;
  element.startArrowhead = options.startArrowhead || null;
  element.endArrowhead = options.endArrowhead || "arrow";

  const elements = [element];

  if (options.label) {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const textElement = createText(midX, midY, options.label, {
      fontSize: 16,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: element.id,
    });
    element.boundElements = [{ type: "text", id: textElement.id }];
    elements.push(textElement);
  }

  return elements;
}

export function createLine(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: any = {}
): any[] {
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  const element = createBaseElement(
    "line",
    Math.min(startX, endX),
    Math.min(startY, endY),
    width,
    height,
    options
  );

  element.points = [
    [0, 0],
    [endX - startX, endY - startY],
  ];
  element.lastCommittedPoint = null;
  element.startBinding = null;
  element.endBinding = null;
  element.startArrowhead = null;
  element.endArrowhead = null;

  return [element];
}

export function createTextElement(
  x: number,
  y: number,
  text: string,
  options: any = {}
): any[] {
  return [createText(x, y, text, options)];
}

export function createFlowchart(
  title: string,
  steps: string[],
  x: number = 100,
  y: number = 100,
  options: any = {}
): any[] {
  const boxWidth = options.boxWidth || 200;
  const boxHeight = options.boxHeight || 80;
  const verticalSpacing = options.verticalSpacing || 60;
  const elements: any[] = [];
  let currentY = y;

  // Create title diamond
  const titleElements = createDiamond(x, currentY, boxWidth, boxHeight, {
    backgroundColor: "#a78bfa",
    strokeColor: "#8b5cf6",
    label: title,
  });
  elements.push(...titleElements);

  let prevCenterX = x + boxWidth / 2;
  let prevBottomY = currentY + boxHeight;
  currentY += boxHeight + verticalSpacing;

  // Create step rectangles with connecting arrows
  for (let i = 0; i < steps.length; i++) {
    const isLast = i === steps.length - 1;

    // Create rectangle for step
    const stepElements = createRectangle(x, currentY, boxWidth, boxHeight, {
      backgroundColor: isLast ? "#8b5cf6" : "#c4b5fd",
      strokeColor: "#8b5cf6",
      label: steps[i],
    });
    elements.push(...stepElements);

    // Create arrow from previous element
    const arrowElements = createArrow(
      prevCenterX,
      prevBottomY,
      x + boxWidth / 2,
      currentY,
      { strokeWidth: 2, strokeColor: "#8b5cf6" }
    );
    elements.push(...arrowElements);

    prevCenterX = x + boxWidth / 2;
    prevBottomY = currentY + boxHeight;
    currentY += boxHeight + verticalSpacing;
  }

  return elements;
}
