export interface Slot {
  id: string;
  bodyPart: string;
  subTarget: string;
  movementPattern: string;
  selectedExerciseId: string;
  optional?: boolean;
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

export const DEFAULT_PROGRAM: DayTemplate[] = [
  {
    key: "mon", label: "MON", name: "PUSH", scheduled: true,
    sections: [
      {
        id: "mon-s1", name: "Main Lifts", slots: [
          { id: "mon-s1-1", bodyPart: "Chest", subTarget: "Upper Chest", movementPattern: "Horizontal Push", selectedExerciseId: "ex-001" },
          { id: "mon-s1-2", bodyPart: "Chest", subTarget: "Mid Chest", movementPattern: "Horizontal Push", selectedExerciseId: "ex-003" },
          { id: "mon-s1-3", bodyPart: "Chest", subTarget: "Lower Chest", movementPattern: "Horizontal Push", selectedExerciseId: "ex-005" },
        ]
      },
      {
        id: "mon-s2", name: "Shoulders", slots: [
          { id: "mon-s2-1", bodyPart: "Shoulders", subTarget: "Front/Side Delt", movementPattern: "Vertical Push", selectedExerciseId: "ex-019" },
          { id: "mon-s2-2", bodyPart: "Shoulders", subTarget: "Side Delt", movementPattern: "Isolation", selectedExerciseId: "ex-022" },
        ]
      },
      {
        id: "mon-s3", name: "Triceps", slots: [
          { id: "mon-s3-1", bodyPart: "Triceps", subTarget: "Long Head", movementPattern: "Isolation", selectedExerciseId: "ex-042" },
        ]
      },
      {
        id: "mon-s4", name: "Accessories", slots: [
          { id: "mon-s4-1", bodyPart: "Chest", subTarget: "Upper Chest", movementPattern: "Horizontal Push", selectedExerciseId: "ex-006", optional: true },
        ]
      },
    ]
  },
  {
    key: "tue", label: "TUE", name: "MOBILITY + KB + Z2", scheduled: true,
    sections: [
      {
        id: "tue-s1", name: "Kettlebells", slots: [
          { id: "tue-s1-1", bodyPart: "Legs", subTarget: "Glutes", movementPattern: "Hip Hinge", selectedExerciseId: "ex-033" },
          { id: "tue-s1-2", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation", selectedExerciseId: "ex-052" },
          { id: "tue-s1-3", bodyPart: "Legs", subTarget: "Quads", movementPattern: "Squat", selectedExerciseId: "ex-027" },
        ]
      },
      {
        id: "tue-s2", name: "Mobility", slots: [
          { id: "tue-s2-1", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation", selectedExerciseId: "ex-053" },
          { id: "tue-s2-2", bodyPart: "Legs", subTarget: "Hip Mobility", movementPattern: "Squat", selectedExerciseId: "ex-054" },
        ]
      },
    ]
  },
  {
    key: "wed", label: "WED", name: "PULL", scheduled: true,
    sections: [
      {
        id: "wed-s1", name: "Main Lifts", slots: [
          { id: "wed-s1-1", bodyPart: "Back", subTarget: "Upper Back", movementPattern: "Vertical Pull", selectedExerciseId: "ex-012" },
          { id: "wed-s1-2", bodyPart: "Back", subTarget: "Lats", movementPattern: "Horizontal Pull", selectedExerciseId: "ex-015" },
          { id: "wed-s1-3", bodyPart: "Back", subTarget: "Upper Back", movementPattern: "Horizontal Pull", selectedExerciseId: "ex-016" },
        ]
      },
      {
        id: "wed-s2", name: "Biceps", slots: [
          { id: "wed-s2-1", bodyPart: "Biceps", subTarget: "Long Head Bicep", movementPattern: "Isolation", selectedExerciseId: "ex-048" },
          { id: "wed-s2-2", bodyPart: "Biceps", subTarget: "Brachialis", movementPattern: "Isolation", selectedExerciseId: "ex-049" },
        ]
      },
      {
        id: "wed-s3", name: "Rear Delts", slots: [
          { id: "wed-s3-1", bodyPart: "Shoulders", subTarget: "Rear Delt", movementPattern: "Isolation", selectedExerciseId: "ex-023" },
        ]
      },
    ]
  },
  {
    key: "thu", label: "THU", name: "MOBILITY + RECOVERY", scheduled: true,
    sections: [
      {
        id: "thu-s1", name: "Mobility", slots: [
          { id: "thu-s1-1", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation", selectedExerciseId: "ex-052" },
          { id: "thu-s1-2", bodyPart: "Legs", subTarget: "Hip Mobility", movementPattern: "Squat", selectedExerciseId: "ex-054" },
          { id: "thu-s1-3", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation", selectedExerciseId: "ex-053" },
        ]
      },
    ]
  },
  {
    key: "fri", label: "FRI", name: "LEGS + CORE", scheduled: true,
    sections: [
      {
        id: "fri-s1", name: "Main Lifts", slots: [
          { id: "fri-s1-1", bodyPart: "Legs", subTarget: "Quads", movementPattern: "Squat", selectedExerciseId: "ex-025" },
          { id: "fri-s1-2", bodyPart: "Legs", subTarget: "Quads", movementPattern: "Lunge", selectedExerciseId: "ex-026" },
          { id: "fri-s1-3", bodyPart: "Legs", subTarget: "Hamstrings", movementPattern: "Hip Hinge", selectedExerciseId: "ex-031" },
        ]
      },
      {
        id: "fri-s2", name: "Core", slots: [
          { id: "fri-s2-1", bodyPart: "Core", subTarget: "Lower Abs", movementPattern: "Flexion", selectedExerciseId: "ex-035" },
          { id: "fri-s2-2", bodyPart: "Core", subTarget: "Obliques", movementPattern: "Rotation", selectedExerciseId: "ex-038" },
          { id: "fri-s2-3", bodyPart: "Core", subTarget: "Core (Transverse)", movementPattern: "Extension", selectedExerciseId: "ex-040" },
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
