export interface ServiceCategory {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceCategoryRequest {
  name: string;
  active?: boolean;
}

export interface UpdateServiceCategoryRequest {
  id: string;
  name?: string;
  active?: boolean;
}
