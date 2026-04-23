# Skills Status Feature - Optional Enhancement

## Current Implementation

The Skills component currently displays all skills as "Pending" by default since the database schema doesn't include a status column.

## To Enable Status Toggle Feature

If you want to enable the "Mark Complete" / "Mark Pending" functionality shown in the UI, you need to update your database schema:

### 1. Add Status Column to Skills Table

```sql
ALTER TABLE skills
ADD COLUMN status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed'));
```

### 2. Update the Skill Model

Update `src/app/models/skill.model.ts`:

```typescript
export interface Skill {
  skill_id: string;
  user_id: string;
  skill_name: string;
  where_to_learn: string | null;
  status?: 'Pending' | 'Completed'; // Add this line
  created_at: string;
}

export interface CreateSkill {
  skill_name: string;
  where_to_learn?: string;
  status?: 'Pending' | 'Completed'; // Add this line
}

export interface UpdateSkill {
  skill_name?: string;
  where_to_learn?: string;
  status?: 'Pending' | 'Completed'; // Add this line
}
```

### 3. Add Status Update Method to Service

Update `src/app/services/core/skills.service.ts`:

```typescript
async updateSkillStatus(skillId: string, status: 'Pending' | 'Completed'): Promise<Skill> {
  const supabase = this.supabaseService.getClient();

  const { data, error } = await supabase
    .from('skills')
    .update({ status })
    .eq('skill_id', skillId)
    .select()
    .single();

  if (error) throw error;

  return data as Skill;
}
```

### 4. Update Component Logic

Update the `transformSkillToUI` method in `src/app/components/skills/skills.ts`:

```typescript
private transformSkillToUI(skill: Skill): SkillUI {
  return {
    id: skill.skill_id,
    name: skill.skill_name,
    whereToLearn: skill.where_to_learn || '',
    status: skill.status || 'Pending',  // Use actual status from database
    createdAt: new Date(skill.created_at),
  };
}
```

And update the `toggleSkillStatus` method:

```typescript
async toggleSkillStatus(skillId: string) {
  const skill = this.skills().find((s) => s.id === skillId);
  if (!skill) return;

  const newStatus: 'Pending' | 'Completed' =
    skill.status === 'Pending' ? 'Completed' : 'Pending';

  this.isLoading.set(true);
  try {
    await this.skillsService.updateSkillStatus(skillId, newStatus);
    await this.loadSkills();
    toast.success(`Skill marked as ${newStatus}!`);
  } catch (error) {
    toast.error('Failed to update skill status');
    console.error(error);
  } finally {
    this.isLoading.set(false);
  }
}
```

## Alternative: Remove Status Feature from UI

If you don't need the status feature, you can simplify the UI by:

1. Removing the "Pending Skills" and "Completed Skills" sections
2. Displaying all skills in a single list
3. Removing the "Mark Complete" / "Mark Pending" buttons

This would make the UI simpler and match the current database schema without modifications.
