// Entrada separada só para a prévia de vozes, para não mexer no Root.tsx:
//   npx remotion render src/roteiros/previavozes/index_previavozes.ts PreviaVozes out/PreviaVozes_hq.mp4
import React from "react";
import { registerRoot } from "remotion";
import { PreviaVozesComposition } from "./PreviaVozes";

registerRoot(() => React.createElement(PreviaVozesComposition));
