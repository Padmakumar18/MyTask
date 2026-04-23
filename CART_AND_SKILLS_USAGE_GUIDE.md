# Cart and Skills Usage Guide

## ✅ Implementation Complete

Both Cart and Skills modules are now fully functional with complete UI and database integration!

## 🛒 Cart Module - How to Use

### Adding Items to Cart

1. Navigate to the Cart page
2. Click the **"Add Item"** button in the top right
3. Fill in the form:
   - **Product Name** (required): Name of the product
   - **Price** (required): Product price (must be 0 or greater)
   - **Product Link** (optional): URL to the product page
4. Click **"Add Item"** to save

### Viewing Cart Items

- All cart items are displayed in a grid layout
- Each card shows:
  - Product name
  - Price
  - Link to product (if provided)
  - Date added
- **Cart Summary** at the top shows:
  - Total number of items
  - Total price of all items

### Editing Cart Items

1. Click the **"Edit"** button on any cart item card
2. Modify the fields you want to change
3. Click **"Update Item"** to save changes
4. Click **"Cancel"** to discard changes

### Removing Items from Cart

1. Click the **"Remove"** button on any cart item card
2. A confirmation dialog will appear
3. Click **"Remove"** to confirm deletion
4. Click **"Cancel"** to keep the item

## 🎯 Skills Module - How to Use

### Adding Skills

1. Navigate to the Skills page
2. Click the **"Add Skill"** button in the top right
3. Fill in the form:
   - **Skill Name** (required): Name of the skill (minimum 2 characters)
   - **Where to Learn** (optional): Resource or platform to learn the skill
4. Click **"Add Skill"** to save

### Viewing Skills

- Skills are organized into two sections:
  - **Pending Skills**: Skills you're currently learning or plan to learn
  - **Completed Skills**: Skills you've mastered
- Each skill card shows:
  - Skill name
  - Where to learn information
  - Status badge (Pending/Completed)
  - Date added

### Editing Skills

1. Click the **"Edit"** button on any skill card
2. Modify the skill name or learning resource
3. Click **"Update Skill"** to save changes
4. Click **"Cancel"** to discard changes

### Deleting Skills

1. Click the **"Delete"** button on any skill card
2. A confirmation dialog will appear
3. Click **"Delete"** to confirm removal
4. Click **"Cancel"** to keep the skill

### Marking Skills as Complete/Pending

1. Click the **"Mark Complete"** button on a pending skill
2. Or click **"Mark Pending"** on a completed skill
3. **Note**: This feature currently shows an info message
4. To enable full functionality, see `SKILLS_STATUS_FEATURE.md`

## 🔐 Authentication Required

Both modules require user authentication:

- User must be logged in to access these features
- User ID is retrieved from localStorage
- Each user can only see and manage their own cart items and skills

## 📊 Database Tables Required

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

## 🎨 Features

### Cart Module Features

✅ Add products with name, price, and optional link  
✅ View all cart items in a grid layout  
✅ Edit existing cart items  
✅ Delete cart items with confirmation  
✅ Calculate and display total price  
✅ Form validation for required fields  
✅ Loading states during operations  
✅ Toast notifications for user feedback  
✅ Responsive design for mobile devices

### Skills Module Features

✅ Add skills with name and optional learning resource  
✅ View skills organized by status (Pending/Completed)  
✅ Edit existing skills  
✅ Delete skills with confirmation  
✅ Form validation for required fields  
✅ Loading states during operations  
✅ Toast notifications for user feedback  
✅ Responsive design for mobile devices  
✅ Status toggle (requires database update - see note below)

## ⚠️ Important Notes

### Skills Status Feature

The Skills component displays all skills as "Pending" by default since the database schema doesn't include a status column. The "Mark Complete" / "Mark Pending" buttons currently show an info message.

**To enable full status functionality:**

1. Add a `status` column to the skills table
2. Update the models and service
3. See `SKILLS_STATUS_FEATURE.md` for detailed instructions

### Form Validation

Both modules include client-side validation:

- Required fields are marked with an asterisk (\*)
- Error messages appear when validation fails
- Submit buttons are disabled when forms are invalid
- All fields are validated on blur and submit

### Error Handling

- All database operations include try-catch error handling
- User-friendly error messages via toast notifications
- Loading states prevent duplicate submissions
- Confirmation dialogs for destructive actions

## 🚀 Testing the Features

### Test Cart Module

1. Log in to your application
2. Navigate to the Cart page
3. Add a few test items with different prices
4. Verify the total price calculation
5. Edit an item and verify changes are saved
6. Delete an item and verify it's removed
7. Check that the cart summary updates correctly

### Test Skills Module

1. Log in to your application
2. Navigate to the Skills page
3. Add several skills with different names
4. Verify skills appear in the Pending section
5. Edit a skill and verify changes are saved
6. Delete a skill and verify it's removed
7. Try the status toggle (will show info message)

## 📱 Responsive Design

Both modules are fully responsive:

- **Desktop**: Grid layout with multiple columns
- **Tablet**: Adjusted grid with fewer columns
- **Mobile**: Single column layout with stacked cards
- All buttons and forms adapt to screen size

## 🎯 Next Steps

1. ✅ Cart module is fully functional
2. ✅ Skills module is fully functional
3. ⏳ Events module needs HTML template (component logic is ready)
4. ⏳ Optional: Enable skills status feature (see `SKILLS_STATUS_FEATURE.md`)
5. ⏳ Add custom styling/branding if desired
6. ⏳ Test with real user data

## 💡 Tips

- Use meaningful product names and skill names for better organization
- Add product links to easily access items later
- Include learning resources for skills to track where you're studying
- Regularly review and update your cart and skills
- Use the delete confirmation carefully - deletions cannot be undone

## 🐛 Troubleshooting

### Cart items not loading

- Check that you're logged in
- Verify the cart table exists in your database
- Check browser console for errors
- Ensure user_id is correctly stored in localStorage

### Skills not loading

- Check that you're logged in
- Verify the skills table exists in your database
- Check browser console for errors
- Ensure user_id is correctly stored in localStorage

### Form validation errors

- Ensure all required fields are filled
- Check that price is a valid number (0 or greater)
- Verify skill name is at least 2 characters
- Check that product link is a valid URL (if provided)

### Status toggle not working

- This is expected behavior - see `SKILLS_STATUS_FEATURE.md`
- Database schema update required for full functionality
