/* =========================================================
   Aura Fitness — data layer
   Stands in for AuraFitnessContext + AuthService + WorkoutService
   + RoutineService + ProgressService, backed by localStorage.
   Everything here is synchronous and runs entirely client-side.
   ========================================================= */

const AuraDB = (() => {

  const STORE_KEY = 'auraFitnessDB';
  const SESSION_KEY = 'auraFitnessSession';

  // ---------- low-level store ----------

  function load() {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
    const fresh = seedData();
    localStorage.setItem(STORE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function save(db) {
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
  }

  function nextId(list) {
    return list.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
  }

  // simple non-cryptographic hash — this is a client-only demo,
  // mirrors where AuthService's SHA256 hashing plugs in
  function hashPassword(pw) {
    let h = 5381;
    for (let i = 0; i < pw.length; i++) {
      h = ((h << 5) + h) + pw.charCodeAt(i);
      h |= 0;
    }
    return 'h' + Math.abs(h).toString(16) + pw.length;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // ---------- seed data ----------

  function seedData() {
    const exercises = [
      { id: 1, name: 'Dumbbell Goblet Squat', category: 'Strength', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Dumbbells', caloriesPerSet: 6, icon: 'squat', description: 'A gentle entry into squatting patterns that builds leg and core control.',
        steps: ['Stand with feet shoulder-width apart, chest up, core braced.', 'Send your hips back and bend your knees to lower into the squat.', 'Keep your weight in your heels and your knees tracking over your toes.', 'Drive through your feet to stand back up to the starting position.', 'Repeat for the prescribed reps, resetting your brace each time.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 2, name: 'Barbell Back Squat', category: 'Strength', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', caloriesPerSet: 8, icon: 'squat', description: 'A compound lower-body lift that builds leg and core strength.',
        steps: ['Stand with feet shoulder-width apart, chest up, core braced.', 'Send your hips back and bend your knees to lower into the squat.', 'Keep your weight in your heels and your knees tracking over your toes.', 'Drive through your feet to stand back up to the starting position.', 'Repeat for the prescribed reps, resetting your brace each time.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 3, name: 'Barbell Front Squat', category: 'Strength', muscleGroup: 'Legs', difficulty: 'Advanced', equipment: 'Barbell', caloriesPerSet: 10, icon: 'squat', description: 'A demanding front-loaded squat variant that hammers quads and core stability.',
        steps: ['Stand with feet shoulder-width apart, chest up, core braced.', 'Send your hips back and bend your knees to lower into the squat.', 'Keep your weight in your heels and your knees tracking over your toes.', 'Drive through your feet to stand back up to the starting position.', 'Repeat for the prescribed reps, resetting your brace each time.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 4, name: 'Brisk Walking Intervals', category: 'Cardio', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'None', caloriesPerSet: 8, icon: 'run', description: 'An easy walk-jog interval that eases you into cardio training.',
        steps: ['Warm up with 3–5 minutes of easy walking.', 'Settle into a pace you can sustain for the full interval or distance.', 'Keep your posture tall, shoulders relaxed, and breathing rhythmic.', 'Land lightly and let your arms swing naturally with each stride.', 'Cool down with a few minutes of easy walking to bring your heart rate down.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 5, name: 'Steady-State Jogging', category: 'Cardio', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'None', caloriesPerSet: 10, icon: 'run', description: 'A steady aerobic effort that builds your endurance base.',
        steps: ['Warm up with 3–5 minutes of easy walking.', 'Settle into a pace you can sustain for the full interval or distance.', 'Keep your posture tall, shoulders relaxed, and breathing rhythmic.', 'Land lightly and let your arms swing naturally with each stride.', 'Cool down with a few minutes of easy walking to bring your heart rate down.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 6, name: 'Sprint Intervals', category: 'Cardio', muscleGroup: 'Legs', difficulty: 'Advanced', equipment: 'None', caloriesPerSet: 12, icon: 'run', description: 'All-out sprint efforts for serious cardiovascular and speed gains.',
        steps: ['Warm up with 3–5 minutes of easy walking.', 'Settle into a pace you can sustain for the full interval or distance.', 'Keep your posture tall, shoulders relaxed, and breathing rhythmic.', 'Land lightly and let your arms swing naturally with each stride.', 'Cool down with a few minutes of easy walking to bring your heart rate down.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 7, name: 'Basic Bodyweight Circuit', category: 'HIIT', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 10, icon: 'jump', description: 'Short bodyweight bursts with rest, perfect for a first interval session.',
        steps: ['Warm up for 3–5 minutes to raise your heart rate gradually.', 'Perform the work interval at maximum sustainable effort.', 'Focus on clean form even as fatigue sets in.', 'Rest or move at low intensity for the prescribed recovery period.', 'Repeat the work/rest cycle for the set number of rounds.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 8, name: 'Tabata Burpees', category: 'HIIT', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Bodyweight', caloriesPerSet: 12, icon: 'jump', description: 'Classic 20-on/10-off burpee intervals that spike your heart rate fast.',
        steps: ['Warm up for 3–5 minutes to raise your heart rate gradually.', 'Perform the work interval at maximum sustainable effort.', 'Focus on clean form even as fatigue sets in.', 'Rest or move at low intensity for the prescribed recovery period.', 'Repeat the work/rest cycle for the set number of rounds.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 9, name: 'Sprint-and-Sled HIIT Circuit', category: 'HIIT', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'Sled', caloriesPerSet: 14, icon: 'jump', description: 'A brutal mixed-modal circuit for athletes chasing peak conditioning.',
        steps: ['Warm up for 3–5 minutes to raise your heart rate gradually.', 'Perform the work interval at maximum sustainable effort.', 'Focus on clean form even as fatigue sets in.', 'Rest or move at low intensity for the prescribed recovery period.', 'Repeat the work/rest cycle for the set number of rounds.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 10, name: 'Air Squat & Push-Up EMOM', category: 'CrossFit', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 9, icon: 'lift', description: 'A simple every-minute-on-the-minute intro to CrossFit-style training.',
        steps: ['Review the movement standards for each exercise in the workout.', 'Warm up each movement pattern with light-load or scaled reps.', 'Pace the first round conservatively to gauge your effort.', 'Move efficiently between exercises, keeping transitions short.', 'Record your score (time, rounds, or reps) to track progress next time.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 11, name: 'AMRAP: Pull-Up, Push-Up, Squat', category: 'CrossFit', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Pull-up Bar', caloriesPerSet: 11, icon: 'lift', description: 'A classic named benchmark workout — as many rounds as possible.',
        steps: ['Review the movement standards for each exercise in the workout.', 'Warm up each movement pattern with light-load or scaled reps.', 'Pace the first round conservatively to gauge your effort.', 'Move efficiently between exercises, keeping transitions short.', 'Record your score (time, rounds, or reps) to track progress next time.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 12, name: 'Clean and Jerk WOD', category: 'CrossFit', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'Barbell', caloriesPerSet: 13, icon: 'lift', description: 'A high-skill barbell WOD combining strength and explosive power.',
        steps: ['Review the movement standards for each exercise in the workout.', 'Warm up each movement pattern with light-load or scaled reps.', 'Pace the first round conservatively to gauge your effort.', 'Move efficiently between exercises, keeping transitions short.', 'Record your score (time, rounds, or reps) to track progress next time.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 13, name: 'Machine Chest Press', category: 'Bodybuilding', muscleGroup: 'Chest', difficulty: 'Beginner', equipment: 'Machine', caloriesPerSet: 5, icon: 'press', description: 'A joint-friendly machine press that isolates the chest safely.',
        steps: ['Set up with your shoulder blades pulled back and down.', 'Grip the bar, handles, or dumbbells at shoulder width.', 'Lower the weight under control until your elbows reach about 90 degrees.', 'Press back up to full extension without locking out aggressively.', 'Complete all reps with a controlled tempo, then rack the weight safely.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 14, name: 'Dumbbell Bench Press', category: 'Bodybuilding', muscleGroup: 'Chest', difficulty: 'Intermediate', equipment: 'Dumbbells', caloriesPerSet: 7, icon: 'press', description: 'A staple free-weight press for building chest size and strength.',
        steps: ['Set up with your shoulder blades pulled back and down.', 'Grip the bar, handles, or dumbbells at shoulder width.', 'Lower the weight under control until your elbows reach about 90 degrees.', 'Press back up to full extension without locking out aggressively.', 'Complete all reps with a controlled tempo, then rack the weight safely.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 15, name: 'Barbell Incline Bench Press', category: 'Bodybuilding', muscleGroup: 'Chest', difficulty: 'Advanced', equipment: 'Barbell', caloriesPerSet: 9, icon: 'press', description: 'A heavier incline press that targets the upper chest hard.',
        steps: ['Set up with your shoulder blades pulled back and down.', 'Grip the bar, handles, or dumbbells at shoulder width.', 'Lower the weight under control until your elbows reach about 90 degrees.', 'Press back up to full extension without locking out aggressively.', 'Complete all reps with a controlled tempo, then rack the weight safely.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 16, name: 'Box Squat', category: 'Powerlifting', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Barbell', caloriesPerSet: 7, icon: 'squat', description: 'A box squat that teaches proper depth and hip-hinge mechanics.',
        steps: ['Set up tight: brace your core and find your stance or grip before you move.', 'Initiate the lift with control, keeping the bar path as vertical as possible.', 'Drive through the lift with full-body tension until lockout.', 'Lower the bar under control back to the starting position.', 'Reset your position and breath fully between reps for a heavy set.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 17, name: 'Conventional Deadlift', category: 'Powerlifting', muscleGroup: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', caloriesPerSet: 9, icon: 'squat', description: 'The classic barbell pull from the floor — a true full-body test.',
        steps: ['Set up tight: brace your core and find your stance or grip before you move.', 'Initiate the lift with control, keeping the bar path as vertical as possible.', 'Drive through the lift with full-body tension until lockout.', 'Lower the bar under control back to the starting position.', 'Reset your position and breath fully between reps for a heavy set.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 18, name: 'Competition Bench Press', category: 'Powerlifting', muscleGroup: 'Chest', difficulty: 'Advanced', equipment: 'Barbell', caloriesPerSet: 11, icon: 'squat', description: 'A max-effort bench press performed with competition setup.',
        steps: ['Set up tight: brace your core and find your stance or grip before you move.', 'Initiate the lift with control, keeping the bar path as vertical as possible.', 'Drive through the lift with full-body tension until lockout.', 'Lower the bar under control back to the starting position.', 'Reset your position and breath fully between reps for a heavy set.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 19, name: 'PVC Pipe Snatch Drill', category: 'Olympic Weightlifting', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'PVC Pipe', caloriesPerSet: 8, icon: 'lift', description: "A no-weight drill that grooves the snatch's timing and positions.",
        steps: ['Start with the bar over the middle of your foot, shins close to the bar.', 'Lift off by extending your knees and hips together, keeping the bar close.', 'Accelerate explosively as the bar passes your knees.', 'Pull yourself under the bar and receive it in a stable position.', 'Stand the weight up fully to complete the rep, then reset.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 20, name: 'Power Clean', category: 'Olympic Weightlifting', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Barbell', caloriesPerSet: 10, icon: 'lift', description: 'An explosive pull-and-catch that builds serious power.',
        steps: ['Start with the bar over the middle of your foot, shins close to the bar.', 'Lift off by extending your knees and hips together, keeping the bar close.', 'Accelerate explosively as the bar passes your knees.', 'Pull yourself under the bar and receive it in a stable position.', 'Stand the weight up fully to complete the rep, then reset.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 21, name: 'Full Snatch', category: 'Olympic Weightlifting', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'Barbell', caloriesPerSet: 12, icon: 'lift', description: 'The full lift from floor to overhead in one explosive motion.',
        steps: ['Start with the bar over the middle of your foot, shins close to the bar.', 'Lift off by extending your knees and hips together, keeping the bar close.', 'Accelerate explosively as the bar passes your knees.', 'Pull yourself under the bar and receive it in a stable position.', 'Stand the weight up fully to complete the rep, then reset.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 22, name: 'Knee Push-Up', category: 'Calisthenics', muscleGroup: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 5, icon: 'pushup', description: 'An elevated-hands push-up that builds pressing strength from zero.',
        steps: ['Set your hands slightly wider than shoulder width, body in a straight line.', "Brace your core and glutes so your hips don't sag or pike.", 'Lower your chest toward the floor with elbows at about a 45-degree angle.', 'Press back up to full arm extension without flaring your elbows.', 'Keep the tempo controlled for every rep in the set.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 23, name: 'Standard Push-Up', category: 'Calisthenics', muscleGroup: 'Chest', difficulty: 'Intermediate', equipment: 'Bodyweight', caloriesPerSet: 7, icon: 'pushup', description: 'The classic bodyweight press for chest, shoulders, and triceps.',
        steps: ['Set your hands slightly wider than shoulder width, body in a straight line.', "Brace your core and glutes so your hips don't sag or pike.", 'Lower your chest toward the floor with elbows at about a 45-degree angle.', 'Press back up to full arm extension without flaring your elbows.', 'Keep the tempo controlled for every rep in the set.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 24, name: 'One-Arm Push-Up Progression', category: 'Calisthenics', muscleGroup: 'Chest', difficulty: 'Advanced', equipment: 'Bodyweight', caloriesPerSet: 9, icon: 'pushup', description: 'A high-skill single-arm push-up progression for advanced pushers.',
        steps: ['Set your hands slightly wider than shoulder width, body in a straight line.', "Brace your core and glutes so your hips don't sag or pike.", 'Lower your chest toward the floor with elbows at about a 45-degree angle.', 'Press back up to full arm extension without flaring your elbows.', 'Keep the tempo controlled for every rep in the set.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 25, name: "Farmer's Carry", category: 'Functional Training', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'Kettlebell', caloriesPerSet: 7, icon: 'lift', description: 'Walking while carrying weight — deceptively simple, deeply effective.',
        steps: ['Set up with a stable base and a neutral spine before loading the movement.', 'Brace your core to keep your torso stable throughout.', 'Move through the full pattern with control, avoiding momentum.', 'Keep your grip and posture strong for the full duration or distance.', 'Set the weight down with control at the end of each set.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 26, name: 'Kettlebell Swing', category: 'Functional Training', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Kettlebell', caloriesPerSet: 9, icon: 'lift', description: 'A hip-hinge swing that builds explosive posterior-chain power.',
        steps: ['Set up with a stable base and a neutral spine before loading the movement.', 'Brace your core to keep your torso stable throughout.', 'Move through the full pattern with control, avoiding momentum.', 'Keep your grip and posture strong for the full duration or distance.', 'Set the weight down with control at the end of each set.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 27, name: 'Turkish Get-Up', category: 'Functional Training', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'Kettlebell', caloriesPerSet: 11, icon: 'lift', description: 'A full-body flow from floor to standing that builds total-body control.',
        steps: ['Set up with a stable base and a neutral spine before loading the movement.', 'Brace your core to keep your torso stable throughout.', 'Move through the full pattern with control, avoiding momentum.', 'Keep your grip and posture strong for the full duration or distance.', 'Set the weight down with control at the end of each set.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 28, name: 'Beginner Bodyweight Circuit', category: 'Circuit Training', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 8, icon: 'circuit', description: 'A rotating set of bodyweight stations, easy to scale for beginners.',
        steps: ['Set up all stations or equipment before you start the clock.', 'Move through each exercise for the prescribed reps or time.', 'Transition quickly between stations to keep your heart rate up.', 'Maintain good form even as the circuit gets tiring.', 'Rest briefly between full rounds, then repeat.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 29, name: 'Dumbbell Full-Body Circuit', category: 'Circuit Training', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Dumbbells', caloriesPerSet: 10, icon: 'circuit', description: 'A dumbbell-based circuit hitting every major muscle group.',
        steps: ['Set up all stations or equipment before you start the clock.', 'Move through each exercise for the prescribed reps or time.', 'Transition quickly between stations to keep your heart rate up.', 'Maintain good form even as the circuit gets tiring.', 'Rest briefly between full rounds, then repeat.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 30, name: 'Advanced Metabolic Circuit', category: 'Circuit Training', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'Mixed Equipment', caloriesPerSet: 12, icon: 'circuit', description: 'A fast-paced, high-volume circuit for advanced conditioning.',
        steps: ['Set up all stations or equipment before you start the clock.', 'Move through each exercise for the prescribed reps or time.', 'Transition quickly between stations to keep your heart rate up.', 'Maintain good form even as the circuit gets tiring.', 'Rest briefly between full rounds, then repeat.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 31, name: 'Seated Forward Fold', category: 'Flexibility', muscleGroup: 'Hamstrings', difficulty: 'Beginner', equipment: 'Mat', caloriesPerSet: 2, icon: 'stretch', description: 'A calming forward fold that opens the hamstrings and lower back.',
        steps: ['Ease into the stretch slowly — never bounce or force the range.', 'Breathe deeply and let your muscles relax into the position.', 'Hold the stretch for the prescribed time, easing deeper only as it feels ready.', 'Keep the rest of your body relaxed and aligned.', 'Release the stretch slowly and switch sides if needed.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 32, name: 'Standing Hamstring Stretch Flow', category: 'Flexibility', muscleGroup: 'Hamstrings', difficulty: 'Intermediate', equipment: 'Mat', caloriesPerSet: 3, icon: 'stretch', description: 'A flowing sequence of hamstring stretches for better range of motion.',
        steps: ['Ease into the stretch slowly — never bounce or force the range.', 'Breathe deeply and let your muscles relax into the position.', 'Hold the stretch for the prescribed time, easing deeper only as it feels ready.', 'Keep the rest of your body relaxed and aligned.', 'Release the stretch slowly and switch sides if needed.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 33, name: 'Full Split Progression', category: 'Flexibility', muscleGroup: 'Hips', difficulty: 'Advanced', equipment: 'Mat', caloriesPerSet: 5, icon: 'stretch', description: 'A dedicated progression toward a full front or side split.',
        steps: ['Ease into the stretch slowly — never bounce or force the range.', 'Breathe deeply and let your muscles relax into the position.', 'Hold the stretch for the prescribed time, easing deeper only as it feels ready.', 'Keep the rest of your body relaxed and aligned.', 'Release the stretch slowly and switch sides if needed.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 34, name: 'Hip Circles', category: 'Mobility', muscleGroup: 'Hips', difficulty: 'Beginner', equipment: 'Mat', caloriesPerSet: 2, icon: 'stretch', description: 'Simple hip circles to restore range of motion before training.',
        steps: ["Move slowly through the joint's full pain-free range of motion.", 'Keep the surrounding muscles relaxed rather than forcing the stretch.', 'Pause briefly at the end range of each direction.', 'Repeat the motion for the prescribed number of circles or reps.', 'Progress the range gradually over multiple sessions, never all at once.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 35, name: "World's Greatest Stretch", category: 'Mobility', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Mat', caloriesPerSet: 3, icon: 'stretch', description: 'A full-body mobility flow that opens hips, spine, and shoulders.',
        steps: ["Move slowly through the joint's full pain-free range of motion.", 'Keep the surrounding muscles relaxed rather than forcing the stretch.', 'Pause briefly at the end range of each direction.', 'Repeat the motion for the prescribed number of circles or reps.', 'Progress the range gradually over multiple sessions, never all at once.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 36, name: 'Loaded Mobility Flow', category: 'Mobility', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'Kettlebell', caloriesPerSet: 5, icon: 'stretch', description: 'A weighted mobility flow for athletes who need control at end-range.',
        steps: ["Move slowly through the joint's full pain-free range of motion.", 'Keep the surrounding muscles relaxed rather than forcing the stretch.', 'Pause briefly at the end range of each direction.', 'Repeat the motion for the prescribed number of circles or reps.', 'Progress the range gradually over multiple sessions, never all at once.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 37, name: 'Sun Salutation A', category: 'Yoga', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Mat', caloriesPerSet: 2, icon: 'stretch', description: 'A gentle opening sequence linking breath and movement.',
        steps: ['Start in a comfortable seated or standing position and settle your breath.', 'Move into the first posture with control, linking breath to movement.', 'Hold or flow through each pose with steady, even breathing.', 'Keep your gaze soft and your attention on alignment, not intensity.', 'Finish with a few breaths in a resting position before moving on.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 38, name: 'Vinyasa Flow', category: 'Yoga', muscleGroup: 'Core', difficulty: 'Intermediate', equipment: 'Mat', caloriesPerSet: 4, icon: 'stretch', description: 'A flowing sequence that builds heat and strength through transitions.',
        steps: ['Start in a comfortable seated or standing position and settle your breath.', 'Move into the first posture with control, linking breath to movement.', 'Hold or flow through each pose with steady, even breathing.', 'Keep your gaze soft and your attention on alignment, not intensity.', 'Finish with a few breaths in a resting position before moving on.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 39, name: 'Advanced Arm Balance Flow', category: 'Yoga', muscleGroup: 'Core', difficulty: 'Advanced', equipment: 'Mat', caloriesPerSet: 6, icon: 'stretch', description: 'A challenging sequence of balance and arm-support postures.',
        steps: ['Start in a comfortable seated or standing position and settle your breath.', 'Move into the first posture with control, linking breath to movement.', 'Hold or flow through each pose with steady, even breathing.', 'Keep your gaze soft and your attention on alignment, not intensity.', 'Finish with a few breaths in a resting position before moving on.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 40, name: 'Pilates Hundred', category: 'Pilates', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Mat', caloriesPerSet: 2, icon: 'core', description: 'The classic Pilates breathing-and-pulsing core activator.',
        steps: ['Lie or sit in the starting position with your spine in neutral alignment.', 'Engage your deep core muscles before initiating any movement.', 'Move with control, exhaling on the effort phase of the exercise.', 'Keep your neck relaxed and your movements precise rather than fast.', 'Complete the prescribed reps, keeping tension in your core throughout.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 41, name: 'Roll-Up', category: 'Pilates', muscleGroup: 'Core', difficulty: 'Intermediate', equipment: 'Mat', caloriesPerSet: 4, icon: 'core', description: 'A spine-articulating exercise that builds deep core control.',
        steps: ['Lie or sit in the starting position with your spine in neutral alignment.', 'Engage your deep core muscles before initiating any movement.', 'Move with control, exhaling on the effort phase of the exercise.', 'Keep your neck relaxed and your movements precise rather than fast.', 'Complete the prescribed reps, keeping tension in your core throughout.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 42, name: 'Teaser', category: 'Pilates', muscleGroup: 'Core', difficulty: 'Advanced', equipment: 'Mat', caloriesPerSet: 6, icon: 'core', description: 'An advanced balance-and-core hold that tests full-body control.',
        steps: ['Lie or sit in the starting position with your spine in neutral alignment.', 'Engage your deep core muscles before initiating any movement.', 'Move with control, exhaling on the effort phase of the exercise.', 'Keep your neck relaxed and your movements precise rather than fast.', 'Complete the prescribed reps, keeping tension in your core throughout.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 43, name: 'Shadow Boxing', category: 'Boxing', muscleGroup: 'Arms', difficulty: 'Beginner', equipment: 'None', caloriesPerSet: 9, icon: 'punch', description: 'Shadow boxing to build form, footwork, and rhythm with no equipment.',
        steps: ['Set your stance with feet staggered, hands up to guard your face.', 'Keep your chin tucked and elbows in as you throw each strike.', 'Rotate your hips and pivot your back foot to generate power.', 'Return to guard immediately after every strike.', 'Keep your feet moving — never stay flat-footed for long.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 44, name: 'Heavy Bag Combinations', category: 'Boxing', muscleGroup: 'Arms', difficulty: 'Intermediate', equipment: 'Heavy Bag & Gloves', caloriesPerSet: 11, icon: 'punch', description: 'Combination punching on the heavy bag for power and stamina.',
        steps: ['Set your stance with feet staggered, hands up to guard your face.', 'Keep your chin tucked and elbows in as you throw each strike.', 'Rotate your hips and pivot your back foot to generate power.', 'Return to guard immediately after every strike.', 'Keep your feet moving — never stay flat-footed for long.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 45, name: 'Speed Bag & Footwork Drills', category: 'Boxing', muscleGroup: 'Arms', difficulty: 'Advanced', equipment: 'Speed Bag & Gloves', caloriesPerSet: 13, icon: 'punch', description: 'Fast-hands drills on the speed bag paired with footwork patterns.',
        steps: ['Set your stance with feet staggered, hands up to guard your face.', 'Keep your chin tucked and elbows in as you throw each strike.', 'Rotate your hips and pivot your back foot to generate power.', 'Return to guard immediately after every strike.', 'Keep your feet moving — never stay flat-footed for long.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 46, name: 'Basic Kick-Punch Combos', category: 'Kickboxing', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Gloves', caloriesPerSet: 9, icon: 'punch', description: 'Simple kick-punch combinations to learn the fundamentals.',
        steps: ['Set your fighting stance with weight balanced on the balls of your feet.', 'Combine hand strikes with kicks in smooth, connected combinations.', 'Pivot your standing leg and rotate your hips to power each kick.', 'Reset to your guard between every combination.', 'Keep your core braced to stay balanced through each strike.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 47, name: 'Muay Thai Pad Rounds', category: 'Kickboxing', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Pads & Gloves', caloriesPerSet: 11, icon: 'punch', description: 'Pad-holding rounds that build Muay Thai striking technique.',
        steps: ['Set your fighting stance with weight balanced on the balls of your feet.', 'Combine hand strikes with kicks in smooth, connected combinations.', 'Pivot your standing leg and rotate your hips to power each kick.', 'Reset to your guard between every combination.', 'Keep your core braced to stay balanced through each strike.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 48, name: 'Advanced Combo Sparring Drills', category: 'Kickboxing', muscleGroup: 'Legs', difficulty: 'Advanced', equipment: 'Gloves', caloriesPerSet: 13, icon: 'punch', description: 'Fast, complex combinations for experienced strikers.',
        steps: ['Set your fighting stance with weight balanced on the balls of your feet.', 'Combine hand strikes with kicks in smooth, connected combinations.', 'Pivot your standing leg and rotate your hips to power each kick.', 'Reset to your guard between every combination.', 'Keep your core braced to stay balanced through each strike.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 49, name: 'Basic Stance & Blocking Drills', category: 'Martial Arts', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 7, icon: 'punch', description: 'Foundational stances and blocks for total beginners.',
        steps: ['Start from a balanced, ready stance with your weight centered.', 'Move through the technique slowly first, focusing on correct form.', 'Add speed and resistance only once the movement feels controlled.', 'Reset to your ready stance after every technique or exchange.', 'Practice both sides evenly to stay balanced in your skills.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 50, name: 'Grappling Flow Drills', category: 'Martial Arts', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Bodyweight', caloriesPerSet: 9, icon: 'punch', description: 'Flowing grappling drills that build technique and timing.',
        steps: ['Start from a balanced, ready stance with your weight centered.', 'Move through the technique slowly first, focusing on correct form.', 'Add speed and resistance only once the movement feels controlled.', 'Reset to your ready stance after every technique or exchange.', 'Practice both sides evenly to stay balanced in your skills.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 51, name: 'Sparring Rounds', category: 'Martial Arts', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'Bodyweight', caloriesPerSet: 11, icon: 'punch', description: 'Live sparring rounds for applying skills under pressure.',
        steps: ['Start from a balanced, ready stance with your weight centered.', 'Move through the technique slowly first, focusing on correct form.', 'Add speed and resistance only once the movement feels controlled.', 'Reset to your ready stance after every technique or exchange.', 'Practice both sides evenly to stay balanced in your skills.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 52, name: 'Easy Jog', category: 'Running', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'None', caloriesPerSet: 9, icon: 'run', description: 'A relaxed, conversational-pace jog to build the habit.',
        steps: ['Warm up with a few minutes of easy jogging or dynamic stretches.', 'Settle into your target pace, keeping your cadence quick and light.', 'Keep your posture tall and let your arms drive naturally.', 'Hold your effort steady (or hit your intervals) for the planned distance.', 'Cool down with easy jogging or walking to finish.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 53, name: 'Tempo Run', category: 'Running', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'None', caloriesPerSet: 11, icon: 'run', description: 'A comfortably-hard sustained effort that builds speed endurance.',
        steps: ['Warm up with a few minutes of easy jogging or dynamic stretches.', 'Settle into your target pace, keeping your cadence quick and light.', 'Keep your posture tall and let your arms drive naturally.', 'Hold your effort steady (or hit your intervals) for the planned distance.', 'Cool down with easy jogging or walking to finish.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 54, name: 'Hill Sprint Repeats', category: 'Running', muscleGroup: 'Legs', difficulty: 'Advanced', equipment: 'None', caloriesPerSet: 13, icon: 'run', description: 'Short, steep hill sprints for explosive leg power.',
        steps: ['Warm up with a few minutes of easy jogging or dynamic stretches.', 'Settle into your target pace, keeping your cadence quick and light.', 'Keep your posture tall and let your arms drive naturally.', 'Hold your effort steady (or hit your intervals) for the planned distance.', 'Cool down with easy jogging or walking to finish.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 55, name: 'Leisure Ride', category: 'Cycling', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Bike', caloriesPerSet: 7, icon: 'cycle', description: 'A relaxed ride at an easy, sustainable pace.',
        steps: ['Adjust your saddle and grip so your knees track smoothly over the pedals.', 'Warm up with a few easy minutes to loosen your legs.', 'Settle into a steady cadence, keeping your upper body relaxed.', 'Shift gears or effort as needed to hit your target intensity.', 'Spin out easy for the last few minutes to cool down.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 56, name: 'Steady Endurance Ride', category: 'Cycling', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Bike', caloriesPerSet: 9, icon: 'cycle', description: 'A longer steady ride that builds aerobic base.',
        steps: ['Adjust your saddle and grip so your knees track smoothly over the pedals.', 'Warm up with a few easy minutes to loosen your legs.', 'Settle into a steady cadence, keeping your upper body relaxed.', 'Shift gears or effort as needed to hit your target intensity.', 'Spin out easy for the last few minutes to cool down.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 57, name: 'Hill Climb Intervals', category: 'Cycling', muscleGroup: 'Legs', difficulty: 'Advanced', equipment: 'Bike', caloriesPerSet: 11, icon: 'cycle', description: 'Repeated hard efforts up a climb for leg power and lung capacity.',
        steps: ['Adjust your saddle and grip so your knees track smoothly over the pedals.', 'Warm up with a few easy minutes to loosen your legs.', 'Settle into a steady cadence, keeping your upper body relaxed.', 'Shift gears or effort as needed to hit your target intensity.', 'Spin out easy for the last few minutes to cool down.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 58, name: 'Freestyle Drill Laps', category: 'Swimming', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'Pool', caloriesPerSet: 8, icon: 'swim', description: 'Technique-focused drills to build a clean freestyle stroke.',
        steps: ['Push off the wall in a streamlined position to start each length.', 'Focus on a long, controlled stroke with a steady kick.', 'Breathe on a consistent rhythm without lifting your head too high.', 'Maintain your technique even as you fatigue toward the end of each set.', 'Rest at the wall for the prescribed interval before the next length.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 59, name: 'Continuous Freestyle Swim', category: 'Swimming', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Pool', caloriesPerSet: 10, icon: 'swim', description: 'Continuous freestyle laps for aerobic swimming endurance.',
        steps: ['Push off the wall in a streamlined position to start each length.', 'Focus on a long, controlled stroke with a steady kick.', 'Breathe on a consistent rhythm without lifting your head too high.', 'Maintain your technique even as you fatigue toward the end of each set.', 'Rest at the wall for the prescribed interval before the next length.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 60, name: 'Interval Swim Sets', category: 'Swimming', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'Pool', caloriesPerSet: 12, icon: 'swim', description: 'Structured swim intervals for speed and lactate tolerance.',
        steps: ['Push off the wall in a streamlined position to start each length.', 'Focus on a long, controlled stroke with a steady kick.', 'Breathe on a consistent rhythm without lifting your head too high.', 'Maintain your technique even as you fatigue toward the end of each set.', 'Rest at the wall for the prescribed interval before the next length.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 61, name: 'Rowing Machine Steady Pace', category: 'Rowing', muscleGroup: 'Back', difficulty: 'Beginner', equipment: 'Rowing Machine', caloriesPerSet: 7, icon: 'row', description: 'An easy, steady pace on the erg to learn proper stroke mechanics.',
        steps: ['Set up at the catch with knees bent, arms extended, and back straight.', 'Drive first with your legs, then lean back and pull the handle to your ribs.', 'Reverse the sequence on the way back: arms, then body, then legs.', 'Keep the stroke smooth and controlled rather than rushed.', 'Maintain a steady rhythm for the full piece or interval.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 62, name: 'Rowing Intervals', category: 'Rowing', muscleGroup: 'Back', difficulty: 'Intermediate', equipment: 'Rowing Machine', caloriesPerSet: 9, icon: 'row', description: 'Structured on/off intervals on the rowing machine.',
        steps: ['Set up at the catch with knees bent, arms extended, and back straight.', 'Drive first with your legs, then lean back and pull the handle to your ribs.', 'Reverse the sequence on the way back: arms, then body, then legs.', 'Keep the stroke smooth and controlled rather than rushed.', 'Maintain a steady rhythm for the full piece or interval.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 63, name: '2000m Row Time Trial', category: 'Rowing', muscleGroup: 'Back', difficulty: 'Advanced', equipment: 'Rowing Machine', caloriesPerSet: 11, icon: 'row', description: 'A punishing 2000-meter row against the clock.',
        steps: ['Set up at the catch with knees bent, arms extended, and back straight.', 'Drive first with your legs, then lean back and pull the handle to your ribs.', 'Reverse the sequence on the way back: arms, then body, then legs.', 'Keep the stroke smooth and controlled rather than rushed.', 'Maintain a steady rhythm for the full piece or interval.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 64, name: 'Beginner Dance Cardio', category: 'Dance Fitness', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'None', caloriesPerSet: 6, icon: 'jump', description: 'Simple, low-impact dance moves set to music.',
        steps: ["Learn the basic step pattern slowly before adding the music's tempo.", 'Keep your knees soft and your movements loose and rhythmic.', "Follow the routine's cues, adjusting your energy to the music.", 'Keep moving through transitions to maintain your heart rate.', 'Cool down with slower movements and a few stretches at the end.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 65, name: 'Zumba-Style Routine', category: 'Dance Fitness', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'None', caloriesPerSet: 8, icon: 'jump', description: 'An upbeat, choreographed cardio dance session.',
        steps: ["Learn the basic step pattern slowly before adding the music's tempo.", 'Keep your knees soft and your movements loose and rhythmic.', "Follow the routine's cues, adjusting your energy to the music.", 'Keep moving through transitions to maintain your heart rate.', 'Cool down with slower movements and a few stretches at the end.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 66, name: 'High-Energy Dance HIIT', category: 'Dance Fitness', muscleGroup: 'Legs', difficulty: 'Advanced', equipment: 'None', caloriesPerSet: 10, icon: 'jump', description: 'A high-intensity dance workout that blends cardio and HIIT.',
        steps: ["Learn the basic step pattern slowly before adding the music's tempo.", 'Keep your knees soft and your movements loose and rhythmic.', "Follow the routine's cues, adjusting your energy to the music.", 'Keep moving through transitions to maintain your heart rate.', 'Cool down with slower movements and a few stretches at the end.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 67, name: 'Recreational Pickup Game', category: 'Sports', muscleGroup: 'Full Body', difficulty: 'Beginner', equipment: 'Varies', caloriesPerSet: 6, icon: 'circuit', description: 'A relaxed pickup game for fun, low-pressure activity.',
        steps: ['Warm up with light movement and a few sport-specific drills.', 'Play at an intensity that matches your goal for the session.', 'Focus on good decision-making and technique under fatigue.', 'Stay aware of your body and adjust intensity if form breaks down.', 'Cool down and stretch the muscles you used most after finishing.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 68, name: 'Competitive League Match', category: 'Sports', muscleGroup: 'Full Body', difficulty: 'Intermediate', equipment: 'Varies', caloriesPerSet: 8, icon: 'circuit', description: 'A competitive match that demands real strategy and effort.',
        steps: ['Warm up with light movement and a few sport-specific drills.', 'Play at an intensity that matches your goal for the session.', 'Focus on good decision-making and technique under fatigue.', 'Stay aware of your body and adjust intensity if form breaks down.', 'Cool down and stretch the muscles you used most after finishing.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 69, name: 'Tournament-Level Play', category: 'Sports', muscleGroup: 'Full Body', difficulty: 'Advanced', equipment: 'Varies', caloriesPerSet: 10, icon: 'circuit', description: 'High-stakes tournament play against serious competition.',
        steps: ['Warm up with light movement and a few sport-specific drills.', 'Play at an intensity that matches your goal for the session.', 'Focus on good decision-making and technique under fatigue.', 'Stay aware of your body and adjust intensity if form breaks down.', 'Cool down and stretch the muscles you used most after finishing.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 70, name: 'Flat Trail Walk', category: 'Hiking', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'None', caloriesPerSet: 4, icon: 'run', description: 'An easy, flat trail walk to enjoy the outdoors.',
        steps: ['Start at an easy pace to warm up your legs and lungs.', 'Use a steady, sustainable stride, shortening it on steep sections.', 'Use trekking poles or your arms for balance on uneven terrain.', 'Take brief breaks to hydrate and check your pace on longer climbs.', 'Ease off the pace on the descent to protect your knees.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 71, name: 'Moderate Elevation Hike', category: 'Hiking', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'None', caloriesPerSet: 6, icon: 'run', description: 'A rolling-hills hike that adds a real aerobic challenge.',
        steps: ['Start at an easy pace to warm up your legs and lungs.', 'Use a steady, sustainable stride, shortening it on steep sections.', 'Use trekking poles or your arms for balance on uneven terrain.', 'Take brief breaks to hydrate and check your pace on longer climbs.', 'Ease off the pace on the descent to protect your knees.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 72, name: 'Steep Summit Trek', category: 'Hiking', muscleGroup: 'Legs', difficulty: 'Advanced', equipment: 'None', caloriesPerSet: 8, icon: 'run', description: 'A steep, sustained climb to a summit for serious leg and lung work.',
        steps: ['Start at an easy pace to warm up your legs and lungs.', 'Use a steady, sustainable stride, shortening it on steep sections.', 'Use trekking poles or your arms for balance on uneven terrain.', 'Take brief breaks to hydrate and check your pace on longer climbs.', 'Ease off the pace on the descent to protect your knees.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
      { id: 73, name: 'Dead Bug', category: 'Core Training', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Mat', caloriesPerSet: 3, icon: 'core', description: 'An anti-extension drill that teaches core bracing.',
        steps: ['Set up in the starting position with your spine neutral and braced.', 'Engage your core before you start moving — brace, then move.', 'Move through the exercise slowly, avoiding any arching in your lower back.', 'Breathe steadily throughout rather than holding your breath.', 'Hold or repeat for the prescribed time or reps, keeping tension throughout.', 'Tip: move slowly and focus on nailing the basic pattern before adding load or speed.'] },
      { id: 74, name: 'Plank Variations', category: 'Core Training', muscleGroup: 'Core', difficulty: 'Intermediate', equipment: 'Mat', caloriesPerSet: 5, icon: 'core', description: 'A rotating set of plank holds for full core endurance.',
        steps: ['Set up in the starting position with your spine neutral and braced.', 'Engage your core before you start moving — brace, then move.', 'Move through the exercise slowly, avoiding any arching in your lower back.', 'Breathe steadily throughout rather than holding your breath.', 'Hold or repeat for the prescribed time or reps, keeping tension throughout.', 'Tip: once form is consistent, add a bit more load, pace, or range to keep progressing.'] },
      { id: 75, name: 'Hanging Leg Raise', category: 'Core Training', muscleGroup: 'Core', difficulty: 'Advanced', equipment: 'Pull-up Bar', caloriesPerSet: 7, icon: 'core', description: 'A weighted hanging raise that builds serious core and grip strength.',
        steps: ['Set up in the starting position with your spine neutral and braced.', 'Engage your core before you start moving — brace, then move.', 'Move through the exercise slowly, avoiding any arching in your lower back.', 'Breathe steadily throughout rather than holding your breath.', 'Hold or repeat for the prescribed time or reps, keeping tension throughout.', 'Tip: push the intensity, load, or complexity here, but never at the expense of clean technique.'] },
    ];

    const routines = [
      { id: 1, name: 'Foundations Strength', goal: 'Build Strength', durationWeeks: 6, difficulty: 'Beginner', isPredefined: true,
        schedule: { 1: [1, 2, 73, 74], 2: [], 3: [16, 17, 74, 75], 4: [], 5: [2, 3, 73, 75], 6: [], 7: [] } },
      { id: 2, name: 'Lean & Conditioned', goal: 'Lose Weight', durationWeeks: 8, difficulty: 'Beginner', isPredefined: true,
        schedule: { 1: [4, 7, 52], 2: [55, 8], 3: [5, 9, 53], 4: [56, 7], 5: [6, 8, 54], 6: [57], 7: [] } },
      { id: 3, name: 'Hypertrophy Split', goal: 'Build Muscle', durationWeeks: 10, difficulty: 'Intermediate', isPredefined: true,
        schedule: { 1: [13, 1, 22], 2: [14, 23], 3: [], 4: [15, 2, 23, 24], 5: [14, 3, 24, 22], 6: [13], 7: [] } },
      { id: 4, name: 'Mobility & Recovery', goal: 'General Fitness', durationWeeks: 4, difficulty: 'Beginner', isPredefined: true,
        schedule: { 1: [37, 31, 34], 2: [], 3: [34, 35, 40], 4: [], 5: [38, 32, 41], 6: [40, 36], 7: [] } },
      { id: 5, name: 'Athletic Performance', goal: 'General Fitness', durationWeeks: 8, difficulty: 'Advanced', isPredefined: true,
        schedule: { 1: [10, 20, 26, 44], 2: [43, 44], 3: [19, 27, 11], 4: [45, 25], 5: [11, 21, 25, 43], 6: [9, 12], 7: [] } },
      { id: 6, name: 'Combat Conditioning', goal: 'General Fitness', durationWeeks: 6, difficulty: 'Intermediate', isPredefined: true,
        schedule: { 1: [43, 46, 49], 2: [], 3: [44, 47, 50], 4: [], 5: [45, 48, 51], 6: [43, 47], 7: [] } },
      { id: 7, name: 'Endurance Builder', goal: 'General Fitness', durationWeeks: 8, difficulty: 'Intermediate', isPredefined: true,
        schedule: { 1: [52, 58, 61], 2: [55, 62], 3: [53, 59, 63], 4: [56, 61], 5: [54, 60, 62], 6: [57, 63], 7: [] } },
    ];

    return {
      users: [],
      exercises,
      routines,
      userRoutines: [],
      workouts: [],
      progressLogs: [],
    };
  }

  // ---------- Auth ----------

  function isUsernameTaken(username, excludeUserId = null) {
    const db = load();
    return db.users.some(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.id !== excludeUserId);
  }

  function isEmailTaken(email, excludeUserId = null) {
    const db = load();
    return db.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== excludeUserId);
  }

  function registerUser({ firstName, lastName, username, email, password, age, height, weight, fitnessGoal }) {
    const db = load();
    username = username.trim();
    email = email.trim().toLowerCase();

    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: 'That username is already taken.' };
    }
    if (db.users.some(u => u.email.toLowerCase() === email)) {
      return { ok: false, error: 'An account already exists with that email.' };
    }

    const user = {
      id: nextId(db.users),
      username, email,
      passwordHash: hashPassword(password),
      firstName, lastName,
      age: age || null,
      height: height || null,
      weight: weight || null,
      fitnessGoal: fitnessGoal || 'General Fitness',
      createdDate: todayISO(),
      lastLoginDate: todayISO(),
      isActive: true,
    };
    db.users.push(user);
    save(db);
    return { ok: true, user };
  }

  function validateUser(username, password) {
    const db = load();
    const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) return { ok: false, error: 'No account found with that username.' };
    if (user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: 'Incorrect password.' };
    }
    user.lastLoginDate = todayISO();
    save(db);
    sessionStorage.setItem(SESSION_KEY, String(user.id));
    return { ok: true, user };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function getCurrentUser() {
    const id = sessionStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return getUserById(Number(id));
  }

  function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  }

  function getUserById(id) {
    const db = load();
    return db.users.find(u => u.id === id) || null;
  }

  function updateUserProfile(userId, updates) {
    const db = load();
    const user = db.users.find(u => u.id === userId);
    if (!user) return { ok: false, error: 'User not found.' };
    Object.assign(user, updates);
    save(db);
    return { ok: true, user };
  }

  // ---------- Workouts ----------

  function calculateCalories(workoutType, durationMinutes, intensity) {
    const base = {
      Strength: 6, Cardio: 9, HIIT: 11, CrossFit: 10, Bodybuilding: 6,
      Powerlifting: 7, 'Olympic Weightlifting': 8, Calisthenics: 7,
      'Functional Training': 8, 'Circuit Training': 9, Flexibility: 3,
      Mobility: 3, Yoga: 4, Pilates: 4, Boxing: 10, Kickboxing: 10,
      'Martial Arts': 9, Running: 10, Cycling: 8, Swimming: 9, Rowing: 9,
      'Dance Fitness': 8, Sports: 8, Hiking: 6, 'Core Training': 5,
    }[workoutType] || 6;
    const factor = { Low: 0.8, Moderate: 1, High: 1.3 }[intensity] || 1;
    return Math.round(base * durationMinutes * factor);
  }

  function createWorkout(userId, workout) {
    const db = load();
    const calories = workout.caloriesBurned ??
      calculateCalories(workout.workoutType, Number(workout.durationMinutes) || 0, workout.intensity);
    const record = {
      id: nextId(db.workouts),
      userId,
      workoutDate: workout.workoutDate || todayISO(),
      durationMinutes: Number(workout.durationMinutes) || 0,
      caloriesBurned: calories,
      workoutType: workout.workoutType,
      intensity: workout.intensity,
      notes: workout.notes || '',
      isCompleted: true,
      exercises: workout.exercises || [], // [{exerciseId, sets, reps, weight}]
    };
    db.workouts.push(record);
    save(db);
    return record;
  }

  function getUserWorkouts(userId, { month, year } = {}) {
    const db = load();
    let list = db.workouts.filter(w => w.userId === userId);
    if (month != null && year != null) {
      list = list.filter(w => {
        const d = new Date(w.workoutDate);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });
    }
    return list.sort((a, b) => b.workoutDate.localeCompare(a.workoutDate));
  }

  function getTotalWorkoutsThisMonth(userId) {
    const now = new Date();
    return getUserWorkouts(userId, { month: now.getMonth() + 1, year: now.getFullYear() }).length;
  }

  function getTotalCaloriesBurnedThisMonth(userId) {
    const now = new Date();
    return getUserWorkouts(userId, { month: now.getMonth() + 1, year: now.getFullYear() })
      .reduce((sum, w) => sum + w.caloriesBurned, 0);
  }

  function getAverageIntensityThisMonth(userId) {
    const now = new Date();
    const list = getUserWorkouts(userId, { month: now.getMonth() + 1, year: now.getFullYear() });
    if (!list.length) return null;
    const map = { Low: 1, Moderate: 2, High: 3 };
    const avg = list.reduce((s, w) => s + (map[w.intensity] || 2), 0) / list.length;
    if (avg < 1.5) return 'Low';
    if (avg < 2.5) return 'Moderate';
    return 'High';
  }

  // ---------- Routines / Exercises ----------

  function getAllExercises() {
    return load().exercises;
  }

  function getExerciseById(id) {
    return load().exercises.find(e => e.id === Number(id)) || null;
  }

  function getExercisesByCategory(category) {
    const list = load().exercises;
    return category ? list.filter(e => e.category === category) : list;
  }

  function getPredefinedRoutines() {
    return load().routines.filter(r => r.isPredefined);
  }

  function getRoutinesByGoal(goal) {
    const list = load().routines;
    return goal ? list.filter(r => r.goal === goal) : list;
  }

  function getRoutineById(id) {
    return load().routines.find(r => r.id === Number(id)) || null;
  }

  function getRoutineExercisesByDay(routineId, day) {
    const routine = getRoutineById(routineId);
    if (!routine) return [];
    const ids = routine.schedule[day] || [];
    return ids.map(id => getExerciseById(id)).filter(Boolean);
  }

  function assignRoutineToUser(userId, routineId) {
    const db = load();
    db.userRoutines.forEach(ur => { if (ur.userId === userId) ur.isActive = false; });
    db.userRoutines.push({
      id: nextId(db.userRoutines),
      userId, routineId,
      startDate: todayISO(),
      isActive: true,
    });
    save(db);
  }

  function getUserActiveRoutine(userId) {
    const db = load();
    const active = db.userRoutines
      .filter(ur => ur.userId === userId && ur.isActive)
      .sort((a, b) => b.id - a.id)[0];
    if (!active) return null;
    return { ...getRoutineById(active.routineId), assignedOn: active.startDate };
  }

  // ---------- Progress ----------

  function addProgressLog(userId, log) {
    const db = load();
    const record = {
      id: nextId(db.progressLogs),
      userId,
      logDate: log.logDate || todayISO(),
      weight: Number(log.weight) || null,
      bodyFatPercentage: log.bodyFatPercentage ? Number(log.bodyFatPercentage) : null,
      measurements: {
        chest: log.chest ? Number(log.chest) : null,
        waist: log.waist ? Number(log.waist) : null,
        hip: log.hip ? Number(log.hip) : null,
        arm: log.arm ? Number(log.arm) : null,
        thigh: log.thigh ? Number(log.thigh) : null,
      },
      notes: log.notes || '',
    };
    db.progressLogs.push(record);
    save(db);
    return record;
  }

  function getUserProgressHistory(userId) {
    return load().progressLogs
      .filter(p => p.userId === userId)
      .sort((a, b) => a.logDate.localeCompare(b.logDate));
  }

  function getLatestProgressLog(userId) {
    const list = getUserProgressHistory(userId);
    return list.length ? list[list.length - 1] : null;
  }

  function getFirstProgressLog(userId) {
    const list = getUserProgressHistory(userId);
    return list.length ? list[0] : null;
  }

  function calculateWeightLoss(userId) {
    const first = getFirstProgressLog(userId);
    const latest = getLatestProgressLog(userId);
    if (!first || !latest || first.id === latest.id || !first.weight || !latest.weight) return null;
    return +(first.weight - latest.weight).toFixed(1);
  }

  // ---------- Demo / sample data automation ----------

  function daysAgoISO(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  // Populates a real account with a plausible few weeks of history —
  // used by the "load sample data" prompt so a new user (or a reviewer)
  // can see the app populated without typing anything in by hand.
  function generateSampleActivity(userId) {
    const db = load();
    const user = db.users.find(u => u.id === userId);
    if (!user) return;

    const routine = db.routines.find(r => r.goal === user.fitnessGoal) || db.routines[0];
    assignRoutineToUser(userId, routine.id);

    const types = ['Strength', 'Cardio', 'Strength', 'Flexibility', 'Cardio', 'Strength', 'Sports', 'Cardio'];
    const intensities = ['Moderate', 'High', 'Moderate', 'Low', 'High', 'Moderate', 'High', 'Low'];
    const durations = [45, 30, 50, 25, 35, 55, 40, 20];
    const exercisePool = db.exercises;

    types.forEach((type, i) => {
      const dayOffset = 20 - i * 3;
      const exCount = type === 'Flexibility' ? 1 : 2 + (i % 2);
      const picked = exercisePool
        .filter(x => x.category === type || type === 'Sports')
        .slice(0, exCount);
      const exercises = (picked.length ? picked : exercisePool.slice(0, 2)).map(x => ({
        exerciseId: x.id,
        sets: 3 + (i % 2),
        reps: type === 'Cardio' ? 1 : 8 + (i % 3) * 2,
        weight: type === 'Strength' ? 10 + i * 2.5 : 0,
      }));
      createWorkout(userId, {
        workoutDate: daysAgoISO(dayOffset),
        workoutType: type,
        durationMinutes: durations[i],
        intensity: intensities[i],
        notes: '',
        exercises,
      });
    });

    const startWeight = Number(user.weight) || 78;
    const trend = user.fitnessGoal === 'Lose Weight' ? -0.4
      : user.fitnessGoal === 'Build Muscle' ? 0.25 : 0;
    [21, 15, 10, 5, 1].forEach((daysAgo, i) => {
      addProgressLog(userId, {
        logDate: daysAgoISO(daysAgo),
        weight: +(startWeight + trend * (5 - i) + (Math.random() * 0.6 - 0.3)).toFixed(1),
        bodyFatPercentage: '',
        notes: '',
      });
    });
  }

  function seedDemoAccount() {
    const db = load();
    let demo = db.users.find(u => u.username === 'demo');
    if (!demo) {
      const result = registerUser({
        firstName: 'Dana', lastName: 'Rivera',
        username: 'demo', email: 'demo@aurafitness.app',
        password: 'Demo1234',
        age: 29, height: 170, weight: 74,
        fitnessGoal: 'Build Muscle',
      });
      demo = result.user;
      generateSampleActivity(demo.id);
    }
    return demo;
  }

  return {
    registerUser, validateUser, logout, getCurrentUser, requireAuth,
    getUserById, updateUserProfile, isUsernameTaken, isEmailTaken,
    generateSampleActivity, seedDemoAccount,
    createWorkout, getUserWorkouts, getTotalWorkoutsThisMonth,
    getTotalCaloriesBurnedThisMonth, getAverageIntensityThisMonth, calculateCalories,
    getAllExercises, getExerciseById, getExercisesByCategory,
    getPredefinedRoutines, getRoutinesByGoal, getRoutineById,
    getRoutineExercisesByDay, assignRoutineToUser, getUserActiveRoutine,
    addProgressLog, getUserProgressHistory, getLatestProgressLog,
    getFirstProgressLog, calculateWeightLoss,
  };
})();
