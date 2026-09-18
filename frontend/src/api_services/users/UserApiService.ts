import api from '../axios/AxiosInstance';

import type { User } from '../../models/users/User';
import type { IUserApiService } from './IUserApiService';

export const userApi: IUserApiService = {
  async getMe() {
    return (
      await api.get<User>('/users/me')
    ).data;
  },

  async updateMe(request) {
    return (
      await api.put<User>(
        '/users/me',
        request
      )
    ).data;
  },

  async changePassword(request) {
    await api.patch(
      '/users/me/password',
      request
    );
  },

  async getAllUsers() {
    return (
      await api.get<User[]>('/users')
    ).data;
  },

  async deactivateUser(userId) {
    await api.patch(
      `/users/${userId}/deactivate`
    );
  },

  async activateUser(userId) {
    await api.patch(
      `/users/${userId}/activate`
    );
  },

  async adminRemoveJobListing(jobId) {
    await api.delete(
      `/users/${jobId}/remove-job-listing`
    );
  },
  async getUserById(userId) {
    return (
      await api.get<User>(`/users/${userId}`)
    ).data;
  }
};