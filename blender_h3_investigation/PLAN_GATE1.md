# Blender/H3 Director — Gate 1: Environment Inspection and Implementation Plan

- **Date:** 2026-11-16 · **Author:** Claude Code (cloud session) · **Status: STOPPED at approval gate.** I did not reconstruct, install, download, run any GPU job, or change H3 Director.
- **Labels used in this document:** **VERIFIED** = I observed it this session. **RECORDED** = stated in a dated Knowledge_OS document in Dropbox (not re-checked). **UNVERIFIED** = not confirmed. **PROPOSED** = design only.

---

## 0. Blocking finding: this session cannot reach the workstation

This session runs in an Anthropic cloud container (Linux), not on the RTX 5090 workstation.

- **VERIFIED:** `C:\AI\...` is not reachable. No Remote Control folders are registered for this session (`list_computer_folders` returned an empty list). The container has no Blender and no `nvidia-smi`.
- **Consequences:**
  - I could not read `C:\AI\projects\blender_h3_investigation\QWEN_BLENDER_INVESTIGATION.md`. A Dropbox search for it, and for anything named "blender", returned nothing.
  - I could not inspect installed software directly. The inventory in §2 comes from dated Dropbox records.
  - I could not write to `C:\AI\projects\blender_h3_investigation\`. This plan sits in the session's git branch (`claude/blender-h3-director-prototype-14cf65`, folder `blender_h3_investigation/`) and should move to the workstation path.

**What I could use:**
- Dropbox `/Knowledge_OS`, which holds the earlier SceneIR/Qwen benchmark reports, H3 Director documentation and inventory notes.
- Public web search.

## 1. Dropbox reference image: located, but it doesn't match the specification. Not retrieved.

| Item | Specified | Found in Dropbox (VERIFIED via the Dropbox API) |
|---|---|---|
| Folder | `Subject_001` | `/Knowledge_OS/Projects/Assets/Subjects/Subject_001` (the only item in the folder) |
| Filename | `Reference_A_form.PNG` | **`Reference_A_form.jpg`** |
| Size | ~2 MB | **101,165 bytes (~99 KB)** |
| Uploaded | — | client_modified 2026-11-16T04:59:40Z, server 05:00:09Z |
| Dropbox file id | — | `id:U7O7Y5RK140AAAAAAABHjw` |
| Dropbox `content_hash` | — | `7260248a539280c19af87e30d72d136c7a8201685e584e8756c143cd8dbad2a2` |

- A filename-only search for `Reference_A_form.PNG` returned **0 results**. A broader search for `Reference_A_form` returned only the `.jpg`.
- **Interpretation (UNVERIFIED):** the `.jpg` may be a compressed export of the original PNG, since a ~20× size reduction is typical of PNG→JPEG conversion. I cannot confirm this. Your instruction was not to substitute a different image, so I have **not treated this file as the approved reference**.
- **Retrieval failed:** the temporary download link points at `*.dl.dropboxusercontent.com`, and this session's network proxy refused it (`CONNECT tunnel failed, 403`). I have no local copy and no SHA-256 of my own.
- The Dropbox `content_hash` above is the file's own block-hash checksum. Once the bytes are downloaded, recompute it to verify an exact copy (it is the SHA-256 of the concatenated SHA-256 values of each 4 MiB block).
- I have **not viewed the image**, so I cannot confirm its content (adult female, pose, framing).

**Decision needed (see §7, item A1):** either upload the original PNG, or confirm that the 99 KB JPG is the intended reference.

## 2. Software inventory

The workstation was not inspected this session (§0). The table records what dated Knowledge_OS records say.

| Component | State | Source |
|---|---|---|
| RTX 5090 | 32,607 MiB total; host RAM ~30.9 GiB. Host RAM fell to 4.6 GB free during the 4B Qwen benchmark | RECORDED: `VACE_PREFLIGHT.md` (2026-11-10), `CLAUDE_P2_4B_FULL_BENCHMARK_RESULT.md` (2026-11-01) |
| ComfyUI | 0.34.0, in Docker container `ai-h3`; models at `C:/AI/comfyui/models` | RECORDED: VACE preflight, BFS evaluation (2026-11-13) |
| H3 Director | `C:\AI\H3_Director_Evaluator\director_app`, served at `127.0.0.1:8765`; includes `gpu_handoff.py` and a `gpu_gate` used by other tools | RECORDED: `Projects/H3_Director/README.md` (verified 2026-10-24), BFS evaluation |
| H3 modes in Director | T2VA, I2VA and **Ref2VA** (`MiniMaxH3ReferenceToVideo`, 1–9 images) are available. Ref2VA accepts up to 3 video references per capabilities, but **end-to-end rendering with a video reference is unverified**. FL2VA/L2VA are not exposed | RECORDED: `H3_PROMPT_COMPLIANCE_CHECKLIST.md` (2026-10-25) |
| Prompt Composer | Real adapter wired but `REAL_ADAPTER_ENABLED = False` | RECORDED: 14B evaluation (2026-11-01) |
| Qwen LLMs | Huihui Qwen3-4B-Instruct-2507 abliterated Q8_0 (~7 GB VRAM) and Huihui Qwen3-14B-abliterated-v2 Q4_K_M (~10 GB), served by `llama-server` b12032 with a GPU gate before and after | RECORDED: benchmark reports |
| Qwen image models | Qwen-Image-Edit-2511 fp8, Qwen2.5-VL-7B fp8 (text encoder) | RECORDED: BFS evaluation |
| Character identity | Klein 4B + BFS head-swap V1 recommended; Character Generator integration not started | RECORDED: BFS evaluation |
| **Blender / Blender Python** | **Unknown.** No record found | — |
| **SAM 3D Body** | **Unknown. Presumed absent** (no record) | — |
| **MakeHuman / MPFB 2** | **Unknown.** No record | — |
| Character rigging tools | **Unknown** | — |
| ffmpeg / ffprobe | Used in earlier reports; host versus container location unverified | RECORDED (indirectly) |

The first step after access (§7, A2) is a read-only inventory script that confirms or corrects every row above.

### 2.1 SAM 3D Body: compatibility facts (public sources; not yet tested locally)

- SAM 3D Body's output representation is Meta's **Momentum Human Rig (MHR)**, not SMPL/SMPL-X ([MHR project page](https://facebookresearch.github.io/MHR)). A secondary summary describes the MHR skeleton as a 127-joint hierarchy ([emergentmind summary](https://api.emergentmind.com/topics/momentum-human-rig-mhr)); I have not checked this against the MHR source.
- I found **no first-party FBX/Blender export**. FBX export exists only through community tools that call Blender, such as the ComfyUI-SAM3DBody "Export FBX" node ([RunComfy node page](https://www.runcomfy.com/comfyui-nodes/ComfyUI-SAM3DBody/sam3d-body-export-fbx)) and a hobbyist MHR→FBX/SMPL-X pipeline ([portfolio write-up](https://timothybunker.github.io/TimBunkerPortfolio/projects/video-mocap-pipeline/)). A hosted endpoint returns GLB+PLY meshes ([fal.ai](https://fal.ai/models/fal-ai/sam-3/3d-body)).
- **Conclusion:** the MHR rig is **not** directly compatible with MPFB 2's rigs. Its joint names, joint count, rest pose and skin weights all differ. Any route that keeps the MHR skeleton needs retargeting. Routes through SMPL-X carry the SMPL-X model licence (non-commercial by default), which must be checked before any commercial use.
- **To verify on the workstation:** SAM 3D Body's own licence, its checkpoint access terms (gated or not), VRAM use, and the exact output files.

### 2.2 H3 motion conditioning: not established

- **RECORDED:** Director's Ref2VA accepts video references, but no one has rendered with one end to end.
- **Official guide (RECORDED copy in Dropbox):** `<Video N>` in the reference guide means "editing source, continuation start, or whole-video structure". Visible people and actions from a reference video are written as `<Subject N>`. Camera, cut or rhythm-only video use counts as `reference generation`. The guide does **not** document pose-accurate motion transfer from a reference video.
- **Web search, third-party only:** pages mention an "H3 Fun Control" (depth/pose) ComfyUI workflow ([RunComfy listing](https://www.runcomfy.com/comfyui-workflows/minimax-h3-fun-control-in-comfyui-depth-and-pose-video)) and a ComfyUI docs page on "minimax-h3-fun-controlnet". `docs.comfy.org` is blocked from this session, so I **could not read the official node documentation**, and I don't know whether any control model is installed.
- **Conclusion:** consistent with your warning, the existing first/last-frame workflow should not be assumed to do motion conditioning. Ref2VA with a `<Video 1>` reference may give only loose motion adherence. A pose/depth-control route, if one exists for H3 and can be installed, would give tighter adherence. Blender can export depth and pose passes for free. Which route works must be settled from the **installed** ComfyUI node source and a single approved test render (§6, §7).

## 3. SAM 3D Body → rigged Blender character: integration strategy

### Options

| Route | Description | Rig quality / editability | Main risks |
|---|---|---|---|
| **R1 (recommended): measurements → MPFB 2** | Run SAM 3D Body once on the reference. Measure the MHR mesh in rest pose (stature; shoulder, chest, waist and hip widths; limb segment lengths; head size). A deterministic fitter sets MPFB 2 macro/proportion modifiers to minimise the measurement error. MPFB 2 then generates the mesh and its native rig (default or game-engine skeleton plus IK). | High. A Blender-native rig, clean topology and standard bone names, which the action library can target reliably | Proportions are approximate, bounded by MPFB's modifier space. The fit is reported as per-measurement error |
| R2: MHR mesh + MHR skeleton → Blender | Import the community FBX, keep the MHR skin and skeleton, and map 127 joints to the action-library joint names | Medium. A non-standard rig; skin weights depend on export quality | No first-party exporter; MHR licence; heavy retarget map; mesh topology unsuited to clothing |
| R3: MHR → SMPL-X → SMPL-X Blender add-on | Convert parameters, then use the SMPL-X add-on rig | Medium–high | SMPL-X licence (non-commercial unless licensed); two conversion stages |

**Recommendation: R1, keeping the R2 mesh as a validation overlay only.** The imported MHR mesh sits in a hidden collection. A Blender check reports silhouette and landmark deviation between the MPFB character and the reconstruction, so the fit is measured rather than assumed.

**Appearance:** the Blender character is a neutral, untextured proxy in a patient gown with a clinical drape sheet. That reflects standard examination practice, and the motion reference needs no anatomical detail. H3 takes appearance from the original image.

### R1 pipeline (deterministic steps; Qwen involvement only where marked)

1. `subject.ingest`: copy the image from Dropbox and record its checksum in `assets/subjects/subject_001/SOURCE.json`. **(A)**
2. `sam3d.reconstruct`: one GPU job producing MHR parameters and mesh (`.ply`/`.glb`) plus a JSON record. **(A; needs approval)**
3. `measure.mhr`: put the mesh in rest pose and compute the named measurements. **(A)**
4. `mpfb.fit`: bounded least-squares over MPFB modifiers, giving a fit report with per-measurement error. **(A)**
5. `mpfb.build`: generate the character, add the rig and IK, then add landmark empties (heels, ischial region proxy, knees, hands, head) parented to bones. **(A)**
6. `character.validate`: check rig bone names against the schema's joint map, the IK chains, the measurement report and the overlay deviation. **(A)**

Qwen's role here is limited to choosing a subject asset and asking for clarification when there are several candidates. Steps 2–6 contain no reasoning that needs a model.

## 4. Proposed JSON scene/action schema

The full draft is in `schema/scene_edit.schema.json`. The design rules follow directly from the Qwen benchmark failures (§8):

1. **Qwen never outputs coordinates, rotations or code.** It selects from an enum of operations and fills only **IDs that exist in the current scene snapshot**, plus bounded qualitative or relative parameters (`"raise"`, a delta in a stated unit with a range, a named pose). A Blender solver computes all geometry.
2. **No free-text fields reach the executor.** A `rationale` string may be logged but is never executed. (In the 14B evaluation, free-text fields were the main failure surface.)
3. **Locks:** any approved property (camera, lighting, a pose keyframe range, an object transform) can be locked. The validator rejects an edit that touches a locked path, unless the edit names that lock and the user explicitly unlocks it.
4. **Versioning:** every accepted edit produces `scene_vNNN.blend` plus `scene_vNNN.state.json` (a canonical snapshot) and a diff. Earlier versions are never overwritten.
5. **Clarification is a first-class output:** `{"kind":"clarify","question":...,"options":[...]}` is a valid response and is expected when a reference doesn't resolve.

### Core vocabulary (v0.1; extensible via namespaced registries)

| Category | Entries (initial) |
|---|---|
| Joints / landmarks | Canonical names (`pelvis`, `spine_02`, `thigh_l`, `calf_l`, `foot_l`, `heel_l`, `toe_l`, `hand_r` …) mapped per rig in `rigs/<rig_id>.jointmap.json`. Clinical landmark namespace `clin.*`, reserved for later procedural actions |
| Poses (`pose.*`) | `stand_neutral`, `sit_edge`, `sit_upright`, `recline_supported`, `lithotomy_low`, `lithotomy_standard`, `hands_on_table_edge`, `hands_rest_abdomen` |
| Object affordances | `table.seat_surface`, `table.backrest` (angle prop), `table.foot_end_edge`, `stirrup_l/r.heel_cup` (height, angle, abduction props), `drape.attach_points` |
| Operations | `set_object_prop`, `adjust_object_prop`, `apply_pose`, `move_to_affordance`, `place_contact` (body landmark → affordance, with a solver), `add_motion_beat`, `retime_beat`, `ease_beat`, `camera_set_shot`, `camera_move`, `lock`, `unlock_request`, `render_preview`, `clarify` |
| Constraints | `contact(landmark, affordance, tolerance_mm)`, `above(a,b)`, `no_penetration(a,b)`, `within_rom(joint)` (range-of-motion limits) |
| Timing | Beats with `start_frame`, `end_frame`, an easing enum and dependencies; frames at 24 fps |

### Example: your correction request, as Qwen would be expected to output it

```json
{
  "schema": "h3d.scene_edit/0.1",
  "base_version": "v003",
  "edits": [
    {"op": "adjust_object_prop", "target": "stirrup_l", "prop": "height", "direction": "raise", "solve_for": "contact_feasible"},
    {"op": "adjust_object_prop", "target": "stirrup_r", "prop": "height", "direction": "raise", "solve_for": "contact_feasible"},
    {"op": "place_contact", "landmark": "heel_l", "affordance": "stirrup_l.heel_cup", "beats": ["B3", "B4"], "tolerance_mm": 10},
    {"op": "place_contact", "landmark": "heel_r", "affordance": "stirrup_r.heel_cup", "beats": ["B4"], "tolerance_mm": 10}
  ],
  "preserve": ["camera.*", "lighting.*", "character.pose[B1,B2]", "room.*", "table.*"],
  "rationale": "user: feet not resting correctly; raise supports; do not change camera or anything else"
}
```

Blender then:
- solves the stirrup height that gives a feasible contact within range of motion;
- re-solves the leg IK targets;
- re-bakes keys only in B3–B4;
- verifies contact distance, penetration and a hash of the preserved paths;
- renders the preview.

If no feasible height exists, the result is `REJECTED: INFEASIBLE_CONTACT` with measured values, not a silent approximation.

## 5. Plan for the first five-second animation

5 s at 24 fps is 120 frames. Clinical framing: patient in gown, drape over lap, examiner not present in v1. Camera: fixed medium-wide three-quarter view from the foot-end side, at a respectful framing, then locked.

| Beat | Frames | Action | Mechanism |
|---|---|---|---|
| B1 | 1–30 | Seated at the foot-end edge, hands on the table edge, settling | `pose.sit_edge`; pelvis keyed on `table.seat_surface` |
| B2 | 31–60 | Slides back slightly and reclines onto the inclined backrest, supported by her arms | Pelvis path along the seat surface; spine keyed toward `pose.recline_supported`; hand contacts |
| B3 | 61–90 | Lifts left leg; heel settles into the left stirrup cup | Leg IK target blends from a free arc to a Child-Of constraint on `stirrup_l.heel_cup` (influence keyed) |
| B4 | 91–120 | Right leg follows; both feet settle; slight weight shift; hold | Same as B3 for the right side; final pose `pose.lithotomy_low` |

**Build steps, all deterministic Blender Python inside the project folder:**
1. **Room:** a procedural exam room (walls, floor, cabinet, lamp, sink counter, soft clinical lighting). The geometry is parameterised and kept simple, which is enough for a motion reference.
2. **Exam table:** a procedural model with a backrest angle property and two articulated stirrup assemblies. Height, angle and abduction are custom properties driving the transforms through drivers, so they can be edited in the Blender UI and by operations.
3. **Character:** from §3 (R1). If SAM 3D Body or MPFB 2 is not approved, the fallback is an MPFB default female adult. That fallback needs your separate approval, per your instruction.
4. **Animation:** IK rig, pose library actions, beat timeline, contact constraints and the contact solver. NLA strips per beat, so a correction re-bakes only the affected strips.
5. **Validation:** per-frame contact distances, penetration test (BVH overlap), joint range of motion, foot slip during contact (≤ 5 mm), and a hash of locked paths. The output is a `validation_vNNN.json` file.
6. **Preview:** an EEVEE render at 1280×720/24 fps → MP4 (ffmpeg), plus optional depth and pose passes for H3 control. The `.blend` file is kept per version.

## 6. H3 handoff design (not executed)

**Render manifest (`h3_manifest_vNNN.json`), prepared by Qwen and validated by code:**
- `approved_scene_version` and hashes of the `.blend`, preview MP4 and state JSON;
- `appearance_ref`: the original subject image path and SHA-256;
- `motion_ref`: the preview MP4, plus depth/pose pass paths if a control route is confirmed;
- `workflow`: the official template's filename and SHA-256, the node IDs to fill, the checkpoint and LoRA list (preserving Director's Anti-Burn LoRA and brightness settings as recorded), seed, resolution and length;
- `prompt`: a Ref2VA six-section prompt built from **verified scene data** (beats, camera and objects from the state JSON), checked against the official reference guide and the compliance checklist. Qwen fills only the narrative slots; a template supplies the structure.

**GPU sequence, reusing existing mechanisms:**
1. Qwen finishes the manifest.
2. A validator passes it, and a manifest hash is written.
3. `llama-server` is terminated.
4. The existing GPU gate confirms release (as in the benchmarks, for example "released to 1,611 MiB").
5. Director's `gpu_gate`/`gpu_handoff` checks that ComfyUI is idle.
6. ComfyUI `/free` runs if needed.
7. H3 loads and runs the manifest.

The handoff script imports these modules **read-only**, as the BFS runner did. Director is not modified.

**Before any H3 render:** read the installed ComfyUI source for `MiniMaxH3ReferenceToVideo` and any H3 control node, and list the installed control checkpoints, if any. Then run **one** approved short test comparing (a) Ref2VA with `<Video 1>` against (b) a control route, if available.

## 7. Approvals requested

**A. Access and inputs (no GPU)**
- **A1. Reference image.** Upload `Reference_A_form.PNG` to `Subject_001`, or confirm that `Reference_A_form.jpg` (101,165 B, content_hash `7260248a…d2a2`) is the approved reference.
- **A2. Execution location.** Either run the implementation in Claude Code **on the workstation**, or register `C:\AI\projects\blender_h3_investigation` (and read-only `C:\AI\H3_Director_Evaluator`) as a Remote Control folder for a cloud session. Without one of these, nothing in §3–§6 can run.
- **A3.** A read-only inventory script on the workstation (checks Blender, Python, MPFB, SAM 3D Body, ComfyUI nodes/models, ffmpeg, GPU and RAM). No installs.

**B. Installations / downloads (only if A3 shows them missing)**
- **B1.** Blender (current LTS supported by MPFB 2; version decided from A3 and MPFB release notes) and ffmpeg if absent.
- **B2.** MPFB 2 extension plus the MakeHuman system asset pack.
- **B3.** SAM 3D Body code and checkpoints, plus MHR assets, in an isolated Python environment. This requires you to accept Meta's licence and any gated-access terms yourself.
- **B4 (optional, R2 overlay only).** A community MHR→FBX exporter. I would read its source before running it.

**C. GPU runs**
- **C1.** One SAM 3D Body inference on the approved reference image (single job, VRAM and RAM logged, through the GPU gate).
- **C2.** EEVEE preview renders of each scene version (light GPU use).
- **C3.** A Qwen3-4B correction benchmark: about 12 scripted instructions × 1 run, with a GPU gate before and after (see §8).
- **C4 (later, separate approval).** One short H3 test render to settle the motion-conditioning route. **No final H3 video.**

**Not requested:** changes to H3 Director, new services, model weights other than B3, or 14B/30B runs.

## 8. Qwen delegation assessment

### Evidence base (RECORDED)
- **4B, SceneIR P2, frozen 10 scenes:** 1/10 scenes passed and 45/81 items matched. Main failures: over-enumerating entities (70 selected), mention spans crossing predicates, role errors (patient vs target, swapped references), and **no clarification behaviour**. When confined to code-owned clauses it made **0 errors** there. Latency was ~2.9 s per call.
- **14B Q4:** 0/10. It added field-drift errors (placeholders in free-text fields), was slower, and **"the evidence points away from model size as the blocking factor"**.
- **Implication for this project:** Qwen is reliable only when it selects from a **small, closed, scene-grounded candidate set**. Scene editing suits this better than open prose extraction: the candidate objects and landmarks are exactly those in the scene snapshot (perhaps 10–30 IDs), and operations are an enum of about 15. This is a hypothesis to test (C3), not a demonstrated capability.

### Delegation matrix

| # | Production task | Proposed Qwen responsibility | Deterministic tools / APIs | Validation | Existing evidence | Confidence | Model | Fallback |
|---|---|---|---|---|---|---|---|---|
| 1 | Interpret instruction → scene plan | Map the request to a beat list and op enums; ask a question when ambiguous | Schema-constrained decoding (grammar), scene snapshot | Schema + scene-ID existence + lock check | 4B poor at open extraction; no clarification seen | Low–medium | 4B (grammar) | Ask the user to pick from validator-generated options |
| 2 | Select subject asset, required objects | Choose from the asset registry | Asset registry JSON | ID exists; hash matches | None | Medium | 4B | User selects |
| 3 | Invoke SAM 3D Body | None needed (fixed step) | `sam3d.reconstruct` | Output files + checksums | — | n/a | **A: code** | — |
| 4 | Rigging and character prep | None (fixed pipeline) | `mpfb.fit/build`, `character.validate` | Fit report, jointmap check | — | n/a | **A: code** | Claude Code debugging (C) |
| 5 | Create / modify Blender scene | Select ops + IDs only | Executor (op registry → bpy) | Pre- and post-validation, locked-path hashes | — | Medium (hypothesis) | 4B | Reject; return the error to Qwen once; then the user |
| 6 | Choose poses/movements from the lexicon | Choose a pose or beat enum | Pose library, IK/contact solver | ROM, contact, penetration | — | Medium | 4B | Default beat template |
| 7 | Coordinate timing, camera, interactions | Order beats; choose camera shot enums | Beat scheduler, camera presets | Timeline consistency checks | 14B made beat-order errors; 4B phased correctly once | Low–medium | 4B | Code default timing |
| 8 | Inspect metadata and previews | Read the **validator report** (text) and state the problem in op terms | `validation_vNNN.json` | Matches measured values | VLM preview critique untested | Low (vision) / medium (report) | 4B text; VLM test deferred | User describes the problem |
| 9 | Conversational corrections preserving approvals | Emit a delta edit with `preserve` | Locks, NLA re-bake by beat, diff | Locked hashes unchanged; contact met | None | Medium (hypothesis, C3) | 4B → 14B only if 4B fails C3 | Reject + clarify |
| 10 | H3 workflow selection, prompt, manifest | Fill narrative slots in a Ref2VA template from the state JSON | Manifest builder, compliance checker | Official guide structure + hashes | Prompt Composer real adapter disabled; earlier prose leak issues | Low–medium | 4B with template | Code-only template prompt |
| 11 | Qwen→H3 GPU handoff | **None.** Never a model decision | `gpu_gate`, `gpu_handoff`, llama-server stop | VRAM release measured | Gate PASS recorded in benchmarks | High (code) | **A: code** | Abort and report |

### Automation boundaries
- **A, deterministic code:** ingest, checksums, reconstruction, measurement, MPFB fit/build, geometry solving, validation, rendering, versioning, manifest hashing and GPU handoff.
- **B, Qwen-directed:** instruction → op selection, pose/beat selection, correction deltas, clarification questions, prompt narrative slots.
- **C, Claude Code engineering (now):** schema, executor, solvers, room/table/stirrup generators, the MPFB fitter, validators, the H3 manifest builder and the benchmark. Each becomes A or B once it passes its tests.

### Proposed measurable test (C3), before trusting Qwen with category B
- **Test set:** 12 frozen instructions against a frozen scene snapshot, with gold op lists. The set includes 3 deliberately ambiguous instructions, 2 that request changes to locked items, and 2 that reference non-existent objects.
- **Metrics:** exact op match, invented IDs (target 0), lock violations reaching the executor (must be 0, enforced by code), correct clarification on ambiguous items (≥ 2/3), and latency.
- **Pass threshold (PROPOSED):** ≥ 10/12 exact, 0 invented IDs. If it fails: tighten the candidate set or grammar, then re-run once on 4B. Run the 14B only after that.

## 9. Effort and principal obstacles

**Effort (estimates, low confidence until A3 is known):** about 8–11 working sessions in total.

| Phase | Work | Sessions |
|---|---|---|
| Access + inventory | A3 | 0.5 |
| Room + table + stirrups | Procedural, property-driven | 1 |
| Character | SAM→MPFB fit, rig validation | 1.5–2 |
| Animation | IK/contact solver, beats, validation, preview | 1.5–2 |
| Edit engine | Schema, executor, locks, versions, diff | 2 |
| Qwen director | Grammar, prompt, C3 benchmark | 1–2 |
| H3 | Manifest + handoff (no render) | 1 |

**Principal obstacles:**
1. **No workstation access from this session** (A2). Every later step depends on it.
2. **The reference image doesn't match the specification** (A1).
3. **MHR vs MPFB rig incompatibility:** mitigated by R1. Proportion fidelity is limited to the MPFB modifier space.
4. **Contact-accurate leg placement:** stirrup geometry, IK and range of motion must agree. The solver must report infeasibility rather than force poses.
5. **Qwen reliability:** prior evidence is weak. The design confines Qwen to closed selections, and C3 measures the result.
6. **H3 motion adherence is unestablished:** neither Ref2VA video references nor any control route has been verified on this installation.
7. **Host RAM (30.9 GiB):** Blender, Qwen and ComfyUI must not all run at once. The handoff sequence enforces this.
8. **Licensing:** SAM 3D Body and MHR terms, and SMPL-X if R3 is ever used, need your review for a commercial training product.
