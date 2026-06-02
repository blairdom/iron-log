export interface SlotSet {
  reps: number;
  weight: number;
  unit: "lbs" | "kg" | "bw";
}

export interface Slot {
  id: string;
  bodyPart: string;
  subTarget: string;
  movementPattern: string;
  selectedExerciseId: string;
  optional?: boolean;
  defaultSets: SlotSet[];
  restSeconds: number; // rest between sets, preset in Program tab
}

export interface Section {
  id: string;
  name: string;
  slots: Slot[];
}

export interface DayTemplate {
  key: string;
  label: string;
  name: string;
  scheduled: boolean;
  sections: Section[];
}

// Helpers for concise slot definitions
const sets = (n: number, reps: number, weight = 0, unit: "lbs" | "kg" | "bw" = "lbs"): SlotSet[] =>
  Array(n).fill(null).map(() => ({ reps, weight, unit }));
const R = { heavy: 120, light: 90, iso: 60, mobility: 45 };

export const DEFAULT_PROGRAM: DayTemplate[] = [
  {
    key: "mon", label: "MON", name: "PUSH", scheduled: true,
    sections: [
      {
        id: "mon-s1", name: "Main Lifts", slots: [
          { id: "mon-s1-1", bodyPart: "Chest", subTarget: "Upper Chest", movementPattern: "Horizontal Push", selectedExerciseId: "ex-001", defaultSets: sets(3, 10), restSeconds: R.heavy },
          { id: "mon-s1-2", bodyPart: "Chest", subTarget: "Mid Chest",   movementPattern: "Horizontal Push", selectedExerciseId: "ex-003", defaultSets: sets(3, 10), restSeconds: R.heavy },
          { id: "mon-s1-3", bodyPart: "Chest", subTarget: "Lower Chest", movementPattern: "Horizontal Push", selectedExerciseId: "ex-005", defaultSets: sets(3, 10, 0, "bw"), restSeconds: R.heavy },
        ]
      },
      {
        id: "mon-s2", name: "Shoulders", slots: [
          { id: "mon-s2-1", bodyPart: "Shoulders", subTarget: "Front/Side Delt", movementPattern: "Vertical Push", selectedExerciseId: "ex-019", defaultSets: sets(3, 10), restSeconds: R.heavy },
          { id: "mon-s2-2", bodyPart: "Shoulders", subTarget: "Side Delt",       movementPattern: "Isolation",    selectedExerciseId: "ex-022", defaultSets: sets(3, 12), restSeconds: R.iso },
        ]
      },
      {
        id: "mon-s3", name: "Triceps", slots: [
          { id: "mon-s3-1", bodyPart: "Triceps", subTarget: "Long Head", movementPattern: "Isolation", selectedExerciseId: "ex-042", defaultSets: sets(3, 12), restSeconds: R.iso },
        ]
      },
      {
        id: "mon-s4", name: "Accessories", slots: [
          { id: "mon-s4-1", bodyPart: "Chest", subTarget: "Upper Chest", movementPattern: "Horizontal Push", selectedExerciseId: "ex-006", optional: true, defaultSets: sets(3, 12), restSeconds: R.iso },
        ]
      },
    ]
  },
  {
    key: "tue", label: "TUE", name: "MOBILITY + KB + Z2", scheduled: true,
    sections: [
      {
        id: "tue-s1", name: "Kettlebells", slots: [
          { id: "tue-s1-1", bodyPart: "Legs",      subTarget: "Glutes",            movementPattern: "Hip Hinge", selectedExerciseId: "ex-033", defaultSets: sets(3, 15, 0, "bw"), restSeconds: R.light },
          { id: "tue-s1-2", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation",  selectedExerciseId: "ex-052", defaultSets: sets(3, 10, 0, "bw"), restSeconds: R.mobility },
          { id: "tue-s1-3", bodyPart: "Legs",      subTarget: "Quads",             movementPattern: "Squat",     selectedExerciseId: "ex-027", defaultSets: sets(3, 12, 0, "bw"), restSeconds: R.light },
        ]
      },
      {
        id: "tue-s2", name: "Mobility", slots: [
          { id: "tue-s2-1", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation", selectedExerciseId: "ex-053", defaultSets: sets(2, 10, 0, "bw"), restSeconds: R.mobility },
          { id: "tue-s2-2", bodyPart: "Legs",      subTarget: "Hip Mobility",      movementPattern: "Squat",    selectedExerciseId: "ex-054", defaultSets: sets(2, 10, 0, "bw"), restSeconds: R.mobility },
        ]
      },
    ]
  },
  {
    key: "wed", label: "WED", name: "PULL", scheduled: true,
    sections: [
      {
        id: "wed-s1", name: "Main Lifts", slots: [
          { id: "wed-s1-1", bodyPart: "Back", subTarget: "Upper Back", movementPattern: "Vertical Pull",   selectedExerciseId: "ex-012", defaultSets: sets(3, 8, 0, "bw"), restSeconds: R.heavy },
          { id: "wed-s1-2", bodyPart: "Back", subTarget: "Lats",       movementPattern: "Horizontal Pull", selectedExerciseId: "ex-015", defaultSets: sets(3, 10), restSeconds: R.heavy },
          { id: "wed-s1-3", bodyPart: "Back", subTarget: "Upper Back", movementPattern: "Horizontal Pull", selectedExerciseId: "ex-016", defaultSets: sets(3, 10), restSeconds: R.light },
        ]
      },
      {
        id: "wed-s2", name: "Biceps", slots: [
          { id: "wed-s2-1", bodyPart: "Biceps", subTarget: "Long Head Bicep", movementPattern: "Isolation", selectedExerciseId: "ex-048", defaultSets: sets(3, 12), restSeconds: R.iso },
          { id: "wed-s2-2", bodyPart: "Biceps", subTarget: "Brachialis",      movementPattern: "Isolation", selectedExerciseId: "ex-049", defaultSets: sets(3, 12), restSeconds: R.iso },
        ]
      },
      {
        id: "wed-s3", name: "Rear Delts", slots: [
          { id: "wed-s3-1", bodyPart: "Shoulders", subTarget: "Rear Delt", movementPattern: "Isolation", selectedExerciseId: "ex-023", defaultSets: sets(3, 15), restSeconds: R.iso },
        ]
      },
    ]
  },
  {
    key: "thu", label: "THU", name: "MOBILITY + RECOVERY", scheduled: true,
    sections: [
      {
        id: "thu-s1", name: "Mobility", slots: [
          { id: "thu-s1-1", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation", selectedExerciseId: "ex-052", defaultSets: sets(3, 10, 0, "bw"), restSeconds: R.mobility },
          { id: "thu-s1-2", bodyPart: "Legs",      subTarget: "Hip Mobility",      movementPattern: "Squat",   selectedExerciseId: "ex-054", defaultSets: sets(2, 10, 0, "bw"), restSeconds: R.mobility },
          { id: "thu-s1-3", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation", selectedExerciseId: "ex-053", defaultSets: sets(3, 10, 0, "bw"), restSeconds: R.mobility },
        ]
      },
    ]
  },
  {
    key: "fri", label: "FRI", name: "LEGS + CORE", scheduled: true,
    sections: [
      {
        id: "fri-s1", name: "Main Lifts", slots: [
          { id: "fri-s1-1", bodyPart: "Legs", subTarget: "Quads",      movementPattern: "Squat",     selectedExerciseId: "ex-025", defaultSets: sets(3, 10), restSeconds: R.heavy },
          { id: "fri-s1-2", bodyPart: "Legs", subTarget: "Quads",      movementPattern: "Lunge",     selectedExerciseId: "ex-026", defaultSets: sets(3, 10), restSeconds: R.light },
          { id: "fri-s1-3", bodyPart: "Legs", subTarget: "Hamstrings", movementPattern: "Hip Hinge", selectedExerciseId: "ex-031", defaultSets: sets(3, 10), restSeconds: R.heavy },
        ]
      },
      {
        id: "fri-s2", name: "Core", slots: [
          { id: "fri-s2-1", bodyPart: "Core", subTarget: "Lower Abs",         movementPattern: "Flexion",    selectedExerciseId: "ex-035", defaultSets: sets(3, 10, 0, "bw"), restSeconds: R.iso },
          { id: "fri-s2-2", bodyPart: "Core", subTarget: "Obliques",          movementPattern: "Rotation",   selectedExerciseId: "ex-038", defaultSets: sets(3, 10, 0, "bw"), restSeconds: R.iso },
          { id: "fri-s2-3", bodyPart: "Core", subTarget: "Core (Transverse)", movementPattern: "Extension",  selectedExerciseId: "ex-040", defaultSets: sets(3, 30, 0, "bw"), restSeconds: R.iso },
        ]
      },
    ]
  },
  {
    key: "sat", label: "SAT", name: "ACTIVE RECOVERY", scheduled: false,
    sections: []
  },
  {
    key: "sun", label: "SUN", name: "REST", scheduled: false,
    sections: []
  },
];
