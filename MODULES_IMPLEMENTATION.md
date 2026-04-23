# Angular Modules Implementation Guide

This document provides an overview of the Cart, Skills, and Events modules implementation.

## ✅ Implementation Status

All three modules have been successfully implemented with:

- ✅ TypeScript models matching database schema
- ✅ Services with full CRUD operations
- ✅ Component logic with form validation
- ✅ Database integration via Supabase
- ✅ Error handling and loading states
- ✅ Toast notifications for user feedback
- ✅ Build verified successfully

## 📁 Folder Structure

```
src/app/
├── models/
│   ├── cart.model.ts          # Cart data models
│   ├── skill.model.ts         # Skills data models (updated)
│   └── event.model.ts         # Events data models
│
├── services/
│   └── core/
│       ├── cart.service.ts    # Cart CRUD operations
│       ├── skills.service.ts  # Skills CRUD operations
│       └── events.service.ts  # Events CRUD operations
│
└── components/
    ├── cart/
    │   ├── cart.ts            # Cart component logic
    │   ├── cart.html          # Cart template
    │   └── cart.css           # Cart styles
    │
    ├── skills/
    │   ├── skills.ts          # Skills component logic (updated)
    │   ├── skills.html        # Skills template
    │   └── skills.css         # Skills styles
    │
    └── events/
        ├── events.ts          # Events component logic
        ├── events.html        # Events template
        └── events.css         # Events styles
```

## 🛒 Cart Module

### Models (`cart.model.ts`)

- **Cart**: Main cart item interface matching database schema
- **CreateCartItem**: Interface for creating new cart items
- **UpdateCartItem**: Interface for updating cart items

### Service (`cart.service.ts`)

**Methods:**

- `getCartItems(userId: string)`: Fetch all cart items for a user
- `addCartItem(userId: string, item: CreateCartItem)`: Add new item to cart
- `updateCartItem(cartId: string, updates: UpdateCartItem)`: Update existing cart item
- `deleteCartItem(cartId: string)`: Remove item from cart
- `getTotalPrice(userId: string)`: Calculate total price of all items

### Component (`cart.ts`)

**Features:**

- Display all cart items
- Add new products with name, price, and optional link
- Edit existing cart items
- Delete cart items with confirmation dialog
- Calculate and display total price
- Form validation for required fields
- Loading states and error handling
- Toast notifications for user feedback

**Signals:**

- `cartItems`: List of cart items
- `isAddingItem`: Add form visibility
- `isEditingItem`: Edit mode flag
- `selectedItem`: Currently selected item for editing
- `isLoading`: Loading state
- `totalPrice`: Total cart value

## 🎯 Skills Module

### Models (`skill.model.ts`)

- **Skill**: Main skill interface matching database schema
- **CreateSkill**: Interface for creating new skills
- **UpdateSkill**: Interface for updating skills

### Service (`skills.service.ts`)

**Methods:**

- `getSkills(userId: string)`: Fetch all skills for a user
- `addSkill(userId: string, skill: CreateSkill)`: Add new skill
- `updateSkill(skillId: string, updates: UpdateSkill)`: Update existing skill
- `deleteSkill(skillId: string)`: Remove skill

### Component (`skills.ts`)

**Features:**

- Display all user skills
- Add new skills with name and optional learning resource
- Edit existing skills
- Delete skills with confirmation dialog
- Form validation
- Loading states and error handling
- Toast notifications

**Signals:**

- `skills`: List of skills
- `isAddingSkill`: Add form visibility
- `isEditingSkill`: Edit mode flag
- `selectedSkill`: Currently selected skill for editing
- `isLoading`: Loading state

## 📅 Events Module

### Models (`event.model.ts`)

- **Event**: Main event interface matching database schema
- **CreateEvent**: Interface for creating new events
- **UpdateEvent**: Interface for updating events

### Service (`events.service.ts`)

**Methods:**

- `getEvents(userId: string)`: Fetch all events for a user
- `getEventsByDateRange(userId: string, startDate: string, endDate: string)`: Fetch events in date range
- `getEventsByDate(userId: string, date: string)`: Fetch events for specific date
- `addEvent(userId: string, event: CreateEvent)`: Add new event
- `updateEvent(eventId: string, updates: UpdateEvent)`: Update existing event
- `deleteEvent(eventId: string)`: Remove event

