import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { Skill, CreateSkill, UpdateSkill } from '../../models/skill.model';

@Injectable({
  providedIn: 'root',
})
export class SkillsService {
  constructor(private supabaseService: SupabaseService) {}

  async getSkills(userId: string): Promise<Skill[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as Skill[];
  }

  async addSkill(userId: string, skill: CreateSkill): Promise<Skill> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('skills')
      .insert([
        {
          user_id: userId,
          skill_name: skill.skill_name,
          where_to_learn: skill.where_to_learn || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Skill;
  }

  async updateSkill(skillId: string, updates: UpdateSkill): Promise<Skill> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updates.skill_name !== undefined) updateData.skill_name = updates.skill_name;
    if (updates.where_to_learn !== undefined) updateData.where_to_learn = updates.where_to_learn;

    const { data, error } = await supabase
      .from('skills')
      .update(updateData)
      .eq('skill_id', skillId)
      .select()
      .single();

    if (error) throw error;

    return data as Skill;
  }

  async deleteSkill(skillId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('skills').delete().eq('skill_id', skillId);

    if (error) throw error;
  }
}
