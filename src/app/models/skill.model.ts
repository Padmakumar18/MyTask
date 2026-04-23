export interface Skill {
  skill_id: string;
  user_id: string;
  skill_name: string;
  where_to_learn: string | null;
  created_at: string;
}

export interface CreateSkill {
  skill_name: string;
  where_to_learn?: string;
}

export interface UpdateSkill {
  skill_name?: string;
  where_to_learn?: string;
}
