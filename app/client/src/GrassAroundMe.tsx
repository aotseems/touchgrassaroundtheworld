import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Icon from "./components/Icon";
import "./GrassAroundMe.css";

// Interface for a grass spot in 3D space
export interface GrassSpot {
  id: string;
  name: string;
  species: string;
  biome: string;
  vibe: string;
  elevationMeters: number;
  lat: number;
  lng: number;
  // Local offsets relative to user in meters
  relX: number; // East (+) / West (-) in meters
  relY: number; // North (+) / South (-) in meters
  distanceMeters: number;
  bearing: number; // 0-360 degrees
  bearingLabel: string;
  canTouch: boolean; // distance <= 15m
}

export interface TouchProof {
  id: string;
  spotName: string;
  species: string;
  distanceMeters: number;
  timestamp: string;
  lat: number;
  lng: number;
}

// Haversine distance formula
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Calculate compass bearing
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return Math.round(((theta * 180) / Math.PI + 360) % 360);
}

function getBearingLabel(bearing: number): string {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(bearing / 45) % 8;
  return labels[idx];
}

const GRASS_TEMPLATES = [
  { name: "Dewy Velvet Meadow", species: "Poa pratensis (Kentucky Bluegrass)", biome: "Temperate Meadow", vibe: "Silky, cool, and refreshed" },
  { name: "Sunlit Clover Glade", species: "Trifolium repens (White Clover & Rye)", biome: "Sunny Lawn", vibe: "Sweet, soft, and aromatic" },
  { name: "Shadow Pine Moss Patch", species: "Polytrichum commune (Haircap Moss)", biome: "Coniferous Woodland", vibe: "Dense, spongey, and ancient" },
  { name: "Wild Alpine Fescue", species: "Festuca ovina (Sheep Fescue)", biome: "Subalpine Slope", vibe: "Fine-textured, crisp, and resilient" },
  { name: "Stream-side Sweetgrass", species: "Hierochloe odorata (Holy Grass)", biome: "Riparian Bank", vibe: "Vanilla fragrance and dewy blades" },
  { name: "Windblown Prairie Tuft", species: "Bouteloua gracilis (Blue Grama)", biome: "Savanna Grassland", vibe: "Golden, springy, and sun-warmed" },
  { name: "Urban Park Bermuda Lawn", species: "Cynodon dactylon (Bermuda Green)", biome: "City Sanctuary", vibe: "Thick, bouncy carpet" },
  { name: "Lush Fern & Forest Carpet", species: "Pteridium & Wood Meadow", biome: "Deciduous Forest", vibe: "Earthy, rich, and wild" },
  { name: "Highland Feather Grass", species: "Stipa pennata (European Feather)", biome: "Rocky Plateau", vibe: "Silvery plumes swaying in breeze" },
];

interface GoogleMapInstance {
  panTo: (coords: { lat: number; lng: number }) => void;
  setTilt: (tilt: number) => void;
  setHeading: (heading: number) => void;
}

interface GoogleMarkerInstance {
  setMap: (map: unknown) => void;
  addListener: (event: string, handler: () => void) => void;
}

interface GoogleCircleInstance {
  setMap: (map: unknown) => void;
}

interface GoogleMapsGlobal {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
    Circle: new (options: Record<string, unknown>) => GoogleCircleInstance;
    Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
    SymbolPath: {
      FORWARD_CLOSED_ARROW: number;
      CIRCLE: number;
    };
  };
}

