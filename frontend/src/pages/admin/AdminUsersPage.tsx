import { useEffect, useState } from 'react';

import { userApi } from '../../api_services/users/UserApiService';

import type { User } from '../../models/users/User';

import { Role } from '../../models/auth/Role';

import AdminLayout from '../../components/admin/AdminLayout';
import AdminUserCard from '../../components/admin/AdminUserCard';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');

  const [statusFilter, setStatusFilter] =
    useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const [usersData, currentUser] = await Promise.all([
          userApi.getAllUsers(),
          userApi.getMe(),
        ]);

        if (active) {
          setUsers(usersData);
          setCurrentUserId(currentUser.id);
        }
      } catch {
        if (active) {
          setError('Users could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const handleToggleStatus = async (selectedUser: User) => {
    if (
      updatingId !== null ||
      selectedUser.id === currentUserId
    ) {
      return;
    }

    try {
      setUpdatingId(selectedUser.id);
      setActionError('');
      setSuccess('');

      if (selectedUser.isActive) {
        await userApi.deactivateUser(selectedUser.id);
      } else {
        await userApi.activateUser(selectedUser.id);
      }

      setUsers((previous) =>
        previous.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                isActive: !selectedUser.isActive,
              }
            : user
        )
      );

      setSuccess(
        selectedUser.isActive
          ? 'User deactivated.'
          : 'User activated.'
      );
    } catch {
      setActionError('User status could not be updated.');
    } finally {
      setUpdatingId(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesRole =
      roleFilter === '' || user.role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="grid min-h-[86vh] content-start gap-7 rounded-[28px] border border-solid border-[#e3dfe8] bg-[#f7f7fb] p-4 shadow-xl sm:p-8">
        <header className="relative isolate overflow-hidden rounded-3xl bg-[#24233d] p-6 sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-12 -z-10 size-64 rounded-full border-[40px] border-solid border-[#ef476f]/15" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-4 -bottom-20 -z-10 size-48 rounded-full bg-[#ef476f]/10" />
          <span className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#ffb4c8] uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#ef476f]" />
            Administration
          </span>
          <h1 className="m-0 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Users
          </h1>
          <p className="m-0 mt-3 max-w-lg text-sm leading-relaxed text-[#d3d1e0]">
            Manage accounts and view company jobs in one place.
          </p>
        </header>

        {loading && (
          <p className="m-0 py-10 text-center text-[#858592]">
            Loading users...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-4 text-[#a43651]"
          >
            {error}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-4 text-[#a43651]"
          >
            {actionError}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-solid border-[#d5ebdd] bg-[#edf8f1] p-4 text-[#287648]"
          >
            {success}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid items-end gap-5 rounded-2xl border border-solid border-[#e5e4ed] bg-white p-5 shadow-[0_4px_16px_-10px_rgba(25,24,45,0.15)] sm:p-6 md:grid-cols-[2fr_1fr_1fr]">
              <label className="grid gap-2.5 text-xs font-semibold tracking-wide text-[#625d76]">
                Search

                <input
                  value={search}
                  placeholder="First name, last name or email"
                  onChange={(event) => {
                    setSearch(event.target.value);
                  }}
                  className="h-12 w-full min-w-0 rounded-xl border border-solid border-[#e2dfe9] bg-[#f8f8fc] px-4 py-3 text-sm text-[#333344] outline-none transition-colors placeholder:text-[#857b86] hover:border-[#f3a0b5] focus:border-[#ef476f] focus:ring-4 focus:ring-[#ef476f]/10"
                />
              </label>

              <label className="grid gap-2.5 text-xs font-semibold tracking-wide text-[#625d76]">
                Role

                <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value as Role | '');
                  }}
                  className="h-12 w-full min-w-0 rounded-xl border border-solid border-[#e2dfe9] bg-[#f8f8fc] px-4 py-3 text-sm text-[#333344] outline-none transition-colors placeholder:text-[#857b86] hover:border-[#f3a0b5] focus:border-[#ef476f] focus:ring-4 focus:ring-[#ef476f]/10"
                >
                  <option value="">All roles</option>
                  <option value={Role.Candidate}>Candidates</option>
                  <option value={Role.Company}>Companies</option>
                  <option value={Role.Admin}>Administrators</option>
                </select>
              </label>

              <label className="grid gap-2.5 text-xs font-semibold tracking-wide text-[#625d76]">
                Status

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as 'all' | 'active' | 'inactive'
                    );
                  }}
                  className="h-12 w-full min-w-0 rounded-xl border border-solid border-[#e2dfe9] bg-[#f8f8fc] px-4 py-3 text-sm text-[#333344] outline-none transition-colors placeholder:text-[#857b86] hover:border-[#f3a0b5] focus:border-[#ef476f] focus:ring-4 focus:ring-[#ef476f]/10"
                >
                  <option value="all">All users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 px-1">
              <h2 className="m-0 text-lg font-bold text-[#333344]">
                User list
              </h2>

              <span className="rounded-full border border-solid border-[#f4ccd7] bg-[#ffe8ef] px-3 py-1.5 text-xs font-semibold text-[#a83053]">
                Found: {filteredUsers.length}
              </span>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="m-0 py-10 text-center text-[#858592]">
                No users match the selected filters.
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <AdminUserCard
                    key={user.id}
                    user={user}
                    currentUserId={currentUserId}
                    disabled={updatingId !== null}
                    updating={updatingId === user.id}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
