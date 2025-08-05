export interface ServiceCategory {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceCategoryRequest {
  name: string;
  active?: boolean;
}
