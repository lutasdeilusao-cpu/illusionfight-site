// App.jsx — demo de uso com layer switcher e zoom
import { useState } from "react";
import TiledMap from "./TiledMap";

export default function App() {
  const [zoom, setZoom]       = useState(3);
  const [layer, setLayer]     = useState("Terrain");

  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", padding: 16, fontFamily: "monospace", color: "#ccc" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <label>
          Zoom:&nbsp;
          <input
            type="range" min={1} max={6} step={0.5} value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ width: 100 }}
          />
          &nbsp;{zoom}×
        </label>

        <label>
          Layer:&nbsp;
          <select value={layer} onChange={e => setLayer(e.target.value)}
            style={{ background: "#333", color: "#ccc", border: "1px solid #555", padding: "2px 6px" }}>
            <option value="Terrain">Terrain</option>
            <option value="Objects">Objects</option>
          </select>
        </label>
      </div>

      {/* Mapa com scroll caso seja maior que a tela */}
      <div style={{ overflow: "auto", maxWidth: "100%", maxHeight: "80vh", border: "1px solid #444", borderRadius: 4 }}>
        <TiledMap zoom={zoom} layerName={layer} />
      </div>
    </div>
  );
}
