#!/usr/bin/env python3
"""
Constellar MCP Server - Excalidraw Canvas Tools
Provides tools for generating Excalidraw elements through Claude MCP
"""

import json
import random
import string
from typing import Literal, Optional
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("Constellar Canvas")


def generate_id(length: int = 12) -> str:
    """Generate a random ID for Excalidraw elements"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def create_base_element(
    element_type: str,
    x: float,
    y: float,
    width: float = 200,
    height: float = 100,
    **kwargs
) -> dict:
    """Create a base Excalidraw element with common properties"""
    element = {
        "id": generate_id(),
        "type": element_type,
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "angle": kwargs.get("angle", 0),
        "strokeColor": kwargs.get("strokeColor", "#1971c2"),
        "backgroundColor": kwargs.get("backgroundColor", "transparent"),
        "fillStyle": kwargs.get("fillStyle", "solid"),
        "strokeWidth": kwargs.get("strokeWidth", 2),
        "strokeStyle": kwargs.get("strokeStyle", "solid"),
        "roughness": kwargs.get("roughness", 1),
        "opacity": kwargs.get("opacity", 100),
        "groupIds": [],
        "frameId": None,
        "roundness": kwargs.get("roundness", None),
        "seed": random.randint(1, 2147483647),
        "version": 1,
        "versionNonce": random.randint(1, 2147483647),
        "isDeleted": False,
        "boundElements": None,
        "updated": 1,
        "link": None,
        "locked": False,
    }
    return element


@mcp.tool()
def create_rectangle(
    x: float,
    y: float,
    width: float = 200,
    height: float = 100,
    strokeColor: str = "#8b5cf6",
    backgroundColor: str = "transparent",
    strokeWidth: int = 2,
    strokeStyle: Literal["solid", "dashed", "dotted"] = "solid",
    fillStyle: Literal["solid", "hachure", "cross-hatch"] = "solid",
    label: Optional[str] = None
) -> dict:
    """
    Create a rectangle shape on the Excalidraw canvas.

    Args:
        x: X coordinate of top-left corner
        y: Y coordinate of top-left corner
        width: Width of rectangle (default 200)
        height: Height of rectangle (default 100)
        strokeColor: Border color in hex (default purple #8b5cf6)
        backgroundColor: Fill color in hex or 'transparent' (default transparent)
        strokeWidth: Border width in pixels (default 2)
        strokeStyle: Border style - solid, dashed, or dotted (default solid)
        fillStyle: Fill pattern - solid, hachure, or cross-hatch (default solid)
        label: Optional text label inside the rectangle

    Returns:
        Excalidraw element object for a rectangle
    """
    element = create_base_element(
        "rectangle",
        x, y, width, height,
        strokeColor=strokeColor,
        backgroundColor=backgroundColor,
        strokeWidth=strokeWidth,
        strokeStyle=strokeStyle,
        fillStyle=fillStyle,
        roundness={"type": 3}
    )

    elements = [element]

    # Add text label if provided
    if label:
        text_element = create_text(
            x + width / 2,
            y + height / 2,
            label,
            fontSize=20,
            textAlign="center",
            verticalAlign="middle",
            containerId=element["id"]
        )
        element["boundElements"] = [{"type": "text", "id": text_element["id"]}]
        elements.append(text_element)

    return {"elements": elements}


@mcp.tool()
def create_ellipse(
    x: float,
    y: float,
    width: float = 150,
    height: float = 150,
    strokeColor: str = "#8b5cf6",
    backgroundColor: str = "transparent",
    strokeWidth: int = 2,
    strokeStyle: Literal["solid", "dashed", "dotted"] = "solid",
    fillStyle: Literal["solid", "hachure", "cross-hatch"] = "solid",
    label: Optional[str] = None
) -> dict:
    """
    Create an ellipse/circle shape on the Excalidraw canvas.

    Args:
        x: X coordinate of center
        y: Y coordinate of center
        width: Width of ellipse (default 150)
        height: Height of ellipse (default 150, same as width for circle)
        strokeColor: Border color in hex (default purple #8b5cf6)
        backgroundColor: Fill color in hex or 'transparent' (default transparent)
        strokeWidth: Border width in pixels (default 2)
        strokeStyle: Border style - solid, dashed, or dotted (default solid)
        fillStyle: Fill pattern - solid, hachure, or cross-hatch (default solid)
        label: Optional text label inside the ellipse

    Returns:
        Excalidraw element object for an ellipse
    """
    element = create_base_element(
        "ellipse",
        x, y, width, height,
        strokeColor=strokeColor,
        backgroundColor=backgroundColor,
        strokeWidth=strokeWidth,
        strokeStyle=strokeStyle,
        fillStyle=fillStyle
    )

    elements = [element]

    # Add text label if provided
    if label:
        text_element = create_text(
            x + width / 2,
            y + height / 2,
            label,
            fontSize=20,
            textAlign="center",
            verticalAlign="middle",
            containerId=element["id"]
        )
        element["boundElements"] = [{"type": "text", "id": text_element["id"]}]
        elements.append(text_element)

    return {"elements": elements}


@mcp.tool()
def create_diamond(
    x: float,
    y: float,
    width: float = 150,
    height: float = 150,
    strokeColor: str = "#8b5cf6",
    backgroundColor: str = "transparent",
    strokeWidth: int = 2,
    strokeStyle: Literal["solid", "dashed", "dotted"] = "solid",
    fillStyle: Literal["solid", "hachure", "cross-hatch"] = "solid",
    label: Optional[str] = None
) -> dict:
    """
    Create a diamond shape on the Excalidraw canvas.

    Args:
        x: X coordinate of top-left corner
        y: Y coordinate of top-left corner
        width: Width of diamond (default 150)
        height: Height of diamond (default 150)
        strokeColor: Border color in hex (default purple #8b5cf6)
        backgroundColor: Fill color in hex or 'transparent' (default transparent)
        strokeWidth: Border width in pixels (default 2)
        strokeStyle: Border style - solid, dashed, or dotted (default solid)
        fillStyle: Fill pattern - solid, hachure, or cross-hatch (default solid)
        label: Optional text label inside the diamond

    Returns:
        Excalidraw element object for a diamond
    """
    element = create_base_element(
        "diamond",
        x, y, width, height,
        strokeColor=strokeColor,
        backgroundColor=backgroundColor,
        strokeWidth=strokeWidth,
        strokeStyle=strokeStyle,
        fillStyle=fillStyle
    )

    elements = [element]

    # Add text label if provided
    if label:
        text_element = create_text(
            x + width / 2,
            y + height / 2,
            label,
            fontSize=20,
            textAlign="center",
            verticalAlign="middle",
            containerId=element["id"]
        )
        element["boundElements"] = [{"type": "text", "id": text_element["id"]}]
        elements.append(text_element)

    return {"elements": elements}


@mcp.tool()
def create_arrow(
    startX: float,
    startY: float,
    endX: float,
    endY: float,
    strokeColor: str = "#8b5cf6",
    strokeWidth: int = 2,
    strokeStyle: Literal["solid", "dashed", "dotted"] = "solid",
    startArrowhead: Optional[Literal["arrow", "bar", "dot", "triangle"]] = None,
    endArrowhead: Literal["arrow", "bar", "dot", "triangle"] = "arrow",
    label: Optional[str] = None
) -> dict:
    """
    Create an arrow connecting two points on the Excalidraw canvas.

    Args:
        startX: X coordinate of arrow start point
        startY: Y coordinate of arrow start point
        endX: X coordinate of arrow end point
        endY: Y coordinate of arrow end point
        strokeColor: Arrow color in hex (default purple #8b5cf6)
        strokeWidth: Arrow line width in pixels (default 2)
        strokeStyle: Line style - solid, dashed, or dotted (default solid)
        startArrowhead: Arrowhead at start - arrow, bar, dot, triangle, or None (default None)
        endArrowhead: Arrowhead at end - arrow, bar, dot, triangle (default arrow)
        label: Optional text label on the arrow

    Returns:
        Excalidraw element object for an arrow
    """
    width = abs(endX - startX)
    height = abs(endY - startY)

    element = create_base_element(
        "arrow",
        min(startX, endX),
        min(startY, endY),
        width,
        height,
        strokeColor=strokeColor,
        strokeWidth=strokeWidth,
        strokeStyle=strokeStyle
    )

    # Calculate points relative to element position
    points = [
        [0, 0],
        [endX - startX, endY - startY]
    ]

    element.update({
        "points": points,
        "lastCommittedPoint": None,
        "startBinding": None,
        "endBinding": None,
        "startArrowhead": startArrowhead,
        "endArrowhead": endArrowhead
    })

    elements = [element]

    # Add text label if provided
    if label:
        mid_x = (startX + endX) / 2
        mid_y = (startY + endY) / 2
        text_element = create_text(
            mid_x,
            mid_y,
            label,
            fontSize=16,
            textAlign="center",
            verticalAlign="middle",
            containerId=element["id"]
        )
        element["boundElements"] = [{"type": "text", "id": text_element["id"]}]
        elements.append(text_element)

    return {"elements": elements}


@mcp.tool()
def create_line(
    startX: float,
    startY: float,
    endX: float,
    endY: float,
    strokeColor: str = "#8b5cf6",
    strokeWidth: int = 2,
    strokeStyle: Literal["solid", "dashed", "dotted"] = "solid"
) -> dict:
    """
    Create a line connecting two points on the Excalidraw canvas.

    Args:
        startX: X coordinate of line start point
        startY: Y coordinate of line start point
        endX: X coordinate of line end point
        endY: Y coordinate of line end point
        strokeColor: Line color in hex (default purple #8b5cf6)
        strokeWidth: Line width in pixels (default 2)
        strokeStyle: Line style - solid, dashed, or dotted (default solid)

    Returns:
        Excalidraw element object for a line
    """
    width = abs(endX - startX)
    height = abs(endY - startY)

    element = create_base_element(
        "line",
        min(startX, endX),
        min(startY, endY),
        width,
        height,
        strokeColor=strokeColor,
        strokeWidth=strokeWidth,
        strokeStyle=strokeStyle
    )

    # Calculate points relative to element position
    points = [
        [0, 0],
        [endX - startX, endY - startY]
    ]

    element.update({
        "points": points,
        "lastCommittedPoint": None,
        "startBinding": None,
        "endBinding": None,
        "startArrowhead": None,
        "endArrowhead": None
    })

    return {"elements": [element]}


def create_text(
    x: float,
    y: float,
    text: str,
    fontSize: int = 20,
    fontFamily: int = 1,
    textAlign: Literal["left", "center", "right"] = "left",
    verticalAlign: Literal["top", "middle"] = "top",
    strokeColor: str = "#e9ecef",
    containerId: Optional[str] = None
) -> dict:
    """Create a text element (used internally and as standalone)"""
    # Calculate approximate text dimensions
    char_width = fontSize * 0.6
    line_height = fontSize * 1.4
    lines = text.split('\n')
    width = max(len(line) * char_width for line in lines)
    height = len(lines) * line_height

    element = create_base_element(
        "text",
        x - (width / 2 if textAlign == "center" else 0),
        y - (height / 2 if verticalAlign == "middle" else 0),
        width,
        height,
        strokeColor=strokeColor
    )

    element.update({
        "text": text,
        "fontSize": fontSize,
        "fontFamily": fontFamily,
        "textAlign": textAlign,
        "verticalAlign": verticalAlign,
        "baseline": fontSize,
        "containerId": containerId,
        "originalText": text,
        "lineHeight": 1.25
    })

    return element


@mcp.tool()
def create_text_standalone(
    x: float,
    y: float,
    text: str,
    fontSize: int = 20,
    fontFamily: int = 1,
    textAlign: Literal["left", "center", "right"] = "left",
    strokeColor: str = "#e9ecef"
) -> dict:
    """
    Create standalone text on the Excalidraw canvas.

    Args:
        x: X coordinate of text position
        y: Y coordinate of text position
        text: The text content to display
        fontSize: Font size in pixels (default 20)
        fontFamily: Font family (1=Virgil, 2=Helvetica, 3=Cascadia) (default 1)
        textAlign: Horizontal alignment - left, center, or right (default left)
        strokeColor: Text color in hex (default light gray #e9ecef)

    Returns:
        Excalidraw element object for text
    """
    element = create_text(
        x, y, text,
        fontSize=fontSize,
        fontFamily=fontFamily,
        textAlign=textAlign,
        strokeColor=strokeColor
    )
    return {"elements": [element]}


@mcp.tool()
def create_flowchart(
    title: str,
    steps: list[str],
    x: float = 100,
    y: float = 100,
    boxWidth: float = 200,
    boxHeight: float = 80,
    verticalSpacing: float = 60
) -> dict:
    """
    Create a vertical flowchart with connected boxes.

    Args:
        title: Title for the flowchart (will be in a diamond)
        steps: List of step descriptions (each will be in a rectangle)
        x: Starting X coordinate (default 100)
        y: Starting Y coordinate (default 100)
        boxWidth: Width of each box (default 200)
        boxHeight: Height of each box (default 80)
        verticalSpacing: Space between boxes (default 60)

    Returns:
        Excalidraw elements for a complete flowchart
    """
    elements = []
    current_y = y

    # Create title diamond
    title_elem = create_diamond(
        x, current_y, boxWidth, boxHeight,
        backgroundColor="#a78bfa",
        label=title
    )
    elements.extend(title_elem["elements"])
    prev_center_x = x + boxWidth / 2
    prev_bottom_y = current_y + boxHeight
    current_y += boxHeight + verticalSpacing

    # Create step rectangles with connecting arrows
    for i, step in enumerate(steps):
        is_last = i == len(steps) - 1

        # Create rectangle for step
        step_elem = create_rectangle(
            x, current_y, boxWidth, boxHeight,
            backgroundColor="#c4b5fd" if not is_last else "#8b5cf6",
            label=step
        )
        elements.extend(step_elem["elements"])

        # Create arrow from previous element
        arrow_elem = create_arrow(
            prev_center_x,
            prev_bottom_y,
            x + boxWidth / 2,
            current_y,
            strokeWidth=2
        )
        elements.extend(arrow_elem["elements"])

        prev_center_x = x + boxWidth / 2
        prev_bottom_y = current_y + boxHeight
        current_y += boxHeight + verticalSpacing

    return {"elements": elements}


if __name__ == "__main__":
    mcp.run()