export default function GrassAroundMe() {
  // GPS Coordinates (Default: beautiful mountain meadow location until GPS locks)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 46.4712,
    lng: 11.8021,
  });
  const [gpsStatus, setGpsStatus] = useState<"locating" | "active" | "denied" | "simulated">(
    () => (typeof navigator !== "undefined" && "geolocation" in navigator ? "locating" : "denied")
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(8);
  const [userHeading, setUserHeading] = useState<number>(32); // degrees
  const [userSpeed, setUserSpeed] = useState<number>(0);

  // Range setting: X meters (Default 250m)
  const [rangeMeters, setRangeMeters] = useState<number>(250);

  // View mode
  const [viewMode, setViewMode] = useState<"3d-space" | "google-maps">("3d-space");
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [isCompassLocked, setIsCompassLocked] = useState<boolean>(true);
  const [googleApiKey, setGoogleApiKey] = useState<string>("");
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState<boolean>(false);
  const [activeTouchModal, setActiveTouchModal] = useState<TouchProof | null>(null);

  // Proofs of Touch collection
  const [proofs, setProofs] = useState<TouchProof[]>(() => {
    try {
      const saved = localStorage.getItem("touch_grass_proofs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Canvas 3D Space State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const googleMarkersRef = useRef<GoogleMarkerInstance[]>([]);
  const googleCircleRef = useRef<GoogleCircleInstance | null>(null);

  // Camera Orbit angles for 3D Space (pitch, yaw, zoom)
  const [cameraPitch, setCameraPitch] = useState<number>(55); // 20° to 80°
  const [cameraYaw, setCameraYaw] = useState<number>(32); // 0° to 360°
  const [cameraZoom, setCameraZoom] = useState<number>(1);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Request and Watch Real GPS
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsAccuracy(Math.round(pos.coords.accuracy || 10));
        if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
          setUserHeading(Math.round(pos.coords.heading));
        }
        setGpsStatus("active");
      },
      (err) => {
        console.warn("GPS error / permission denied:", err.message);
        setGpsStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 4000 }
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsAccuracy(Math.round(pos.coords.accuracy || 8));
        if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
          setUserHeading(Math.round(pos.coords.heading));
        }
        if (pos.coords.speed !== null && !isNaN(pos.coords.speed)) {
          setUserSpeed(Math.round(pos.coords.speed * 3.6)); // km/h
        }
        setGpsStatus("active");
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 2. Procedural Grass Spots Generation within Range
  // Anchored around user coordinates using a stable cell formula
  const grassSpots = useMemo<GrassSpot[]>(() => {
    const spots: GrassSpot[] = [];
    const baseLat = Math.round(userCoords.lat * 1000) / 1000;

    // Fixed radial distributions to ensure spots spread in every direction
    const angles = [15, 52, 95, 142, 190, 235, 280, 325, 40, 160, 260, 345];
    const distancesRatio = [0.06, 0.16, 0.28, 0.42, 0.58, 0.72, 0.85, 0.96, 0.22, 0.5, 0.78, 0.92];

    angles.forEach((deg, idx) => {
      const template = GRASS_TEMPLATES[idx % GRASS_TEMPLATES.length];
      const dist = Math.max(10, Math.round(rangeMeters * distancesRatio[idx]));

      // Convert distance (meters) and bearing (deg) to delta lat/lng
      // 1 deg lat ≈ 111,320m ; 1 deg lng ≈ 111,320 * cos(lat)
      const rad = (deg * Math.PI) / 180;
      const metersNorth = dist * Math.cos(rad);
      const metersEast = dist * Math.sin(rad);

      const dLat = metersNorth / 111320;
      const dLng = metersEast / (111320 * Math.cos((baseLat * Math.PI) / 180));

      const spotLat = userCoords.lat + dLat;
      const spotLng = userCoords.lng + dLng;

      const exactDistance = calculateDistanceMeters(userCoords.lat, userCoords.lng, spotLat, spotLng);
      const exactBearing = calculateBearing(userCoords.lat, userCoords.lng, spotLat, spotLng);

      spots.push({
        id: `grass-spot-${idx}`,
        name: template.name,
        species: template.species,
        biome: template.biome,
        vibe: template.vibe,
        elevationMeters: Math.round(120 + Math.sin(idx * 2) * 45),
        lat: spotLat,
        lng: spotLng,
        relX: metersEast,
        relY: metersNorth,
        distanceMeters: exactDistance,
        bearing: exactBearing,
        bearingLabel: getBearingLabel(exactBearing),
        canTouch: exactDistance <= 15,
      });
    });

    return spots.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [userCoords, rangeMeters]);

  // Nearest grass spot
  const nearestSpot = grassSpots[0];

  // Selected Spot Object
  const selectedSpot = grassSpots.find((s) => s.id === selectedSpotId) || nearestSpot;

  // 3. Touch Grass Action
  const handleTouchGrass = (spot: GrassSpot) => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }

    const proof: TouchProof = {
      id: `proof-${Date.now()}`,
      spotName: spot.name,
      species: spot.species,
      distanceMeters: spot.distanceMeters,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      lat: spot.lat,
      lng: spot.lng,
    };

    const updated = [proof, ...proofs].slice(0, 20);
    setProofs(updated);
    try {
      localStorage.setItem("touch_grass_proofs", JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to save proofs", err);
    }

    setActiveTouchModal(proof);
  };

  // 4. Simulated Movement Controls (allows testing & indoor walking)
  const handleSimulateWalk = (direction: "N" | "S" | "E" | "W" | "toward-nearest", meters = 6) => {
    setGpsStatus("simulated");

    if (direction === "toward-nearest" && selectedSpot) {
      const rad = (selectedSpot.bearing * Math.PI) / 180;
      const metersNorth = meters * Math.cos(rad);
      const metersEast = meters * Math.sin(rad);

      const dLat = metersNorth / 111320;
      const dLng = metersEast / (111320 * Math.cos((userCoords.lat * Math.PI) / 180));

      setUserCoords((prev) => ({
        lat: prev.lat + dLat,
        lng: prev.lng + dLng,
      }));
      setUserHeading(selectedSpot.bearing);
      return;
    }

    const deltaMap = {
      N: { dN: meters, dE: 0, heading: 0 },
      S: { dN: -meters, dE: 0, heading: 180 },
      E: { dN: 0, dE: meters, heading: 90 },
      W: { dN: 0, dE: -meters, heading: 270 },
    };

    const { dN, dE, heading } = deltaMap[direction as "N" | "S" | "E" | "W"];
    const dLat = dN / 111320;
    const dLng = dE / (111320 * Math.cos((userCoords.lat * Math.PI) / 180));

    setUserCoords((prev) => ({
      lat: prev.lat + dLat,
      lng: prev.lng + dLng,
    }));
    setUserHeading(heading);
  };

  // 5. 3D Perspective Canvas Rendering Loop
  useEffect(() => {
    if (viewMode !== "3d-space") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let wavePulse = 0;

    const render = () => {
      wavePulse = (wavePulse + 0.015) % 1;
      const width = (canvas.width = canvas.parentElement?.clientWidth || 900);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 520);

      const centerX = width / 2;
      const centerY = height * 0.65; // Eye level ground center

      // 3D Perspective Projection configuration
      const effectiveYaw = isCompassLocked ? userHeading : cameraYaw;
      const pitchRad = (cameraPitch * Math.PI) / 180;
      const yawRad = (effectiveYaw * Math.PI) / 180;
      const cosPitch = Math.cos(pitchRad);
      const sinPitch = Math.sin(pitchRad);
      const cosYaw = Math.cos(yawRad);
      const sinYaw = Math.sin(yawRad);

      const scale = (height * 0.42 * cameraZoom) / rangeMeters;

      // Project (relX East, relY North, relZ Up) to 2D screen (sx, sy, depth)
      const project3D = (x: number, y: number, z = 0) => {
        // Rotate around Y-axis (Yaw)
        const rx = x * cosYaw - y * sinYaw;
        const ry = x * sinYaw + y * cosYaw;

        // Tilt forward (Pitch)
        const depth = ry * cosPitch - z * sinPitch;
        const groundY = ry * sinPitch + z * cosPitch;

        // Perspective foreshortening
        const perspectiveFactor = 1 / (1 + depth * 0.0035);
        const sx = centerX + rx * scale * perspectiveFactor;
        const sy = centerY - groundY * scale * perspectiveFactor;

        return { sx, sy, depth, visible: depth > -rangeMeters * 1.5 };
      };

      // 1. Clear & Background Gradient (Atmospheric Dusk Outdoors)
      ctx.clearRect(0, 0, width, height);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#0a110b");
      skyGrad.addColorStop(0.45, "#101a11");
      skyGrad.addColorStop(0.75, "#152216");
      skyGrad.addColorStop(1, "#0d150e");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Horizon Line glow
      ctx.beginPath();
      ctx.moveTo(0, centerY * 0.45);
      ctx.lineTo(width, centerY * 0.45);
      ctx.strokeStyle = "rgba(197, 238, 137, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Ground 3D Grid Lines
      ctx.lineWidth = 1;
      const gridStep = rangeMeters <= 100 ? 25 : rangeMeters <= 500 ? 50 : 100;
      const gridExtent = rangeMeters * 1.25;

      for (let x = -gridExtent; x <= gridExtent; x += gridStep) {
        const p1 = project3D(x, -gridExtent, 0);
        const p2 = project3D(x, gridExtent, 0);
        if (p1.visible && p2.visible) {
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.strokeStyle = x === 0 ? "rgba(197, 238, 137, 0.25)" : "rgba(197, 238, 137, 0.06)";
          ctx.stroke();
        }
      }

      for (let y = -gridExtent; y <= gridExtent; y += gridStep) {
        const p1 = project3D(-gridExtent, y, 0);
        const p2 = project3D(gridExtent, y, 0);
        if (p1.visible && p2.visible) {
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.strokeStyle = y === 0 ? "rgba(197, 238, 137, 0.25)" : "rgba(197, 238, 137, 0.06)";
          ctx.stroke();
        }
      }

      // 4. Concentric Range Rings (25m, 50m, 100m, rangeMeters)
      const rings = [25, 50, 100, rangeMeters].filter((r, i, arr) => r <= rangeMeters && arr.indexOf(r) === i);
      rings.forEach((r) => {
        ctx.beginPath();
        const segments = 48;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const p = project3D(r * Math.sin(theta), r * Math.cos(theta), 0);
          if (i === 0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        ctx.strokeStyle = r === rangeMeters ? "rgba(197, 238, 137, 0.4)" : "rgba(197, 238, 137, 0.12)";
        ctx.setLineDash(r === rangeMeters ? [5, 5] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on North ring
        const labelPoint = project3D(0, r, 0);
        ctx.fillStyle = r === rangeMeters ? "#c5ee89" : "#6c7764";
        ctx.font = "9px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${r}m`, labelPoint.sx, labelPoint.sy - 4);
      });

      // 5. Radar Pulse Wave in 3D
      const pulseRadius = wavePulse * rangeMeters;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const theta = (i / 40) * Math.PI * 2;
        const p = project3D(pulseRadius * Math.sin(theta), pulseRadius * Math.cos(theta), 0);
        if (i === 0) ctx.moveTo(p.sx, p.sy);
        else ctx.lineTo(p.sx, p.sy);
      }
      ctx.strokeStyle = `rgba(197, 238, 137, ${(1 - wavePulse) * 0.35})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      // 6. Navigation Line to Selected Grass
      if (selectedSpot) {
        const targetP = project3D(selectedSpot.relX, selectedSpot.relY, 0);
        const originP = project3D(0, 0, 0);

        ctx.beginPath();
        ctx.moveTo(originP.sx, originP.sy);
        ctx.lineTo(targetP.sx, targetP.sy);
        ctx.strokeStyle = "rgba(197, 238, 137, 0.75)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 7. Render Grass Spots (sorted by depth for correct 3D occlusion)
      const renderableSpots = grassSpots
        .map((spot) => {
          const baseP = project3D(spot.relX, spot.relY, 0);
          const topP = project3D(spot.relX, spot.relY, 12);
          return { spot, baseP, topP };
        })
        .sort((a, b) => b.baseP.depth - a.baseP.depth);

      renderableSpots.forEach(({ spot, baseP, topP }) => {
        const isSelected = spot.id === selectedSpotId;
        const canTouch = spot.canTouch;

        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(baseP.sx, baseP.sy, 8, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fill();

        // 3D Stem
        ctx.beginPath();
        ctx.moveTo(baseP.sx, baseP.sy);
        ctx.lineTo(topP.sx, topP.sy);
        ctx.strokeStyle = canTouch ? "#c5ee89" : isSelected ? "#99cc55" : "rgba(197, 238, 137, 0.45)";
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Pin Badge on top
        const pinRadius = canTouch ? 13 : isSelected ? 11 : 8;
        ctx.beginPath();
        ctx.arc(topP.sx, topP.sy, pinRadius, 0, Math.PI * 2);
        ctx.fillStyle = canTouch ? "#c5ee89" : isSelected ? "#1c2a1e" : "#131b14";
        ctx.fill();
        ctx.strokeStyle = canTouch ? "#ffffff" : "#c5ee89";
        ctx.lineWidth = isSelected ? 2 : 1.2;
        ctx.stroke();

        // Grass Icon inside badge
        ctx.fillStyle = canTouch ? "#111611" : "#c5ee89";
        ctx.font = `${pinRadius * 1.1}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🌿", topP.sx, topP.sy);

        // Distance Tag Floating above
        ctx.font = isSelected ? "bold 11px system-ui" : "9px system-ui";
        const tagText = `${spot.name} (${spot.distanceMeters}m)`;
        const textWidth = ctx.measureText(tagText).width;

        ctx.fillStyle = isSelected ? "rgba(20, 30, 20, 0.9)" : "rgba(15, 20, 15, 0.75)";
        ctx.fillRect(topP.sx - textWidth / 2 - 5, topP.sy - pinRadius - 18, textWidth + 10, 16);
        ctx.strokeStyle = isSelected ? "rgba(197, 238, 137, 0.6)" : "rgba(255, 255, 255, 0.1)";
        ctx.strokeRect(topP.sx - textWidth / 2 - 5, topP.sy - pinRadius - 18, textWidth + 10, 16);

        ctx.fillStyle = isSelected ? "#c5ee89" : "#dbe2d4";
        ctx.fillText(tagText, topP.sx, topP.sy - pinRadius - 9);
      });

      // 8. User Center Avatar with Viewing Cone in 3D
      const userP = project3D(0, 0, 0);

      // Translucent Sight Cone pointing where user is facing
      const fovRad = (35 * Math.PI) / 180;
      const userHeadRad = (userHeading * Math.PI) / 180;
      const coneDist = rangeMeters * 0.45;

      const pLeft = project3D(coneDist * Math.sin(userHeadRad - fovRad), coneDist * Math.cos(userHeadRad - fovRad), 0);
      const pRight = project3D(coneDist * Math.sin(userHeadRad + fovRad), coneDist * Math.cos(userHeadRad + fovRad), 0);

      ctx.beginPath();
      ctx.moveTo(userP.sx, userP.sy);
      ctx.lineTo(pLeft.sx, pLeft.sy);
      ctx.arcTo(
        project3D(coneDist * 1.2 * Math.sin(userHeadRad), coneDist * 1.2 * Math.cos(userHeadRad), 0).sx,
        project3D(coneDist * 1.2 * Math.sin(userHeadRad), coneDist * 1.2 * Math.cos(userHeadRad), 0).sy,
        pRight.sx,
        pRight.sy,
        50
      );
      ctx.lineTo(pRight.sx, pRight.sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(197, 238, 137, 0.08)";
      ctx.fill();

      // User Marker
      ctx.beginPath();
      ctx.arc(userP.sx, userP.sy, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#c5ee89";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Directional arrow on user
      const arrowLength = 16;
      const headX = userP.sx + arrowLength * Math.sin(((userHeading - effectiveYaw) * Math.PI) / 180);
      const headY = userP.sy - arrowLength * Math.cos(((userHeading - effectiveYaw) * Math.PI) / 180);

      ctx.beginPath();
      ctx.moveTo(userP.sx, userP.sy);
      ctx.lineTo(headX, headY);
      ctx.strokeStyle = "#121812";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 9. Cardinal Direction Compass Markers (N, E, S, W) on outermost perimeter
      const cardinalDist = rangeMeters * 1.05;
      const cardinals = [
        { label: "N", x: 0, y: cardinalDist, color: "#ff6b6b" },
        { label: "E", x: cardinalDist, y: 0, color: "#c5ee89" },
        { label: "S", x: 0, y: -cardinalDist, color: "#929d8a" },
        { label: "W", x: -cardinalDist, y: 0, color: "#929d8a" },
      ];

      cardinals.forEach(({ label, x, y, color }) => {
        const cp = project3D(x, y, 0);
        ctx.fillStyle = color;
        ctx.font = "bold 12px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, cp.sx, cp.sy);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [viewMode, cameraPitch, cameraYaw, cameraZoom, rangeMeters, grassSpots, selectedSpotId, selectedSpot, userHeading, isCompassLocked]);

  // 6. Interactive 3D Canvas Drag Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    if (isCompassLocked) {
      setIsCompassLocked(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setCameraYaw((prev) => (prev - deltaX * 0.6 + 360) % 360);
    setCameraPitch((prev) => Math.min(80, Math.max(20, prev + deltaY * 0.4)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // 7. Google Maps 3D Integration Loader
  const loadGoogleMapsApi = useCallback(() => {
    const win = window as unknown as { google?: GoogleMapsGlobal };
    if (win.google?.maps) {
      setIsGoogleApiLoaded(true);
      return;
    }
    const key = googleApiKey.trim();
    if (!key) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&v=beta&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleApiLoaded(true);
    script.onerror = () => alert("Could not load Google Maps API. Please check your API key.");
    document.head.appendChild(script);
  }, [googleApiKey]);

  // Initialize and update Google Map 3D
  useEffect(() => {
    if (viewMode !== "google-maps" || !isGoogleApiLoaded || !mapContainerRef.current) return;
    const win = window as unknown as { google?: GoogleMapsGlobal };
    const google = win.google;
    if (!google?.maps) return;

    if (!mapInstanceRef.current) {
      // Create 3D Vector Google Map with tilt and heading
      mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: userCoords.lat, lng: userCoords.lng },
        zoom: Math.max(16, Math.round(21 - Math.log2(rangeMeters / 25))),
        tilt: 65, // 3D Perspective Tilt!
        heading: userHeading || 0, // 3D User Facing Direction!
        mapTypeId: "hybrid",
        mapId: "TOUCH_GRASS_3D",
        disableDefaultUI: false,
        fullscreenControl: true,
      });
    } else {
      mapInstanceRef.current.panTo({ lat: userCoords.lat, lng: userCoords.lng });
      mapInstanceRef.current.setTilt(65);
      mapInstanceRef.current.setHeading(userHeading);
    }

    // Radius Circle
    if (googleCircleRef.current) googleCircleRef.current.setMap(null);
    googleCircleRef.current = new google.maps.Circle({
      strokeColor: "#c5ee89",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#c5ee89",
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
      center: { lat: userCoords.lat, lng: userCoords.lng },
      radius: rangeMeters,
    });

    // Clear old markers
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    // User position marker
    const userMarker = new google.maps.Marker({
      position: { lat: userCoords.lat, lng: userCoords.lng },
      map: mapInstanceRef.current,
      title: "Your GPS Location",
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        rotation: userHeading,
        fillColor: "#ffffff",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#c5ee89",
      },
    });
    googleMarkersRef.current.push(userMarker);

    // Grass spots markers
    grassSpots.forEach((spot) => {
      const isSelected = spot.id === selectedSpotId;
      const marker = new google.maps.Marker({
        position: { lat: spot.lat, lng: spot.lng },
        map: mapInstanceRef.current,
        title: `${spot.name} (${spot.distanceMeters}m)`,
        label: {
          text: spot.canTouch ? "🌿 TOUCH!" : "🌿",
          color: spot.canTouch ? "#111611" : "#c5ee89",
          fontSize: "12px",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 9,
          fillColor: spot.canTouch ? "#c5ee89" : "#172318",
          fillOpacity: 0.9,
          strokeWeight: isSelected ? 2.5 : 1.5,
          strokeColor: "#c5ee89",
        },
      });

      marker.addListener("click", () => {
        setSelectedSpotId(spot.id);
      });

      googleMarkersRef.current.push(marker);
    });
  }, [viewMode, isGoogleApiLoaded, userCoords, userHeading, rangeMeters, grassSpots, selectedSpotId]);

  return (
    <div className="around-me-container">
      {/* Header Banner */}
      <section className="around-me-header">
        <div className="around-me-header-copy">
          <div className="around-me-eyebrow">
            <Icon name="radar" size={14} /> LIVE 3D GPS RADAR
          </div>
          <h1>
            Grass Around <em>Me.</em>
          </h1>
          <p>
            Real-time outdoor 3D spatial field locator. Discover, track, and navigate to touchable
            meadows, moss patches, and wild grass varieties within your selected radius.
          </p>
        </div>

        <div className="around-me-header-actions">
          {/* GPS Connection Indicator */}
          <div className="gps-status-pill">
            <span
              className={`gps-dot ${
                gpsStatus === "active" || gpsStatus === "simulated"
                  ? "active"
                  : gpsStatus === "denied"
                  ? "denied"
                  : ""
              }`}
            />
            <span>
              {gpsStatus === "active"
                ? `GPS Locked (±${gpsAccuracy}m)`
                : gpsStatus === "simulated"
                ? "Simulated Trail Walk"
                : gpsStatus === "denied"
                ? "GPS Access Restricted"
                : "Acquiring GPS Signal..."}
            </span>
          </div>

          <button
            type="button"
            className="walk-dir-btn"
            style={{ width: "100%" }}
            onClick={() => handleSimulateWalk("toward-nearest", 8)}
          >
            🚶 Step 8m Closer to Nearest Grass
          </button>
        </div>
      </section>

      {/* Range Control Card (X meters setting) */}
      <section className="range-control-card">
        <div className="range-control-top">
          <div className="range-label-group">
            <span className="range-title">Detection Radius:</span>
            <span className="range-value-highlight">
              {rangeMeters}
              <span className="range-value-unit">meters</span>
            </span>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
              ({grassSpots.length} grass spot{grassSpots.length === 1 ? "" : "s"} located)
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="range-preset-buttons">
            {[25, 50, 100, 250, 500, 1000, 2000].map((preset) => (
              <button
                key={preset}
                type="button"
                className={`range-preset-btn ${rangeMeters === preset ? "active" : ""}`}
                onClick={() => setRangeMeters(preset)}
              >
                {preset >= 1000 ? `${preset / 1000}km` : `${preset}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider */}
        <div className="range-slider-row">
          <input
            type="range"
            min={20}
            max={2000}
            step={10}
            value={rangeMeters}
            onChange={(e) => setRangeMeters(Number(e.target.value))}
            className="range-slider"
            aria-label="Detection range in meters"
          />
        </div>
        <div className="range-slider-ticks">
          <span>20m (Nearby patch)</span>
          <span>250m (Neighborhood lawn)</span>
          <span>1000m (City park)</span>
          <span>2000m (Trail exploration)</span>
        </div>
      </section>

      {/* View Mode & Google Maps Controls */}
      <section className="view-switch-row">
        <div className="view-mode-pills">
          <button
            type="button"
            className={`view-mode-pill ${viewMode === "3d-space" ? "active" : ""}`}
            onClick={() => setViewMode("3d-space")}
          >
            <Icon name="compass" size={15} /> 3D Spatial Radar
          </button>
          <button
            type="button"
            className={`view-mode-pill ${viewMode === "google-maps" ? "active" : ""}`}
            onClick={() => setViewMode("google-maps")}
          >
            <Icon name="navigation" size={15} /> Google Maps 3D View
          </button>
        </div>

        {viewMode === "google-maps" && !isGoogleApiLoaded && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Enter Google Maps API Key..."
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
              style={{
                height: "36px",
                padding: "0 12px",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                background: "#141b14",
                color: "#eff2ea",
                fontSize: "11px",
              }}
            />
            <button
              type="button"
              className="range-preset-btn active"
              onClick={loadGoogleMapsApi}
            >
              Load Google Map
            </button>
          </div>
        )}
      </section>

      {/* 3D STAGE & RADAR CANVAS */}
      <section className="map-stage-wrapper">
        {viewMode === "3d-space" ? (
          <canvas
            ref={canvasRef}
            className="space-3d-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        ) : (
          <div className="google-map-embed" ref={mapContainerRef}>
            {!isGoogleApiLoaded && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px",
                  textAlign: "center",
                }}
              >
                <Icon name="navigation" size={32} />
                <h3 style={{ marginTop: "12px", color: "#f5f6f0" }}>Google Maps 3D Mode</h3>
                <p style={{ maxWidth: "420px", color: "var(--muted)", fontSize: "12px" }}>
                  To enable live Google Maps 3D vector satellite view, enter your Google Maps API key above or enjoy the built-in 3D Spatial Radar!
                </p>
                <button
                  type="button"
                  className="btn-card-touch"
                  style={{ marginTop: "12px" }}
                  onClick={() => setViewMode("3d-space")}
                >
                  Return to 3D Spatial Radar
                </button>
              </div>
            )}
          </div>
        )}

        {/* HUD Overlay in 3D Space */}
        <div className="stage-hud-overlay">
          <div className="hud-panel">
            <span className="hud-title">GPS Coordinates</span>
            <span className="hud-value">
              {userCoords.lat.toFixed(5)}° N, {userCoords.lng.toFixed(5)}° E
            </span>
            <span style={{ fontSize: "10px", color: "#8b9484" }}>
              Heading: {userHeading}° ({getBearingLabel(userHeading)}) • Speed: {userSpeed} km/h
            </span>
          </div>

          <div className="hud-controls-right">
            <button
              type="button"
              className={`hud-btn ${isCompassLocked ? "active" : ""}`}
              title="Lock/Unlock Compass orientation (auto-rotates as you turn)"
              onClick={() => setIsCompassLocked((prev) => !prev)}
            >
              <Icon name="compass" size={17} />
            </button>
            <button
              type="button"
              className="hud-btn"
              title="Tilt Camera Up"
              onClick={() => setCameraPitch((p) => Math.min(80, p + 10))}
            >
              ▲
            </button>
            <button
              type="button"
              className="hud-btn"
              title="Tilt Camera Down"
              onClick={() => setCameraPitch((p) => Math.max(20, p - 10))}
            >
              ▼
            </button>
            <button
              type="button"
              className="hud-btn"
              title="Zoom In"
              onClick={() => setCameraZoom((z) => Math.min(2.5, z + 0.2))}
            >
              +
            </button>
            <button
              type="button"
              className="hud-btn"
              title="Zoom Out"
              onClick={() => setCameraZoom((z) => Math.max(0.6, z - 0.2))}
            >
              -
            </button>
          </div>
        </div>

        {/* Bottom HUD: Nearest Grass Target & Touch Action */}
        <div className="stage-bottom-hud">
          {selectedSpot && (
            <div className="nearest-guide-pill">
              <Icon name="navigation" size={16} />
              <span>
                Target: <strong>{selectedSpot.name}</strong> •{" "}
                <span className="nearest-distance">{selectedSpot.distanceMeters}m</span> away (
                {selectedSpot.bearingLabel})
              </span>
            </div>
          )}

          {selectedSpot && selectedSpot.canTouch && (
            <button
              type="button"
              className="btn-touch-active"
              onClick={() => handleTouchGrass(selectedSpot)}
            >
              🌿 TOUCH GRASS NOW!
            </button>
          )}
        </div>
      </section>

      {/* Walking Simulation Controller */}
      <section className="walk-sim-controls">
        <div className="walk-sim-label">
          <Icon name="compass" size={15} />
          <span>Walk & Test Movement (Simulate GPS stepping):</span>
        </div>
        <div className="walk-sim-buttons">
          <button type="button" className="walk-dir-btn" onClick={() => handleSimulateWalk("N", 6)}>
            North (+6m)
          </button>
          <button type="button" className="walk-dir-btn" onClick={() => handleSimulateWalk("S", 6)}>
            South (+6m)
          </button>
          <button type="button" className="walk-dir-btn" onClick={() => handleSimulateWalk("E", 6)}>
            East (+6m)
          </button>
          <button type="button" className="walk-dir-btn" onClick={() => handleSimulateWalk("W", 6)}>
            West (+6m)
          </button>
          <button
            type="button"
            className="walk-dir-btn"
            style={{ color: "var(--green)", borderColor: "rgba(197, 238, 137, 0.4)" }}
            onClick={() => handleSimulateWalk("toward-nearest", 10)}
          >
            Walk toward target (+10m)
          </button>
        </div>
      </section>

      {/* Nearby Grass Spots Grid */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontFamily: "var(--heading, Georgia, serif)", fontSize: "20px", color: "#f2f4ec" }}>
            Grass Spots in Your {rangeMeters}m Range
          </h3>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            Click any spot to navigate or touch
          </span>
        </div>

        <div className="nearby-grass-grid">
          {grassSpots.map((spot) => {
            const isSelected = spot.id === selectedSpotId;

            return (
              <article
                key={spot.id}
                className={`grass-spot-card ${isSelected ? "selected" : ""} ${spot.canTouch ? "can-touch" : ""}`}
                onClick={() => setSelectedSpotId(spot.id)}
              >
                <div className="grass-spot-header">
                  <div>
                    <h4 className="grass-spot-name">{spot.name}</h4>
                    <span className="grass-spot-species">{spot.species}</span>
                  </div>
                  <div className="grass-spot-distance-badge">
                    <span className="distance-number">{spot.distanceMeters}m</span>
                    <span className="distance-bearing">{spot.bearingLabel} ({spot.bearing}°)</span>
                  </div>
                </div>

                <div className="grass-spot-meta">
                  <span className="grass-meta-tag">🌿 {spot.biome}</span>
                  <span className="grass-meta-tag">✨ {spot.vibe}</span>
                </div>

                <div className="grass-spot-actions">
                  <span style={{ fontSize: "10px", color: spot.canTouch ? "var(--green)" : "#8a9483", fontWeight: 650 }}>
                    {spot.canTouch ? "🟢 Within reach (≤15m)" : `🚶 ${spot.distanceMeters}m walk`}
                  </span>

                  {spot.canTouch ? (
                    <button
                      type="button"
                      className="btn-card-touch"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTouchGrass(spot);
                      }}
                    >
                      🌿 Touch Grass!
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-card-walk"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSpotId(spot.id);
                        handleSimulateWalk("toward-nearest", 10);
                      }}
                    >
                      Walk +10m
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Proof of Touch Certificate Modal */}
      {activeTouchModal && (
        <div className="touch-modal-backdrop" onClick={() => setActiveTouchModal(null)}>
          <div className="touch-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="touch-modal-icon">
              <Icon name="sprout" size={42} />
            </div>
            <h2>You Touched Grass!</h2>
            <p>
              Congratulations! You stepped outside, navigated with GPS, and successfully touched real grass in the wild.
            </p>

            <div className="touch-certificate-box">
              <div className="cert-row">
                <span>Location / Name:</span>
                <strong>{activeTouchModal.spotName}</strong>
              </div>
              <div className="cert-row">
                <span>Botanical Species:</span>
                <strong>{activeTouchModal.species}</strong>
              </div>
              <div className="cert-row">
                <span>Touch Proximity:</span>
                <strong>{activeTouchModal.distanceMeters} meters (Direct contact)</strong>
              </div>
              <div className="cert-row">
                <span>Timestamp:</span>
                <strong>{activeTouchModal.timestamp}</strong>
              </div>
              <div className="cert-row">
                <span>GPS Coordinates:</span>
                <strong>
                  {activeTouchModal.lat.toFixed(5)}°, {activeTouchModal.lng.toFixed(5)}°
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="btn-cert-done"
              onClick={() => setActiveTouchModal(null)}
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
