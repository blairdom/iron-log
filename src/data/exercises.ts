export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  subTarget: string;
  movementPattern: string;
  equipmentRequired: string[];
  benchPosition: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  type: "Compound" | "Isolation";
}

export const EXERCISES: Exercise[] = [
  // CHEST — Horizontal Push
  { id: "ex-001", name: "Incline Dumbbell Press", bodyPart: "Chest", subTarget: "Upper Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Incline (30°)", difficulty: "Beginner", type: "Compound" },
  { id: "ex-002", name: "Incline Dumbbell Press (45°)", bodyPart: "Chest", subTarget: "Upper Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Incline (45°)", difficulty: "Beginner", type: "Compound" },
  { id: "ex-003", name: "Flat Dumbbell Press", bodyPart: "Chest", subTarget: "Mid Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Flat", difficulty: "Beginner", type: "Compound" },
  { id: "ex-004", name: "Dumbbell Squeeze Press", bodyPart: "Chest", subTarget: "Mid Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Flat", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-005", name: "Dips (Chest-Focused)", bodyPart: "Chest", subTarget: "Lower Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Dip Station"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-006", name: "Incline Dumbbell Fly", bodyPart: "Chest", subTarget: "Upper Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Incline (30°)", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-007", name: "Flat Dumbbell Fly", bodyPart: "Chest", subTarget: "Mid Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Flat", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-008", name: "Push-Ups", bodyPart: "Chest", subTarget: "Mid Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Bodyweight"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-009", name: "Decline Push-Ups (Feet on Box)", bodyPart: "Chest", subTarget: "Upper Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Plyo Box", "Bodyweight"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-010", name: "Kettlebell Floor Press", bodyPart: "Chest", subTarget: "Mid Chest", movementPattern: "Horizontal Push", equipmentRequired: ["Kettlebells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  // BACK — Vertical Pull
  { id: "ex-011", name: "Chin-Ups (Supinated)", bodyPart: "Back", subTarget: "Lats", movementPattern: "Vertical Pull", equipmentRequired: ["Chin-Up Bar"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-012", name: "Pull-Ups (Pronated)", bodyPart: "Back", subTarget: "Upper Back", movementPattern: "Vertical Pull", equipmentRequired: ["Chin-Up Bar"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-013", name: "Neutral Grip Pull-Ups", bodyPart: "Back", subTarget: "Lats", movementPattern: "Vertical Pull", equipmentRequired: ["Chin-Up Bar"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-014", name: "Hanging Knee Raises", bodyPart: "Core", subTarget: "Lower Abs", movementPattern: "Flexion", equipmentRequired: ["Chin-Up Bar"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  // BACK — Horizontal Pull
  { id: "ex-015", name: "Dumbbell Row (Single Arm)", bodyPart: "Back", subTarget: "Lats", movementPattern: "Horizontal Pull", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Flat", difficulty: "Beginner", type: "Compound" },
  { id: "ex-016", name: "Chest-Supported Dumbbell Row", bodyPart: "Back", subTarget: "Upper Back", movementPattern: "Horizontal Pull", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Incline (30°)", difficulty: "Beginner", type: "Compound" },
  { id: "ex-017", name: "Renegade Rows", bodyPart: "Back", subTarget: "Lats", movementPattern: "Horizontal Pull", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-018", name: "Kettlebell Row", bodyPart: "Back", subTarget: "Lats", movementPattern: "Horizontal Pull", equipmentRequired: ["Kettlebells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  // SHOULDERS — Vertical Push
  { id: "ex-019", name: "Seated Dumbbell Overhead Press", bodyPart: "Shoulders", subTarget: "Front/Side Delt", movementPattern: "Vertical Push", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Upright (90°)", difficulty: "Beginner", type: "Compound" },
  { id: "ex-020", name: "Arnold Press", bodyPart: "Shoulders", subTarget: "Front/Side Delt", movementPattern: "Vertical Push", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Upright (90°)", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-021", name: "Kettlebell Press", bodyPart: "Shoulders", subTarget: "Front Delt", movementPattern: "Vertical Push", equipmentRequired: ["Kettlebells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  // SHOULDERS — Isolation
  { id: "ex-022", name: "Dumbbell Lateral Raise", bodyPart: "Shoulders", subTarget: "Side Delt", movementPattern: "Isolation", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-023", name: "Incline Dumbbell Reverse Fly", bodyPart: "Shoulders", subTarget: "Rear Delt", movementPattern: "Isolation", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Incline (30°)", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-024", name: "Dumbbell Front Raise", bodyPart: "Shoulders", subTarget: "Front Delt", movementPattern: "Isolation", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  // LEGS — Squat/Lunge
  { id: "ex-025", name: "Dumbbell Goblet Squat", bodyPart: "Legs", subTarget: "Quads", movementPattern: "Squat", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-026", name: "Dumbbell Bulgarian Split Squat", bodyPart: "Legs", subTarget: "Quads", movementPattern: "Lunge", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-027", name: "Kettlebell Goblet Squat", bodyPart: "Legs", subTarget: "Quads", movementPattern: "Squat", equipmentRequired: ["Kettlebells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-028", name: "Dumbbell Walking Lunge", bodyPart: "Legs", subTarget: "Quads", movementPattern: "Lunge", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-029", name: "Box Step-Ups", bodyPart: "Legs", subTarget: "Quads", movementPattern: "Lunge", equipmentRequired: ["Dumbbells", "Plyo Box"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-030", name: "Pistol Squat (Box-Assisted)", bodyPart: "Legs", subTarget: "Quads", movementPattern: "Squat", equipmentRequired: ["Plyo Box", "Bodyweight"], benchPosition: "N/A", difficulty: "Advanced", type: "Compound" },
  // LEGS — Hip Hinge
  { id: "ex-031", name: "Dumbbell Romanian Deadlift", bodyPart: "Legs", subTarget: "Hamstrings", movementPattern: "Hip Hinge", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-032", name: "Single-Leg Dumbbell RDL", bodyPart: "Legs", subTarget: "Hamstrings", movementPattern: "Hip Hinge", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-033", name: "Kettlebell Swing", bodyPart: "Legs", subTarget: "Glutes", movementPattern: "Hip Hinge", equipmentRequired: ["Kettlebells"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-034", name: "Kettlebell Deadlift", bodyPart: "Legs", subTarget: "Hamstrings", movementPattern: "Hip Hinge", equipmentRequired: ["Kettlebells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  // CORE
  { id: "ex-035", name: "Hanging Leg Raise", bodyPart: "Core", subTarget: "Lower Abs", movementPattern: "Flexion", equipmentRequired: ["Ab Straps"], benchPosition: "N/A", difficulty: "Intermediate", type: "Isolation" },
  { id: "ex-036", name: "Hanging Knee Raise", bodyPart: "Core", subTarget: "Lower Abs", movementPattern: "Flexion", equipmentRequired: ["Ab Straps"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-037", name: "Dumbbell Side Bend", bodyPart: "Core", subTarget: "Obliques", movementPattern: "Rotation", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-038", name: "Mace 360", bodyPart: "Core", subTarget: "Obliques", movementPattern: "Rotation", equipmentRequired: ["Mace"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  { id: "ex-039", name: "Mace 10-to-2", bodyPart: "Core", subTarget: "Core", movementPattern: "Rotation", equipmentRequired: ["Mace"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-040", name: "Plank", bodyPart: "Core", subTarget: "Core (Transverse)", movementPattern: "Extension", equipmentRequired: ["Bodyweight"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-041", name: "Dead Bug", bodyPart: "Core", subTarget: "Core (Transverse)", movementPattern: "Extension", equipmentRequired: ["Bodyweight"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  // TRICEPS
  { id: "ex-042", name: "Dumbbell Overhead Tricep Extension", bodyPart: "Triceps", subTarget: "Long Head", movementPattern: "Isolation", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Upright (90°)", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-043", name: "Dumbbell Kickback", bodyPart: "Triceps", subTarget: "Lateral Head", movementPattern: "Isolation", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-044", name: "Dumbbell Skull Crusher", bodyPart: "Triceps", subTarget: "Long Head", movementPattern: "Isolation", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Flat", difficulty: "Intermediate", type: "Isolation" },
  { id: "ex-045", name: "Bench Dips", bodyPart: "Triceps", subTarget: "Triceps", movementPattern: "Isolation", equipmentRequired: ["Bench", "Bodyweight"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-046", name: "Dips (Tricep-Focused)", bodyPart: "Triceps", subTarget: "Triceps", movementPattern: "Isolation", equipmentRequired: ["Dip Station"], benchPosition: "N/A", difficulty: "Intermediate", type: "Compound" },
  // BICEPS
  { id: "ex-047", name: "Dumbbell Curl", bodyPart: "Biceps", subTarget: "Biceps", movementPattern: "Isolation", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-048", name: "Incline Dumbbell Curl", bodyPart: "Biceps", subTarget: "Long Head Bicep", movementPattern: "Isolation", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Incline (45°)", difficulty: "Intermediate", type: "Isolation" },
  { id: "ex-049", name: "Hammer Curl", bodyPart: "Biceps", subTarget: "Brachialis", movementPattern: "Isolation", equipmentRequired: ["Dumbbells"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-050", name: "Concentration Curl", bodyPart: "Biceps", subTarget: "Bicep Peak", movementPattern: "Isolation", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  { id: "ex-051", name: "Kettlebell Curl", bodyPart: "Biceps", subTarget: "Biceps", movementPattern: "Isolation", equipmentRequired: ["Kettlebells"], benchPosition: "N/A", difficulty: "Beginner", type: "Isolation" },
  // MOBILITY / RECOVERY
  { id: "ex-052", name: "Kettlebell Halo", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation", equipmentRequired: ["Kettlebells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-053", name: "Mace 360 (Light)", bodyPart: "Shoulders", subTarget: "Shoulder Mobility", movementPattern: "Rotation", equipmentRequired: ["Mace"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-054", name: "Kettlebell Goblet Squat Hold", bodyPart: "Legs", subTarget: "Hip Mobility", movementPattern: "Squat", equipmentRequired: ["Kettlebells"], benchPosition: "N/A", difficulty: "Beginner", type: "Compound" },
  { id: "ex-055", name: "Dumbbell Pullover", bodyPart: "Back", subTarget: "Lats", movementPattern: "Vertical Pull", equipmentRequired: ["Dumbbells", "Bench"], benchPosition: "Flat", difficulty: "Intermediate", type: "Compound" },
];

export function getExercisesForSlot(bodyPart: string, movementPattern: string): Exercise[] {
  return EXERCISES.filter(e =>
    e.bodyPart === bodyPart ||
    e.movementPattern === movementPattern
  );
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}
