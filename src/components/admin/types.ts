
export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingRequests: number;
}

export interface AdminButton {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  permissions: any;
  is_active: boolean;
  sort_order: number;
}
