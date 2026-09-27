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
      { id: 1, name: 'Barbell Back Squat', category: 'Strength', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', caloriesPerSet: 9, icon: 'squat',
        description: 'A compound lower-body lift that builds leg and core strength.',
        steps: [
          'Set the bar on a rack at about chest height and step under it, resting it across your upper back.',
          'Lift the bar and step back to a stance about shoulder-width apart, toes turned slightly out.',
          'Brace your core, then bend your knees and hips together to lower down, keeping your chest up.',
          'Go down until your hips are level with or below your knees, keeping weight through your whole foot.',
          'Drive through your heels and mid-foot to stand back up, squeezing your glutes at the top.',
        ],
        benefits: ['Builds total lower-body strength in one lift', 'Strengthens the core and lower back through bracing', 'Carries over to everyday movements like sitting and standing', 'One of the best lifts for building bone density'],
        tips: ['Letting the knees cave inward — keep them tracking over your toes', 'Rounding the lower back at the bottom — brace harder or reduce the load', 'Rising with the hips before the chest — drive up evenly'],
      },
      { id: 2, name: 'Push-Up', category: 'Strength', muscleGroup: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 6, icon: 'pushup',
        description: 'A bodyweight press that works chest, shoulders, and triceps.',
        steps: [
          'Start in a plank with hands slightly wider than shoulder-width, arms straight.',
          'Keep your body in a straight line from head to heels, core and glutes braced.',
          'Bend your elbows to lower your chest toward the floor, elbows at roughly 45°.',
          'Stop just above the floor, then press back up to a straight-arm plank.',
        ],
        benefits: ['No equipment needed — train anywhere', 'Builds chest, shoulder and triceps strength together', 'Reinforces core stability through the plank position', 'Easy to scale up or down for any level'],
        tips: ['Letting the hips sag — squeeze the core and glutes', 'Flaring the elbows straight out to the sides — angle them closer to 45°', 'Only moving the head instead of the whole torso'],
      },
      { id: 3, name: 'Deadlift', category: 'Strength', muscleGroup: 'Back', difficulty: 'Advanced', equipment: 'Barbell', caloriesPerSet: 11, icon: 'deadlift',
        description: 'A full-posterior-chain pull from the floor to hip lockout.',
        steps: [
          'Stand with feet hip-width apart, the bar over your mid-foot.',
          'Hinge at the hips and bend your knees to grip the bar just outside your legs.',
          'Flatten your back, pull your chest up, and take the slack out of the bar.',
          'Drive through the floor with your legs while keeping the bar close to your shins, standing tall.',
          'Reverse the motion under control to lower the bar back to the floor.',
        ],
        benefits: ['Strengthens the entire posterior chain — back, glutes and hamstrings', 'Improves grip strength and full-body bracing', 'Builds functional strength for lifting things safely', 'High calorie and effort payoff per set'],
        tips: ['Rounding the back to reach the bar — hinge with hips, not the spine', 'Letting the bar drift away from the shins — keep it close the whole way up', 'Yanking the bar off the floor — take up the slack first, then drive'],
      },
      { id: 4, name: 'Running', category: 'Cardio', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'None', caloriesPerSet: 14, icon: 'run',
        description: 'Steady-state or interval running for cardiovascular conditioning.',
        steps: [
          'Warm up with 5 minutes of easy walking or light jogging.',
          'Settle into an upright posture with a slight forward lean from the ankles.',
          'Land with your foot roughly under your hips, not far out in front.',
          'Keep a relaxed arm swing and steady breathing rhythm.',
          'Cool down with a few minutes of easy walking to bring your heart rate down.',
        ],
        benefits: ['Builds cardiovascular endurance and lung capacity', 'Burns calories efficiently with no equipment', 'Improves mood and energy through regular aerobic work', 'Easy to scale by distance, pace or intervals'],
        tips: ['Overstriding — reaching the foot too far ahead of the body', 'Starting too fast — settle into an easy, sustainable pace first', 'Skipping the warm-up and cool-down'],
      },
      { id: 5, name: 'Pull-Up', category: 'Strength', muscleGroup: 'Back', difficulty: 'Advanced', equipment: 'Pull-up Bar', caloriesPerSet: 8, icon: 'pullup',
        description: 'A vertical pull that targets the lats, biceps, and grip.',
        steps: [
          'Grip the bar just outside shoulder-width, palms facing away from you.',
          'Hang with arms fully extended and shoulders relaxed.',
          'Pull your chest up toward the bar by driving your elbows down and back.',
          'Get your chin over the bar, then lower back down under control to a full hang.',
        ],
        benefits: ['Builds serious back, lat and grip strength', 'One of the best tests of relative bodyweight strength', 'Improves shoulder stability and posture', 'Scales well with bands or assisted machines for beginners'],
        tips: ['Kipping or swinging the legs to cheat momentum up', 'Only doing half-reps — go to a full hang each time', 'Shrugging the shoulders up by the ears instead of driving elbows down'],
      },
      { id: 6, name: 'Plank', category: 'Flexibility', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 4, icon: 'plank',
        description: 'An isometric hold that builds core and shoulder stability.',
        steps: [
          'Rest on your forearms and toes, elbows stacked under your shoulders.',
          'Form a straight line from your head to your heels.',
          'Brace your core and squeeze your glutes to keep your hips level.',
          'Breathe steadily and hold the position for the target time.',
        ],
        benefits: ['Builds deep core stability without spinal loading', 'Reinforces good posture for other lifts', 'Trains the shoulders and glutes isometrically', 'Easy to do anywhere, no equipment needed'],
        tips: ['Letting the hips sag toward the floor — squeeze the glutes and brace', 'Piking the hips up too high — aim for a flat line', 'Holding your breath — breathe steadily throughout'],
      },
      { id: 7, name: 'Dumbbell Shoulder Press', category: 'Strength', muscleGroup: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells', caloriesPerSet: 7, icon: 'press',
        description: 'An overhead press that builds shoulder and triceps strength.',
        steps: [
          'Sit or stand holding a dumbbell in each hand at shoulder height, palms forward.',
          'Brace your core so your lower back doesn\'t arch.',
          'Press both dumbbells straight overhead until your arms are extended.',
          'Lower back down under control to the starting position at shoulder height.',
        ],
        benefits: ['Builds shoulder strength and stability', 'Strengthens the triceps through a full overhead range', 'Dumbbells let each side work independently', 'Improves overhead mobility over time'],
        tips: ['Arching the lower back to help the weight up — brace the core instead', 'Flaring the elbows too wide at the bottom', 'Not extending fully at the top — lock out overhead each rep'],
      },
      { id: 8, name: 'Cycling', category: 'Cardio', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Bike', caloriesPerSet: 13, icon: 'cycle',
        description: 'Low-impact cardio that builds leg endurance.',
        steps: [
          'Adjust the seat so your knee has a slight bend at the bottom of the pedal stroke.',
          'Start pedaling at an easy, steady cadence to warm up.',
          'Keep a relaxed grip and upright-to-forward posture depending on your bike.',
          'Build to your target intensity, then ease off gradually to finish.',
        ],
        benefits: ['Low-impact on the joints compared to running', 'Builds leg endurance and cardiovascular fitness', 'Easy to control intensity via resistance or terrain', 'Good active-recovery option between harder sessions'],
        tips: ['Seat set too low, straining the knees', 'Pushing too hard, too soon before warming up', 'Gripping the handlebars too tightly, tensing the shoulders'],
      },
      { id: 9, name: 'Jump Rope', category: 'Cardio', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Jump Rope', caloriesPerSet: 12, icon: 'jumprope',
        description: 'A fast interval tool for footwork and conditioning.',
        steps: [
          'Hold the handles lightly with the rope behind your heels.',
          'Swing the rope using your wrists, not your whole arms.',
          'Jump just high enough to clear the rope, landing softly on the balls of your feet.',
          'Keep a steady rhythm, starting with short intervals and resting between sets.',
        ],
        benefits: ['Sharpens footwork, timing and coordination', 'High calorie burn in a short amount of time', 'Portable — needs almost no space or equipment', 'Builds calf and ankle endurance'],
        tips: ['Jumping too high — small, quick hops are more efficient', 'Swinging the rope from the shoulders instead of the wrists', 'Landing flat-footed instead of on the balls of your feet'],
      },
      { id: 10, name: 'Dumbbell Row', category: 'Strength', muscleGroup: 'Back', difficulty: 'Beginner', equipment: 'Dumbbells', caloriesPerSet: 6, icon: 'row',
        description: 'A single-arm pull that builds back thickness and grip.',
        steps: [
          'Place one knee and hand on a bench, holding a dumbbell in the opposite hand.',
          'Let the dumbbell hang straight down with your back flat, roughly parallel to the floor.',
          'Pull the dumbbell up toward your hip, driving your elbow past your torso.',
          'Lower it back down under control to a full stretch, then repeat.',
        ],
        benefits: ['Builds back thickness and pulling strength', 'Works each side independently, evening out imbalances', 'Strengthens grip along with the back and biceps', 'Low equipment and space needed'],
        tips: ['Twisting the torso to help the weight up — keep the hips and shoulders square', 'Using a jerky, momentum-driven pull instead of a controlled one', 'Rounding the supporting-side back — keep it flat throughout'],
      },
      { id: 11, name: 'Lunges', category: 'Strength', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 7, icon: 'lunge',
        description: 'A single-leg movement that builds balance and leg strength.',
        steps: [
          'Stand tall, then step one leg forward into a long stride.',
          'Lower your back knee toward the floor by bending both knees.',
          'Keep your front knee tracking over your ankle, torso upright.',
          'Push back up through your front heel to return to standing, then switch legs.',
        ],
        benefits: ['Builds single-leg strength and balance', 'Trains each leg independently to fix imbalances', 'Improves hip mobility and stability', 'Needs no equipment — easy to add anywhere'],
        tips: ['Letting the front knee collapse inward or shoot past the toes', 'Leaning the torso too far forward — stay upright', 'Taking too short a stride, cramping the movement'],
      },
      { id: 12, name: 'Yoga Flow', category: 'Flexibility', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Mat', caloriesPerSet: 4, icon: 'yoga',
        description: 'A mobility and breathing sequence for recovery days.',
        steps: [
          'Start standing tall, grounding evenly through both feet.',
          'Move slowly between poses, syncing each movement with a breath.',
          'Hold each position for several breaths, easing deeper without forcing it.',
          'Finish lying down for a minute of slow, relaxed breathing.',
        ],
        benefits: ['Improves flexibility and joint mobility', 'Encourages slow, controlled breathing and recovery', 'Low-impact way to stay active on rest days', 'Helps reduce muscle tension and stress'],
        tips: ['Forcing a stretch past a comfortable range', 'Holding your breath instead of breathing through each pose', 'Rushing between poses instead of moving with control'],
      },
    ];

    const routines = [
      { id: 1, name: 'Foundations Strength', goal: 'Build Strength', durationWeeks: 6, difficulty: 'Beginner', isPredefined: true,
        schedule: { 1: [1, 2, 6], 3: [3, 10, 6], 5: [7, 11, 2], 2: [], 4: [], 6: [], 7: [] } },
      { id: 2, name: 'Lean & Conditioned', goal: 'Lose Weight', durationWeeks: 8, difficulty: 'Beginner', isPredefined: true,
        schedule: { 1: [4, 9], 2: [8], 3: [4, 6], 4: [9], 5: [8, 4], 6: [], 7: [] } },
      { id: 3, name: 'Hypertrophy Split', goal: 'Build Muscle', durationWeeks: 10, difficulty: 'Intermediate', isPredefined: true,
        schedule: { 1: [1, 11], 2: [2, 7], 3: [], 4: [3, 10, 5], 5: [2, 7, 6], 6: [], 7: [] } },
      { id: 4, name: 'Mobility & Recovery', goal: 'General Fitness', durationWeeks: 4, difficulty: 'Beginner', isPredefined: true,
        schedule: { 1: [12, 6], 2: [], 3: [12], 4: [], 5: [12, 6], 6: [4], 7: [] } },
      { id: 5, name: 'Athletic Performance', goal: 'General Fitness', durationWeeks: 8, difficulty: 'Advanced', isPredefined: true,
        schedule: { 1: [3, 5, 6], 2: [9, 4], 3: [1, 11], 4: [8], 5: [7, 10, 2], 6: [9], 7: [] } },
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
    const base = { Cardio: 9, Strength: 6, Flexibility: 3, Sports: 8 }[workoutType] || 6;
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

  return {
    registerUser, validateUser, logout, getCurrentUser, requireAuth,
    getUserById, updateUserProfile,
    createWorkout, getUserWorkouts, getTotalWorkoutsThisMonth,
    getTotalCaloriesBurnedThisMonth, getAverageIntensityThisMonth, calculateCalories,
    getAllExercises, getExerciseById, getExercisesByCategory,
    getPredefinedRoutines, getRoutinesByGoal, getRoutineById,
    getRoutineExercisesByDay, assignRoutineToUser, getUserActiveRoutine,
    addProgressLog, getUserProgressHistory, getLatestProgressLog,
    getFirstProgressLog, calculateWeightLoss,
  };
})();
