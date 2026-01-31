

export interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface ApiResponse {
  status: number;
  contentType: string;
  data: any;
}

export interface Endpoint {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  title: string;
  description: string;
  pathParameters?: Parameter[];
  getParameters?: Parameter[];
  response: ApiResponse;
}

export interface NavSection {
  title: string;
  id: string;
  items?: { title: string; id: string; method?: string }[];
}
