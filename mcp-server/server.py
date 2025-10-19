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


@mcp.tool()
def create_advanced_flowchart(
    nodes: list[dict],
    x: float = 100,
    y: float = 100,
    nodeWidth: float = 200,
    nodeHeight: float = 80,
    horizontalSpacing: float = 120,
    verticalSpacing: float = 60
) -> dict:
    """
    Create an advanced flowchart with decision nodes, branches, and custom connections.

    Args:
        nodes: List of node dicts with 'id', 'type', 'label', and optional 'next' for connections
               type can be: 'start', 'process', 'decision', 'end'
               next can be a node id, or for decisions: {'yes': 'node_id', 'no': 'node_id'}
        x: Starting X coordinate (default 100)
        y: Starting Y coordinate (default 100)
        nodeWidth: Width of each node (default 200)
        nodeHeight: Height of each node (default 80)
        horizontalSpacing: Space between branches (default 120)
        verticalSpacing: Space between vertical nodes (default 60)

    Returns:
        Excalidraw elements for an advanced flowchart

    Example nodes:
    [
        {"id": "start", "type": "start", "label": "Start", "next": "step1"},
        {"id": "step1", "type": "process", "label": "Initialize", "next": "decision1"},
        {"id": "decision1", "type": "decision", "label": "Valid?", "next": {"yes": "step2", "no": "error"}},
        {"id": "step2", "type": "process", "label": "Process", "next": "end"},
        {"id": "error", "type": "process", "label": "Handle Error", "next": "end"},
        {"id": "end", "type": "end", "label": "End"}
    ]
    """
    elements = []
    node_positions = {}
    current_y = y

    # Layout algorithm: level-based positioning
    levels = {}
    node_map = {node['id']: node for node in nodes}

    def get_level(node_id, visited=None):
        if visited is None:
            visited = set()
        if node_id in visited:
            return 0
        visited.add(node_id)

        if node_id not in node_map:
            return 0

        node = node_map[node_id]
        next_nodes = []

        if 'next' in node:
            if isinstance(node['next'], dict):
                next_nodes = list(node['next'].values())
            elif node['next']:
                next_nodes = [node['next']]

        if not next_nodes:
            return 0

        return 1 + max(get_level(n, visited.copy()) for n in next_nodes)

    # Assign levels (reverse topological order)
    for node in nodes:
        node['level'] = get_level(node['id'])

    # Group by level
    max_level = max(n['level'] for n in nodes) if nodes else 0
    for node in nodes:
        level = max_level - node['level']
        if level not in levels:
            levels[level] = []
        levels[level].append(node)

    # Position nodes
    for level in sorted(levels.keys()):
        level_nodes = levels[level]
        level_width = len(level_nodes) * nodeWidth + (len(level_nodes) - 1) * horizontalSpacing
        start_x = x + (nodeWidth - level_width) / 2 if len(level_nodes) > 1 else x

        for i, node in enumerate(level_nodes):
            node_x = start_x + i * (nodeWidth + horizontalSpacing)
            node_y = y + level * (nodeHeight + verticalSpacing)

            # Create shape based on type
            if node['type'] == 'start' or node['type'] == 'end':
                shape = create_ellipse(
                    node_x, node_y, nodeWidth, nodeHeight,
                    backgroundColor="#a78bfa" if node['type'] == 'start' else "#8b5cf6",
                    label=node['label']
                )
            elif node['type'] == 'decision':
                shape = create_diamond(
                    node_x, node_y, nodeWidth, nodeHeight,
                    backgroundColor="#c4b5fd",
                    label=node['label']
                )
            else:  # process
                shape = create_rectangle(
                    node_x, node_y, nodeWidth, nodeHeight,
                    backgroundColor="#ddd6fe",
                    label=node['label']
                )

            elements.extend(shape['elements'])
            node_positions[node['id']] = {
                'x': node_x + nodeWidth / 2,
                'y': node_y + nodeHeight / 2,
                'bottom': node_y + nodeHeight,
                'top': node_y
            }

    # Create connections
    for node in nodes:
        if 'next' not in node or not node['next']:
            continue

        from_pos = node_positions[node['id']]

        if isinstance(node['next'], dict):
            # Decision node with yes/no branches
            for branch, target_id in node['next'].items():
                if target_id in node_positions:
                    to_pos = node_positions[target_id]
                    arrow = create_arrow(
                        from_pos['x'],
                        from_pos['bottom'],
                        to_pos['x'],
                        to_pos['top'],
                        strokeColor="#8b5cf6",
                        label=branch.upper()
                    )
                    elements.extend(arrow['elements'])
        else:
            # Simple connection
            target_id = node['next']
            if target_id in node_positions:
                to_pos = node_positions[target_id]
                arrow = create_arrow(
                    from_pos['x'],
                    from_pos['bottom'],
                    to_pos['x'],
                    to_pos['top'],
                    strokeColor="#8b5cf6"
                )
                elements.extend(arrow['elements'])

    return {"elements": elements}


