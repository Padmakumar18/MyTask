import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SkillsService } from '../../services/core/skills.service';
import { Skill } from '../../models/skill.model';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';

// UI-friendly skill interface for template
interface SkillUI {
  id: string;
  name: string;
  whereToLearn: string;
  status: 'Pending' | 'Completed';
  createdAt: Date;
}

@Component({
  selector: 'app-skills',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills implements OnInit {
  private rawSkills = signal<Skill[]>([]);
  isAddingSkill = signal(false);
  isEditingSkill = signal(false);
  selectedSkill = signal<SkillUI | null>(null);
  skillToDelete = signal<string | null>(null);
  isDeleteSkillConfirmOpen = signal(false);
  isLoading = signal(false);

  skillForm: FormGroup;

  private fb = inject(FormBuilder);
  private skillsService = inject(SkillsService);
  private userService = inject(UserService);

  // Transform database skills to UI-friendly format
  skills = computed(() => {
    return this.rawSkills().map((skill) => this.transformSkillToUI(skill));
  });

  // Computed properties for pending and completed skills
  pendingSkills = computed(() => this.skills().filter((s) => s.status === 'Pending'));
  completedSkills = computed(() => this.skills().filter((s) => s.status === 'Completed'));

  constructor() {
    this.skillForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      whereToLearn: [''],
    });
  }

  private transformSkillToUI(skill: Skill): SkillUI {
    return {
      id: skill.skill_id,
      name: skill.skill_name,
      whereToLearn: skill.where_to_learn || '',
      status: skill.status, // Use actual status from database
      createdAt: new Date(skill.created_at),
    };
  }

  async ngOnInit() {
    // Get userId from UserService
    const userId = this.userService.getUserId();
    if (userId) {
      // console.log('Skills - User ID loaded:', userId);
      await this.loadSkills();
    } else {
      console.warn('Skills - No user found');
      toast.warning('Please log in to manage skills');
    }
  }

  async loadSkills() {
    const userId = this.userService.getUserId();
    if (!userId) return;

    this.isLoading.set(true);
    try {
      const skills = await this.skillsService.getSkills(userId);
      this.rawSkills.set(skills);
    } catch (error) {
      toast.error('Failed to load skills');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showAddSkillForm() {
    this.isAddingSkill.set(true);
    this.isEditingSkill.set(false);
    this.selectedSkill.set(null);
    this.skillForm.reset();
  }

  cancelSkillForm() {
    this.isAddingSkill.set(false);
    this.isEditingSkill.set(false);
    this.selectedSkill.set(null);
    this.skillForm.reset();
  }

  async addSkill() {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.skillForm.value;
      await this.skillsService.addSkill(userId, {
        skill_name: formValue.name.trim(),
        where_to_learn: formValue.whereToLearn?.trim() || undefined,
        status: 'Pending', // Default status
      });

      await this.loadSkills();
      this.isAddingSkill.set(false);
      this.skillForm.reset();
      toast.success('Skill added successfully!');
    } catch (error) {
      toast.error('Failed to add skill');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showEditSkillForm(skill: SkillUI) {
    this.selectedSkill.set(skill);
    this.isEditingSkill.set(true);
    this.isAddingSkill.set(true);
    this.skillForm.patchValue({
      name: skill.name,
      whereToLearn: skill.whereToLearn || '',
    });
  }

  async updateSkill() {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const skillId = this.selectedSkill()?.id;
    if (!skillId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.skillForm.value;
      await this.skillsService.updateSkill(skillId, {
        skill_name: formValue.name.trim(),
        where_to_learn: formValue.whereToLearn?.trim() || undefined,
      });

      await this.loadSkills();
      this.isAddingSkill.set(false);
      this.isEditingSkill.set(false);
      this.selectedSkill.set(null);
      this.skillForm.reset();
      toast.success('Skill updated successfully!');
    } catch (error) {
      toast.error('Failed to update skill');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showDeleteSkillConfirmation(skillId: string) {
    this.skillToDelete.set(skillId);
    this.isDeleteSkillConfirmOpen.set(true);
  }

  cancelDeleteSkill() {
    this.isDeleteSkillConfirmOpen.set(false);
    this.skillToDelete.set(null);
  }

  async confirmDeleteSkill() {
    const skillId = this.skillToDelete();
    if (!skillId) return;

    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.skillsService.deleteSkill(skillId);
      await this.loadSkills();
      toast.success('Skill deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete skill');
      console.error(error);
    } finally {
      this.isLoading.set(false);
      this.isDeleteSkillConfirmOpen.set(false);
      this.skillToDelete.set(null);
    }
  }

  deleteSkill(skillId: string) {
    this.showDeleteSkillConfirmation(skillId);
  }

  async toggleSkillStatus(skillId: string) {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    const skill = this.skills().find((s) => s.id === skillId);
    if (!skill) return;

    const newStatus: 'Pending' | 'Completed' = skill.status === 'Pending' ? 'Completed' : 'Pending';

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
}
