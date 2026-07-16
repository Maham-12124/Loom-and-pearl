"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  BeadFinish,
  BeadOption,
  CharmOption,
  DesignState,
  PackagingOptionData,
  WristSize,
  WRIST_SIZE_BEAD_COUNT,
  makeDefaultBeads,
} from "@/types/customizer";
import { calculatePrice, resizeBeads } from "@/lib/design";
import { generateAlternate, generateOmbre, symmetricIndex } from "@/lib/color-utils";

interface CustomizerContextValue {
  design: DesignState;
  activeBeadIndex: number | null;
  setActiveBeadIndex: (index: number | null) => void;

  beadOptions: BeadOption[];
  charmOptions: CharmOption[];
  packagingOptions: PackagingOptionData[];

  price: { base: number; beads: number; charm: number; packaging: number; total: number };

  setWristSize: (size: WristSize) => void;
  setBeadAt: (index: number, beadId: string, hexCode: string, finish: BeadFinish) => void;
  applySolid: (beadId: string, hexCode: string, finish: BeadFinish) => void;
  applyAlternate: (
    a: { beadId: string; hexCode: string; finish: BeadFinish },
    b: { beadId: string; hexCode: string; finish: BeadFinish }
  ) => void;
  applyOmbre: (startHex: string, endHex: string, finish: BeadFinish) => void;
  applyPalette: (beads: { hexCode: string; finish: BeadFinish }[]) => void;
  toggleSymmetry: () => void;
  setCharm: (charmId: string | null) => void;
  setPackagingId: (packagingId: string | null) => void;
  setGiftNote: (note: string) => void;
  loadDesign: (design: DesignState) => void;
}

const CustomizerContext = createContext<CustomizerContextValue | null>(null);

export function CustomizerProvider({
  children,
  beadOptions,
  charmOptions,
  packagingOptions,
  initialDesign,
}: {
  children: ReactNode;
  beadOptions: BeadOption[];
  charmOptions: CharmOption[];
  packagingOptions: PackagingOptionData[];
  initialDesign?: Partial<DesignState>;
}) {
  const [design, setDesign] = useState<DesignState>(() => {
    const wristSize = initialDesign?.wristSize ?? "MEDIUM";
    const count = WRIST_SIZE_BEAD_COUNT[wristSize];
    const beads = initialDesign?.beads
      ? resizeBeads(initialDesign.beads, count)
      : makeDefaultBeads(count);
    return {
      wristSize,
      beads,
      charmId: initialDesign?.charmId ?? null,
      symmetryEnabled: initialDesign?.symmetryEnabled ?? false,
      packaging: initialDesign?.packaging ?? { packagingId: null, note: "" },
    };
  });

  const [activeBeadIndex, setActiveBeadIndex] = useState<number | null>(0);

  const setWristSize = useCallback((size: WristSize) => {
    setDesign((prev) => ({
      ...prev,
      wristSize: size,
      beads: resizeBeads(prev.beads, WRIST_SIZE_BEAD_COUNT[size]),
    }));
    setActiveBeadIndex(0);
  }, []);

  const setBeadAt = useCallback(
    (index: number, beadId: string, hexCode: string, finish: BeadFinish) => {
      setDesign((prev) => {
        const beads = [...prev.beads];
        beads[index] = { beadId, hexCode, finish };
        if (prev.symmetryEnabled) {
          const mirror = symmetricIndex(index, beads.length);
          if (mirror !== index) beads[mirror] = { beadId, hexCode, finish };
        }
        return { ...prev, beads };
      });
    },
    []
  );

  const applySolid = useCallback((beadId: string, hexCode: string, finish: BeadFinish) => {
    setDesign((prev) => ({
      ...prev,
      beads: prev.beads.map(() => ({ beadId, hexCode, finish })),
    }));
  }, []);

  const applyAlternate = useCallback(
    (
      a: { beadId: string; hexCode: string; finish: BeadFinish },
      b: { beadId: string; hexCode: string; finish: BeadFinish }
    ) => {
      setDesign((prev) => {
        const hexes = generateAlternate(a.hexCode, b.hexCode, prev.beads.length);
        return {
          ...prev,
          beads: hexes.map((hex, i) =>
            i % 2 === 0
              ? { beadId: a.beadId, hexCode: hex, finish: a.finish }
              : { beadId: b.beadId, hexCode: hex, finish: b.finish }
          ),
        };
      });
    },
    []
  );

  const applyOmbre = useCallback((startHex: string, endHex: string, finish: BeadFinish) => {
    setDesign((prev) => {
      const hexes = generateOmbre(startHex, endHex, prev.beads.length);
      return {
        ...prev,
        beads: hexes.map((hex) => ({ beadId: null, hexCode: hex, finish })),
      };
    });
  }, []);

  const applyPalette = useCallback((beads: { hexCode: string; finish: BeadFinish }[]) => {
    setDesign((prev) => ({
      ...prev,
      beads: prev.beads.map((_, i) => {
        const source = beads[i % beads.length];
        return { beadId: null, hexCode: source.hexCode, finish: source.finish };
      }),
    }));
  }, []);

  const toggleSymmetry = useCallback(() => {
    setDesign((prev) => ({ ...prev, symmetryEnabled: !prev.symmetryEnabled }));
  }, []);

  const setCharm = useCallback((charmId: string | null) => {
    setDesign((prev) => ({ ...prev, charmId }));
  }, []);

  const setPackagingId = useCallback((packagingId: string | null) => {
    setDesign((prev) => ({ ...prev, packaging: { ...prev.packaging, packagingId } }));
  }, []);

  const setGiftNote = useCallback((note: string) => {
    setDesign((prev) => ({ ...prev, packaging: { ...prev.packaging, note } }));
  }, []);

  const loadDesign = useCallback((next: DesignState) => {
    setDesign(next);
    setActiveBeadIndex(null);
  }, []);

  const price = useMemo(
    () => calculatePrice(design, beadOptions, charmOptions, packagingOptions),
    [design, beadOptions, charmOptions, packagingOptions]
  );

  const value: CustomizerContextValue = {
    design,
    activeBeadIndex,
    setActiveBeadIndex,
    beadOptions,
    charmOptions,
    packagingOptions,
    price,
    setWristSize,
    setBeadAt,
    applySolid,
    applyAlternate,
    applyOmbre,
    applyPalette,
    toggleSymmetry,
    setCharm,
    setPackagingId,
    setGiftNote,
    loadDesign,
  };

  return (
    <CustomizerContext.Provider value={value}>{children}</CustomizerContext.Provider>
  );
}

export function useCustomizer() {
  const ctx = useContext(CustomizerContext);
  if (!ctx) throw new Error("useCustomizer must be used within a CustomizerProvider");
  return ctx;
}
