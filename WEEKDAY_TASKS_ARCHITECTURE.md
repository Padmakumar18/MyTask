# Weekday Tasks - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Angular Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Week Days       │         │  Weekend Days    │          │
│  │  Component       │         │  Component       │          │
│  │  (Mon-Fri)       │         │  (Sat-Sun)       │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                            │                     │
│           └────────────┬───────────────┘                     │
│                        │                                     │
│                        ▼                                     │
│           ┌────────────────────────┐                         │
│           │  WeekdayTaskService    │                         │
│           │  (CRUD Operations)     │                         │
│           └────────────┬───────────┘                         │
│                        │                                     │
│                        ▼                                     │
│           ┌────────────────────────┐                         │
│           │   SupabaseService      │                         │
│           │   (Database Client)    │                         │
│           └────────────┬───────────┘                         │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Supabase Cloud     │
              │   (PostgreSQL)       │
              ├──────────────────────┤
              │  ┌────────────────┐  │
              │  │  weekdays      │  │
              │  │  (Reference)   │  │
              │  └────────────────┘  │
              │  ┌────────────────┐  │
              │  │  weekdaytask   │  │
              │  │  (User Tasks)  │  │
              │  └────────────────┘  │
              └──────────────────────┘
```

## 📊 Data Flow

### 1. Loading Tasks

```
User Opens Page
      ↓
Component ngOnInit()
      ↓
UserService.getUserId()
      ↓
WeekdayTaskService.getTasksByWeekdayRange()
      ↓
SupabaseService.getClient()
      ↓
Supabase Query (SELECT * FROM weekdaytask WHERE...)
      ↓
Return WeekdayTask[]
      ↓
Component.tasks.set(data)
      ↓
Computed: tasksByWeekday()
      ↓
UI Updates (Render Tasks)
```

### 2. Adding Task

```
User Clicks "+ Add"
      ↓
Component.showAddTaskForm(weekdayId)
      ↓
User Fills Form
      ↓
User Clicks "Add Task"
      ↓
Component.addTask()
      ↓
Form Validation
      ↓
WeekdayTaskService.addTask(userId, task)
      ↓
Supabase INSERT
      ↓
Return New Task
      ↓
Component.loadTasks() (Refresh)
      ↓
Toast Success Message
      ↓
UI Updates
```

### 3. Toggling Completion

```
User Clicks Checkbox
      ↓
Component.toggleTaskCompletion(task)
      ↓
WeekdayTaskService.toggleTaskCompletion(taskId, !isCompleted)
      ↓
Supabase UPDATE
      ↓
Return Updated Task
      ↓
Component.loadTasks() (Refresh)
      ↓
Toast Success Message
      ↓
UI Updates (Strikethrough, Opacity)
```

## 🔄 Component Lifecycle

### Week Days Component

```typescript
┌─────────────────────────────────────────┐
│         Component Lifecycle             │
├─────────────────────────────────────────┤
│                                         │
│  constructor()                          │
│    ├─ Initialize FormBuilder           │
│    ├─ Create taskForm                  │
│    └─ Setup validators                 │
│                                         │
│  ngOnInit()                             │
│    ├─ Get userId from UserService      │
│    ├─ Check authentication             │
│    └─ loadTasks()                      │
│         ├─ Call service                │
│         ├─ Set tasks signal            │
│         └─ Trigger computed updates    │
│                                         │
│  User Interactions                      │
│    ├─ toggleDay()                      │
│    ├─ showAddTaskForm()                │
│    ├─ addTask()                        │
│    ├─ showEditTaskForm()               │
│    ├─ updateTask()                     │
│    ├─ toggleTaskCompletion()           │
│    └─ deleteTask()                     │
│                                         │
│  Computed Properties                    │
│    ├─ tasksByWeekday()                 │
│    ├─ totalTasks()                     │
│    ├─ completedTasks()                 │
│    └─ pendingTasks()                   │
│                                         │
└─────────────────────────────────────────┘
```

## 🎯 State Management

### Signals Architecture

```typescript
┌──────────────────────────────────────────┐
│           Component State                │
├──────────────────────────────────────────┤
│                                          │
│  Data Signals (Source of Truth)         │
│  ├─ tasks = signal<WeekdayTask[]>([])   │
│  ├─ selectedTask = signal<Task|null>()  │
│  └─ selectedWeekdayId = signal<num>()   │
│                                          │
│  UI State Signals                        │
│  ├─ isAddingTask = signal(false)        │
│  ├─ isEditingTask = signal(false)       │
│  ├─ isLoading = signal(false)           │
│  ├─ expandedDay = signal<num|null>()    │
│  └─ isDeleteConfirmOpen = signal(false) │
│                                          │
│  Computed Signals (Derived State)       │
│  ├─ tasksByWeekday = computed(() => {   │
│  │    return groupTasksByDay()          │
│  │  })                                  │
│  ├─ totalTasks = computed(() => {       │
│  │    return tasks().length             │
│  │  })                                  │
│  ├─ completedTasks = computed(() => {   │
│  │    return tasks().filter(completed)  │
│  │  })                                  │
│  └─ pendingTasks = computed(() => {     │
│       return tasks().filter(!completed) │
│     })                                  │
│                                          │
└──────────────────────────────────────────┘
```

## 🗄️ Database Schema

### Entity Relationship

```
┌─────────────────┐
│     users       │
│─────────────────│
│ user_id (PK)    │◄─────┐
│ name            │      │
│ email           │      │
│ ...             │      │
└─────────────────┘      │
                         │ FK
                         │
