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
      { id: 1, name: 'Barbell Back Squat', category: 'Strength', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', caloriesPerSet: 9, description: 'A compound lower-body lift that builds leg and core strength.' },
      { id: 2, name: 'Push-Up', category: 'Strength', muscleGroup: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 6, description: 'A bodyweight press that works chest, shoulders, and triceps.' },
      { id: 3, name: 'Deadlift', category: 'Strength', muscleGroup: 'Back', difficulty: 'Advanced', equipment: 'Barbell', caloriesPerSet: 11, description: 'A full-posterior-chain pull from the floor to hip lockout.' },
      { id: 4, name: 'Running', category: 'Cardio', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'None', caloriesPerSet: 14, description: 'Steady-state or interval running for cardiovascular conditioning.' },
      { id: 5, name: 'Pull-Up', category: 'Strength', muscleGroup: 'Back', difficulty: 'Advanced', equipment: 'Pull-up Bar', caloriesPerSet: 8, description: 'A vertical pull that targets the lats, biceps, and grip.' },
      { id: 6, name: 'Plank', category: 'Flexibility', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 4, description: 'An isometric hold that builds core and shoulder stability.' },
      { id: 7, name: 'Dumbbell Shoulder Press', category: 'Strength', muscleGroup: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells', caloriesPerSet: 7, description: 'An overhead press that builds shoulder and triceps strength.' },
      { id: 8, name: 'Cycling', category: 'Cardio', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Bike', caloriesPerSet: 13, description: 'Low-impact cardio that builds leg endurance.' },
      { id: 9, name: 'Jump Rope', category: 'Cardio', muscleGroup: 'Legs', difficulty: 'Intermediate', equipment: 'Jump Rope', caloriesPerSet: 12, description: 'A fast interval tool for footwork and conditioning.' },
      { id: 10, name: 'Dumbbell Row', category: 'Strength', muscleGroup: 'Back', difficulty: 'Beginner', equipment: 'Dumbbells', caloriesPerSet: 6, description: 'A single-arm pull that builds back thickness and grip.' },
      { id: 11, name: 'Lunges', category: 'Strength', muscleGroup: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', caloriesPerSet: 7, description: 'A single-leg movement that builds balance and leg strength.' },
      { id: 12, name: 'Yoga Flow', category: 'Flexibility', muscleGroup: 'Core', difficulty: 'Beginner', equipment: 'Mat', caloriesPerSet: 4, description: 'A mobility and breathing sequence for recovery days.' },
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
