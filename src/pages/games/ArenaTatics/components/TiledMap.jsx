import { useEffect, useRef } from "react";
import mapData from "../data/tilemaps/sample-map.json";
import tilesetImg from "../assets/tilemap.png";

// ── Config do tileset (do .tsx) ─────────────────────
const TILE_W    = 8;
const TILE_H    = 8;
const SPACING   = 1;
const COLS      = 24;
const FIRST_GID = 1;

// Converte GID do Tiled → coordenada de crop no PNG
// GID 0 = tile vazio; bits de flip (top 3) são mascarados
function gidToXY(gid) {
  if (!gid || gid === 0) return null;
  const FLIP_MASK = 0x1fffffff;
  const cleanGid  = gid & FLIP_MASK;
  const localId   = cleanGid - FIRST_GID;
  const col       = localId % COLS;
  const row       = Math.floor(localId / COLS);
  return {
    sx: col * (TILE_W + SPACING),
    sy: row * (TILE_H + SPACING),
  };
}

export default function TiledMap({ zoom = 3, layerName = "Terrain", style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const layer = mapData.layers.find((l) => l.name === layerName)
                  ?? mapData.layers[0];
    if (!layer) return;

    const mapW = layer.width;
    const mapH = layer.height;

    canvas.width  = mapW * TILE_W * zoom;
    canvas.height = mapH * TILE_H * zoom;
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.src = tilesetImg;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      layer.data.forEach((gid, i) => {
        if (!gid) return;
        const coord = gidToXY(gid);
        if (!coord) return;
        const col = i % mapW;
        const row = Math.floor(i / mapW);
        ctx.drawImage(
          img,
          coord.sx, coord.sy, TILE_W, TILE_H,
          col * TILE_W * zoom,
          row * TILE_H * zoom,
          TILE_W * zoom,
          TILE_H * zoom
        );
      });
    };
  }, [zoom, layerName]);

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: "pixelated", display: "block", ...style }}
    />
  );
}