┌─────────────────┐      │
│   weekdays      │      │
│─────────────────│      │
│ weekday_id (PK) │◄─┐   │
│ day_name        │  │   │
└─────────────────┘  │   │
                     │ FK│
                     │   │
┌─────────────────────────┐
│    weekdaytask          │
│─────────────────────────│
│ task_id (PK)            │
│ user_id (FK)            │───┘
│ weekday_id (FK)         │───┘
│ title                   │
│ description             │
│ is_completed            │
│ created_at              │
└─────────────────────────┘
```

### Query Patterns

```sql
-- Get all tasks for user (Week Days: 1-5)
SELECT * FROM weekdaytask
WHERE user_id = $1
  AND weekday_id >= 1
  AND weekday_id <= 5
ORDER BY weekday_id, created_at;

-- Get all tasks for user (Weekend: 6-7)
SELECT * FROM weekdaytask
WHERE user_id = $1
  AND weekday_id >= 6
  AND weekday_id <= 7
ORDER BY weekday_id, created_at;

-- Add task
INSERT INTO weekdaytask (user_id, weekday_id, title, description)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- Toggle completion
UPDATE weekdaytask
SET is_completed = $1
WHERE task_id = $2
RETURNING *;

-- Delete task
DELETE FROM weekdaytask
WHERE task_id = $1;
```

## 🎨 UI Component Tree

### Week Days Page

```
WeekDaysComponent
├─ Header
│  ├─ Title: "Week Days"
│  └─ Statistics Bar
│     ├─ Total Tasks
│     ├─ Completed Tasks
│     └─ Pending Tasks
│
├─ Task Form (Conditional)
│  ├─ Title Input
│  ├─ Description Textarea
│  └─ Action Buttons
│     ├─ Add/Update Button
│     └─ Cancel Button
│
└─ Weekdays Container
   ├─ Monday Card
   │  ├─ Day Header
   │  │  ├─ Day Name
   │  │  ├─ Task Count
   │  │  ├─ Add Button
   │  │  └─ Expand Icon
   │  └─ Tasks List (Expandable)
   │     ├─ Task Item 1
   │     │  ├─ Checkbox
   │     │  ├─ Content (Title + Description)
   │     │  └─ Actions (Edit + Delete)
   │     └─ Task Item 2...
   │
   ├─ Tuesday Card...
   ├─ Wednesday Card...
   ├─ Thursday Card...
   └─ Friday Card...
```

## 🔐 Security Architecture

### Authentication Flow

```
User Login
    ↓
AuthService.login()
    ↓
UserService.setUserId()
    ↓
localStorage.setItem('userId', id)
    ↓
Navigate to Week Days
    ↓
Component.ngOnInit()
    ↓
UserService.getUserId()
    ↓