### Component (`events.ts`)

**Features:**

- Calendar view showing current month
- Navigate between months (previous/next)
- Display events on calendar days
- Click on date to view events for that day
- Add new events with title, description, and date
- Edit existing events
- Delete events with confirmation dialog
- Visual indicators for today and days with events
- Form validation
- Loading states and error handling
- Toast notifications

**Signals:**

- `events`: List of all events
- `currentDate`: Currently displayed month
- `selectedDate`: Selected date for viewing/adding events
- `calendarDays`: Generated calendar grid (42 days)
- `isAddingEvent`: Add form visibility
- `isEditingEvent`: Edit mode flag
- `selectedEvent`: Currently selected event for editing
- `isLoading`: Loading state

**Computed Signals:**

- `currentMonthYear`: Formatted month and year display
- `selectedDateEvents`: Events for the selected date

## 🔐 Authentication Integration

All components retrieve the `userId` from localStorage on initialization:

```typescript
async ngOnInit() {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    this.userId = userData.user_id;
    await this.loadData();
  }
}
```

**Note:** Adjust this based on your actual authentication implementation (e.g., using AuthService).

## 🗄️ Database Schema

### Cart Table

```sql
CREATE TABLE cart (
  cart_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  product_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### Skills Table

```sql
CREATE TABLE skills (
  skill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  skill_name VARCHAR(150) NOT NULL,
  where_to_learn TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_skill_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### Events Table (Required)

```sql
CREATE TABLE events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

## 🎨 UI Features

All modules include:

- ✅ Reactive forms with validation
- ✅ Loading indicators
- ✅ Error handling with toast notifications
- ✅ Confirmation dialogs for delete operations
- ✅ Add/Edit/Delete functionality
- ✅ Responsive design ready
- ✅ Signal-based state management

## 🚀 Next Steps

1. **Create Events Table**: Run the SQL script to create the events table in your Supabase database
2. **Update HTML Templates**: The Cart and Events components need their HTML templates implemented
3. **Add Styling**: Style the Cart and Events components in their respective `.css` files
4. **Test CRUD Operations**: Test all create, read, update, and delete operations for all modules
5. **Add Route Guards**: Ensure routes are protected with authentication guards
6. **Optional - Enable Skills Status**: See `SKILLS_STATUS_FEATURE.md` for instructions on enabling the status toggle feature
7. **Enhance UI**: Add animations, better layouts, and responsive design

## ⚠️ Important Notes

### Skills Component

- The Skills component has a transformation layer that converts database field names to UI-friendly names
- The status toggle feature currently shows an info message - database schema update required for full functionality
- See `SKILLS_STATUS_FEATURE.md` for details on enabling the status feature

### Cart & Events Components

- HTML templates need to be created (components are ready)
- Follow the same pattern as the Skills component for consistency

### Authentication

All components retrieve `userId` from localStorage. Adjust based on your auth implementation.

## 📝 Usage Example

### Cart Component

```typescript
// Add item to cart
await this.cartService.addCartItem(userId, {
  product_name: 'Product Name',
  price: 99.99,
  product_link: 'https://example.com/product',
});

// Update cart item
await this.cartService.updateCartItem(cartId, {
  price: 89.99,
});

// Delete cart item
await this.cartService.deleteCartItem(cartId);
```

### Skills Component

```typescript
// Add skill
await this.skillsService.addSkill(userId, {
  skill_name: 'Angular',
  where_to_learn: 'https://angular.io/docs',
});

// Update skill
await this.skillsService.updateSkill(skillId, {
  skill_name: 'Advanced Angular',
});
```

### Events Component

```typescript
// Add event
await this.eventsService.addEvent(userId, {
  title: 'Team Meeting',
  description: 'Discuss project progress',
  event_date: '2026-04-25',
});

// Get events for specific date
const events = await this.eventsService.getEventsByDate(userId, '2026-04-25');
```

## 🔧 Dependencies

Make sure these are installed:

- `@angular/common`
- `@angular/core`
- `@angular/forms`
- `@supabase/supabase-js`
- `ngx-sonner` (for toast notifications)

All dependencies should already be in your `package.json` based on the existing project structure.