@mcp.tool()
def create_system_architecture(
    components: list[dict],
    connections: list[dict],
    x: float = 100,
    y: float = 100,
    componentWidth: float = 180,
    componentHeight: float = 120,
    horizontalSpacing: float = 200,
    verticalSpacing: float = 150
) -> dict:
    """
    Create a system architecture diagram with various component types.

    Args:
        components: List of component dicts with 'id', 'type', 'label', optional 'layer'
                   type can be: 'client', 'server', 'database', 'api', 'cache', 'queue', 'storage', 'service'
        connections: List of connection dicts with 'from', 'to', optional 'label'
        x: Starting X coordinate (default 100)
        y: Starting Y coordinate (default 100)
        componentWidth: Width of each component (default 180)
        componentHeight: Height of each component (default 120)
        horizontalSpacing: Space between components horizontally (default 200)
        verticalSpacing: Space between layers vertically (default 150)

    Returns:
        Excalidraw elements for a system architecture diagram

    Example:
    components = [
        {"id": "web", "type": "client", "label": "Web App", "layer": 0},
        {"id": "lb", "type": "server", "label": "Load Balancer", "layer": 1},
        {"id": "api1", "type": "api", "label": "API Server 1", "layer": 2},
        {"id": "api2", "type": "api", "label": "API Server 2", "layer": 2},
        {"id": "db", "type": "database", "label": "PostgreSQL", "layer": 3},
        {"id": "cache", "type": "cache", "label": "Redis", "layer": 3}
    ]
    connections = [
        {"from": "web", "to": "lb", "label": "HTTPS"},
        {"from": "lb", "to": "api1"},
        {"from": "lb", "to": "api2"},
        {"from": "api1", "to": "db", "label": "SQL"},
        {"from": "api2", "to": "db", "label": "SQL"},
        {"from": "api1", "to": "cache"},
        {"from": "api2", "to": "cache"}
    ]
    """
    elements = []
    component_positions = {}

    # Component type styling
    type_styles = {
        'client': {'color': '#60a5fa', 'bg': '#dbeafe', 'icon': '👤'},
        'server': {'color': '#8b5cf6', 'bg': '#ede9fe', 'icon': '🖥️'},
        'database': {'color': '#10b981', 'bg': '#d1fae5', 'icon': '💾'},
        'api': {'color': '#f59e0b', 'bg': '#fef3c7', 'icon': '🔌'},
        'cache': {'color': '#ef4444', 'bg': '#fee2e2', 'icon': '⚡'},
        'queue': {'color': '#ec4899', 'bg': '#fce7f3', 'icon': '📬'},
        'storage': {'color': '#14b8a6', 'bg': '#ccfbf1', 'icon': '📦'},
        'service': {'color': '#6366f1', 'bg': '#e0e7ff', 'icon': '⚙️'}
    }

    # Group components by layer
    layers = {}
    for comp in components:
        layer = comp.get('layer', 0)
        if layer not in layers:
            layers[layer] = []
        layers[layer].append(comp)

    # Position components
    for layer_num in sorted(layers.keys()):
        layer_comps = layers[layer_num]
        layer_width = len(layer_comps) * componentWidth + (len(layer_comps) - 1) * horizontalSpacing
        start_x = x + (componentWidth - layer_width) / 2 if len(layer_comps) > 1 else x

        for i, comp in enumerate(layer_comps):
            comp_x = start_x + i * (componentWidth + horizontalSpacing)
            comp_y = y + layer_num * (componentHeight + verticalSpacing)

            comp_type = comp.get('type', 'service')
            style = type_styles.get(comp_type, type_styles['service'])

            # Create component box
            if comp_type == 'database':
                # Databases are cylinders (use ellipse)
                shape = create_ellipse(
                    comp_x, comp_y, componentWidth, componentHeight,
                    strokeColor=style['color'],
                    backgroundColor=style['bg'],
                    label=f"{style['icon']} {comp['label']}"
                )
            else:
                # Others are rectangles
                shape = create_rectangle(
                    comp_x, comp_y, componentWidth, componentHeight,
                    strokeColor=style['color'],
                    backgroundColor=style['bg'],
                    strokeStyle="solid",
                    fillStyle="solid",
                    label=f"{style['icon']} {comp['label']}"
                )

            elements.extend(shape['elements'])
            component_positions[comp['id']] = {
                'x': comp_x + componentWidth / 2,
                'y': comp_y + componentHeight / 2,
                'bottom': comp_y + componentHeight,
                'top': comp_y,
                'right': comp_x + componentWidth,
                'left': comp_x
            }

    # Create connections
    for conn in connections:
        # Handle both 'from' and 'from1' (Gemini sometimes uses from1 to avoid reserved keyword)
        from_id = conn.get('from') or conn.get('from1')
        to_id = conn.get('to')

        if from_id not in component_positions or to_id not in component_positions:
            continue

        from_pos = component_positions[from_id]
        to_pos = component_positions[to_id]

        # Determine connection points based on relative positions
        if from_pos['bottom'] < to_pos['top']:
            # Vertical connection (from bottom to top)
            start_x, start_y = from_pos['x'], from_pos['bottom']
            end_x, end_y = to_pos['x'], to_pos['top']
        elif from_pos['x'] < to_pos['x']:
            # Horizontal connection (from right to left)
            start_x, start_y = from_pos['right'], from_pos['y']
            end_x, end_y = to_pos['left'], to_pos['y']
        else:
            # Horizontal connection (from left to right)
            start_x, start_y = from_pos['left'], from_pos['y']
            end_x, end_y = to_pos['right'], to_pos['y']

        arrow = create_arrow(
            start_x, start_y,
            end_x, end_y,
            strokeColor="#64748b",
            strokeStyle="solid",
            label=conn.get('label', None)
        )
        elements.extend(arrow['elements'])

    return {"elements": elements}


if __name__ == "__main__":
    import sys

    # For HTTP API mode, use FastAPI
    if "--api" in sys.argv:
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        import uvicorn

        app = FastAPI()

        # Enable CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @app.post("/tools/{tool_name}")
        async def call_tool(tool_name: str, args: dict):
            """Call a tool by name with arguments"""
            tools_map = {
                "create_rectangle": create_rectangle,
                "create_ellipse": create_ellipse,
                "create_diamond": create_diamond,
                "create_arrow": create_arrow,
                "create_line": create_line,
                "create_text_standalone": create_text_standalone,
                "create_flowchart": create_flowchart,
                "create_advanced_flowchart": create_advanced_flowchart,
                "create_system_architecture": create_system_architecture,
            }

            if tool_name not in tools_map:
                return {"error": f"Tool {tool_name} not found"}

            try:
                result = tools_map[tool_name](**args)
                return result
            except Exception as e:
                return {"error": str(e)}

        uvicorn.run(app, host="127.0.0.1", port=8000)

    # Check if running with --sse flag for MCP SSE transport
    elif "--sse" in sys.argv:
        # Run as HTTP server with SSE transport
        mcp.run(transport="sse")
    else:
        # Run as stdio for Claude Desktop
        mcp.run()
