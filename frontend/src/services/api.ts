import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
});

export const studentApi = {
  register: (formData: FormData) => {
    // Note: Do not manually set 'Content-Type': 'multipart/form-data'. 
    // Axios will automatically set it along with the required boundary when it detects FormData.
    return api.post('/students/register', formData);
  },
};

export const adminApi = {
  getStudents: () => {
    return api.get('/admins/students');
  },
  approveStudent: (studentId: string, credentials: any) => {
    return api.post(`/admins/students/${studentId}/approve`, credentials);
  },
  rejectStudent: (studentId: string) => {
    return api.post(`/admins/students/${studentId}/reject`);
  },
};