If userId exists:
    ├─ Load tasks
    └─ Enable features
Else:
    ├─ Show warning
    └─ Redirect to login
```

### Data Access Control

```
Component Request
    ↓
Check UserService.getUserId()
    ↓
If authenticated:
    ├─ Include userId in query
    ├─ Filter by user_id
    └─ Return user's data only
Else:
    └─ Show error + redirect
```

## 📱 Responsive Behavior

### Breakpoint Strategy

```
Mobile First (< 640px)
├─ Single column layout
├─ Full-width cards
├─ Stacked buttons
├─ Reduced padding
└─ Larger touch targets

Tablet (768px+)
├─ Wider containers
├─ More spacing
├─ Side-by-side buttons
└─ Enhanced padding

Desktop (1024px+)
├─ Max-width container
├─ Optimal reading width
├─ Hover effects
└─ Keyboard shortcuts
```

## 🔄 Update Patterns

### Optimistic vs Pessimistic

**Current: Pessimistic (Reload After)**

```
User Action
    ↓
Show Loading
    ↓
API Call
    ↓
Wait for Response
    ↓
Reload All Tasks
    ↓
Update UI
    ↓
Hide Loading
```

**Future: Optimistic (Update Immediately)**

```
User Action
    ↓
Update UI Immediately
    ↓
API Call (Background)
    ↓
If Success: Keep UI
If Error: Revert + Show Error
```

## 🎯 Performance Optimization

### Current Optimizations

```
1. Computed Signals
   └─ Auto-memoization
   └─ Only recompute when dependencies change

2. Efficient Queries
   └─ Filter by weekday range
   └─ Index on user_id + weekday_id

3. Minimal Re-renders
   └─ Signal-based reactivity
   └─ OnPush change detection ready

4. Lazy Loading Ready
   └─ Component-based architecture
   └─ Route-level code splitting
```

## 🧪 Testing Strategy

### Unit Tests (Recommended)

```typescript
// Service Tests
describe('WeekdayTaskService', () => {
  it('should fetch tasks by weekday range');
  it('should add task with correct data');
  it('should toggle task completion');
  it('should delete task');
});

// Component Tests
describe('WeekDaysComponent', () => {
  it('should load tasks on init');
  it('should group tasks by weekday');
  it('should calculate statistics correctly');
  it('should handle form submission');
});
```

### Integration Tests (Recommended)

```typescript
describe('Week Days Flow', () => {
  it('should add task and see it in list');
  it('should edit task and see changes');
  it('should complete task and update stats');
  it('should delete task and remove from list');
});
```

## 📊 Monitoring Points

### Key Metrics to Track

```
Performance
├─ Page load time
├─ API response time
├─ UI interaction latency
└─ Bundle size

Usage
├─ Tasks created per user
├─ Completion rate
├─ Most used weekdays
└─ Average tasks per day

Errors
├─ API failures
├─ Form validation errors
├─ Authentication issues
└─ Network timeouts
```

## 🚀 Deployment Architecture

```
Development
    ↓
Build (npm run build)
    ↓
Generate Static Files
    ↓
Deploy to Hosting
    │
    ├─ Netlify
    ├─ Vercel
    ├─ Firebase Hosting
    └─ AWS S3 + CloudFront
    │
    ↓
Connect to Supabase
    │
    └─ Environment Variables
        ├─ SUPABASE_URL
        └─ SUPABASE_KEY
```

## ✅ Architecture Benefits

### Scalability

- ✅ Component-based (easy to extend)
- ✅ Service layer (reusable logic)
- ✅ Signal-based (efficient updates)
- ✅ Database-backed (unlimited tasks)

### Maintainability

- ✅ Clear separation of concerns
- ✅ TypeScript type safety
- ✅ Consistent patterns
- ✅ Well-documented

### Performance

- ✅ Optimized queries
- ✅ Computed signals
- ✅ Minimal re-renders
- ✅ Lazy loading ready

### User Experience

- ✅ Fast interactions
- ✅ Smooth animations
- ✅ Clear feedback
- ✅ Mobile-optimized

---

**Architecture Version**: 1.0.0  
**Last Updated**: 2026-04-24  
**Status**: ✅ Production Ready
