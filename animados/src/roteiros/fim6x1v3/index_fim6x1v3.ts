// Entrada separada só para o Fim6x1v3, para não mexer no Root.tsx:
//   npx remotion render src/roteiros/fim6x1v3/index_fim6x1v3.ts Fim6x1v3 out/Fim6x1v3_hq.mp4
import React from "react";
import { registerRoot } from "remotion";
import { Fim6x1v3Composition } from "./Fim6x1v3";

registerRoot(() => React.createElement(Fim6x1v3Composition));
