// Valid football positions
export const VALID_POSITIONS = [
  'GK',  // Goalkeeper / Portero / ผู้รักษาประตู
  'CB',  // Center Back / Defensa Central / กองหลังกลาง
  'LB',  // Left Back / Lateral Izquierdo / แบ็คซ้าย
  'RB',  // Right Back / Lateral Derecho / แบ็คขวา
  'CDM', // Defensive Mid / Pivote / กองกลางตัวรับ
  'CM',  // Center Mid / Mediocentro / กองกลาง
  'CAM', // Attacking Mid / Mediapunta / กองกลางตัวรุก
  'LM',  // Left Mid / Volante Izq / มิดซ้าย
  'RM',  // Right Mid / Volante Der / มิดขวา
  'LW',  // Left Wing / Extremo Izq / ปีกซ้าย
  'RW',  // Right Wing / Extremo Der / ปีกขวา
  'ST',  // Striker / Delantero / กองหน้า
  'CF',  // Center Forward / Centro Delantero / กองหน้าตัวเป้า
  'DEF', // Generic Defender / Defensa / กองหลัง
  'MID', // Generic Midfielder / Medio / กองกลาง
  'FWD', // Generic Forward / Delantero / กองหน้า
] as const;

export type ValidPosition = typeof VALID_POSITIONS[number];

export function isValidPosition(pos: string): pos is ValidPosition {
  return VALID_POSITIONS.includes(pos.toUpperCase() as ValidPosition);
}

// Position translations for each language
export const POSITION_NAMES: Record<string, Record<string, string>> = {
  en: {
    GK: 'Goalkeeper', CB: 'Center Back', LB: 'Left Back', RB: 'Right Back',
    CDM: 'Defensive Mid', CM: 'Center Mid', CAM: 'Attacking Mid',
    LM: 'Left Mid', RM: 'Right Mid', LW: 'Left Wing', RW: 'Right Wing',
    ST: 'Striker', CF: 'Center Forward', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward',
  },
  es: {
    GK: 'Portero', CB: 'Defensa Central', LB: 'Lat. Izquierdo', RB: 'Lat. Derecho',
    CDM: 'Pivote', CM: 'Mediocentro', CAM: 'Mediapunta',
    LM: 'Volante Izq.', RM: 'Volante Der.', LW: 'Extremo Izq.', RW: 'Extremo Der.',
    ST: 'Delantero', CF: 'Centro Delantero', DEF: 'Defensa', MID: 'Medio', FWD: 'Delantero',
  },
  th: {
    GK: 'ผู้รักษาประตู', CB: 'กองหลังกลาง', LB: 'แบ็คซ้าย', RB: 'แบ็คขวา',
    CDM: 'กองกลางตัวรับ', CM: 'กองกลาง', CAM: 'กองกลางตัวรุก',
    LM: 'มิดซ้าย', RM: 'มิดขวา', LW: 'ปีกซ้าย', RW: 'ปีกขวา',
    ST: 'กองหน้า', CF: 'กองหน้าตัวเป้า', DEF: 'กองหลัง', MID: 'กองกลาง', FWD: 'กองหน้า',
  },
};

export function getPositionName(pos: string, lang: 'en' | 'es' | 'th' = 'en'): string {
  return POSITION_NAMES[lang]?.[pos.toUpperCase()] || pos.toUpperCase();
}
