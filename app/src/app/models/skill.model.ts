export type SkillStatus = 'Pending' | 'Completed';

export interface Skill {
  id: string;
  name: string;
  whereToLearn: string;
  status: SkillStatus;
  createdAt: Date;
}
