# Weekday Tasks - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create weekdays reference table
CREATE TABLE weekdays (
    weekday_id SMALLINT PRIMARY KEY,
    day_name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO weekdays (weekday_id, day_name) VALUES
(1,'Monday'), (2,'Tuesday'), (3,'Wednesday'),
(4,'Thursday'), (5,'Friday'), (6,'Saturday'), (7,'Sunday');

-- Create weekday tasks table
CREATE TABLE weekdaytask (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    weekday_id SMALLINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_weekday
        FOREIGN KEY (weekday_id)
        REFERENCES weekdays(weekday_id)
);
```

### Step 2: Add Routes

Update `src/app/app.routes.ts`:

```typescript
import { WeekDays } from './components/week-days/week-days';
import { WeekendDays } from './components/weekend-days/weekend-days';

export const routes: Routes = [
  // ... your existing routes
  {
    path: 'week-days',
    component: WeekDays,
    canActivate: [authGuard], // Protect with auth guard
  },
  {
    path: 'weekend-days',
    component: WeekendDays,
    canActivate: [authGuard], // Protect with auth guard
  },
];
```

### Step 3: Add Navigation

Update your navigation component (e.g., `home.html` or sidebar):

```html
<!-- In your navigation menu -->
<button class="nav-btn" (click)="navigateTo('/week-days')">Week Days</button>
<button class="nav-btn" (click)="navigateTo('/weekend-days')">Weekend</button>
```

## ✅ That's It!

Your weekday task planner is now ready to use!

## 🧪 Test the Features

### 1. Navigate to Week Days

- Go to `/week-days` route
- You should see Monday through Friday

### 2. Add a Task

- Click the **+** button on any day header
- Fill in task title (required)
- Add description (optional)
- Click "Add Task"

### 3. Manage Tasks

- **Complete**: Click the checkbox
- **Edit**: Click the edit icon
- **Delete**: Click the delete icon (with confirmation)

### 4. Navigate to Weekend

- Go to `/weekend-days` route
- You should see Saturday and Sunday
- Same features as weekdays

## 📱 Mobile Testing

Test on mobile devices or use browser DevTools:

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device
4. Test all features

## 🎯 What You Can Do

### Week Days Component

- ✅ View tasks for Monday-Friday
- ✅ Add tasks to specific weekdays
- ✅ Edit task title and description
- ✅ Mark tasks as complete/incomplete
- ✅ Delete tasks
- ✅ See task statistics (Total, Done, Pending)
- ✅ Expand/collapse days

### Weekend Component

- ✅ View tasks for Saturday-Sunday
- ✅ Same features as Week Days
- ✅ Different color scheme (orange)

## 🎨 UI Features

### Statistics Bar

Shows at the top:

- **Total**: All tasks
- **Done**: Completed tasks (green)
- **Pending**: Incomplete tasks (orange)

### Day Cards

- **Header**: Day name + task count + add button
- **Expandable**: Click to show/hide tasks
- **Color-coded**: Purple for weekdays, Orange for weekend

### Task Items

- **Checkbox**: Toggle completion
- **Title**: Task name (bold)
- **Description**: Task details (if provided)
- **Actions**: Edit and Delete buttons

## 🔍 Troubleshooting

### "Please log in to view tasks"

- You need to log in first
- Check that user data is in localStorage
- Verify `UserService.getUserId()` returns a value

### Tasks Not Showing

- Check browser console for errors
- Verify database tables exist
- Check Supabase connection
- Ensure you're logged in

### Can't Add Tasks

- Check form validation (title required)
- Verify you're logged in
- Check browser console for errors

## 💡 Tips

### Best Practices

1. **Plan Weekly**: Add tasks at the start of each week
2. **Be Specific**: Use clear, actionable task titles
3. **Add Details**: Use descriptions for complex tasks
4. **Check Daily**: Review and complete tasks each day
5. **Clean Up**: Delete completed tasks regularly

### Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Enter**: Submit form
- **Escape**: Close modals (if implemented)

## 📊 Example Usage

### Monday Morning Routine

```
✅ Team standup meeting
✅ Review emails
✅ Plan week priorities
□ Start project documentation
```

### Weekend Plans

```
□ Grocery shopping
□ Gym workout
□ Read book chapter
□ Meal prep for week
```

## 🎉 You're All Set!

Start planning your week with your new task manager!

### Quick Links

- **Full Documentation**: `WEEKDAY_TASKS_IMPLEMENTATION.md`
- **Database Schema**: See Step 1 above
- **Component Details**: Check implementation guide

### Need Help?

1. Check browser console for errors
2. Verify database setup
3. Ensure user is logged in
4. Review implementation guide

---

**Status**: ✅ Ready to Use  
**Build**: ✅ Successful  
**Mobile**: ✅ Optimized
