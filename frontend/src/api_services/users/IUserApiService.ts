import type { User } from '../../models/users/User';

import type { UpdateUserRequest } from '../../types/users/UpdateUserRequest';
import type { ChangePasswordRequest } from '../../types/users/ChangePasswordRequest';

export interface IUserApiService {
  getMe(): Promise<User>;

  updateMe(
    request: UpdateUserRequest
  ): Promise<User>;

  changePassword(
    request: ChangePasswordRequest
  ): Promise<void>;

  getAllUsers(): Promise<User[]>;

  deactivateUser(userId: string): Promise<void>;

  activateUser(userId: string): Promise<void>;

  adminRemoveJobListing(jobId: string): Promise<void>;
  getUserById(userId: string): Promise<User>;

}