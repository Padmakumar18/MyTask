import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Skill, SkillStatus } from '../../models/skill.model';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-skills',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills {
  skills = signal<Skill[]>([]);
  isAddingSkill = signal(false);
  isEditingSkill = signal(false);
  selectedSkill = signal<Skill | null>(null);
  skillToDelete = signal<string | null>(null);
  isDeleteSkillConfirmOpen = signal(false);

  skillForm: FormGroup;

  pendingSkills = computed(() => this.skills().filter((s) => s.status === 'Pending'));
  completedSkills = computed(() => this.skills().filter((s) => s.status === 'Completed'));

  constructor(private fb: FormBuilder) {
    this.skillForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      whereToLearn: ['', [Validators.required, Validators.minLength(5)]],
    });
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

  addSkill() {
    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.skillForm.value;
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: formValue.name.trim(),
      whereToLearn: formValue.whereToLearn.trim(),
      status: 'Pending',
      createdAt: new Date(),
    };

    this.skills.update((skills) => [...skills, newSkill]);
    this.isAddingSkill.set(false);
    this.skillForm.reset();
    toast.success('Skill added successfully!');
  }

  showEditSkillForm(skill: Skill) {
    this.selectedSkill.set(skill);
    this.isEditingSkill.set(true);
    this.isAddingSkill.set(true);
    this.skillForm.patchValue({
      name: skill.name,
      whereToLearn: skill.whereToLearn,
    });
  }

  updateSkill() {
    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const skillId = this.selectedSkill()?.id;
    if (!skillId) return;

    const formValue = this.skillForm.value;
    this.skills.update((skills) =>
      skills.map((skill) =>
        skill.id === skillId
          ? {
              ...skill,
              name: formValue.name.trim(),
              whereToLearn: formValue.whereToLearn.trim(),
            }
          : skill,
      ),
    );

    this.isAddingSkill.set(false);
    this.isEditingSkill.set(false);
    this.selectedSkill.set(null);
    this.skillForm.reset();
    toast.success('Skill updated successfully!');
  }

  showDeleteSkillConfirmation(skillId: string) {
    this.skillToDelete.set(skillId);
    this.isDeleteSkillConfirmOpen.set(true);
  }

  cancelDeleteSkill() {
    this.isDeleteSkillConfirmOpen.set(false);
    this.skillToDelete.set(null);
  }

  confirmDeleteSkill() {
    const skillId = this.skillToDelete();
    if (skillId) {
      const skill = this.skills().find((s) => s.id === skillId);
      this.skills.update((skills) => skills.filter((skill) => skill.id !== skillId));
      if (skill) {
        toast.success('Skill deleted successfully!');
      }
    }
    this.isDeleteSkillConfirmOpen.set(false);
    this.skillToDelete.set(null);
  }

  deleteSkill(skillId: string) {
    this.showDeleteSkillConfirmation(skillId);
  }

  updateSkillStatus(skillId: string, newStatus: SkillStatus) {
    const skill = this.skills().find((s) => s.id === skillId);
    this.skills.update((skills) =>
      skills.map((skill) => (skill.id === skillId ? { ...skill, status: newStatus } : skill)),
    );
    if (skill) {
      toast.success(`Skill moved to ${newStatus}!`);
    }
  }

  toggleSkillStatus(skillId: string) {
    const skill = this.skills().find((s) => s.id === skillId);
    if (skill) {
      const newStatus: SkillStatus = skill.status === 'Pending' ? 'Completed' : 'Pending';
      this.updateSkillStatus(skillId, newStatus);
    }
  }
}
