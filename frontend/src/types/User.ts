export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role_type: string;
  avatar_url: string | null;
  face_descriptor?: string;
  nisn?: string;
  nis?: string;
  gender?: string;
  birth_place?: string;
  birth_date?: string;
  behavior_points?: number;
  class_name?: string;
  major_name?: string;
  academic_year?: string;
  
  // Guru Specific Fields
  nip_nuptk?: string;
  subjects?: string;
  homeroom_class?: string;
  structural_roles?: string;
}
