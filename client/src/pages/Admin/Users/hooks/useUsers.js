import { useState, useEffect, useCallback } from "react";
import { AdminUserService } from "../../../../services/admin/user.service";

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all users without hardcoded pagination limit for client-side filtering view
      const response = await AdminUserService.getAllUsers({ limit: 100 });
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch user directory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = useCallback(async (userId, newRole) => {
    const response = await AdminUserService.updateUserRole(userId, newRole);
    if (response.success) {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    }
    return response;
  }, []);

  const toggleUserBan = useCallback(async (userId, currentBanStatus) => {
    const targetBanStatus = !currentBanStatus;
    const response = await AdminUserService.toggleUserBanStatus(userId, targetBanStatus);
    if (response.success) {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBanned: targetBanStatus } : u))
      );
    }
    return response;
  }, []);

  const deleteUser = useCallback(async (userId) => {
    const response = await AdminUserService.deleteUserAccount(userId);
    if (response.success) {
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    }
    return response;
  }, []);

  const getUserDetails = useCallback(async (userId) => {
    return await AdminUserService.getUserById(userId);
  }, []);

  return {
    users,
    loading,
    error,
    refresh: fetchUsers,
    updateUserRole,
    toggleUserBan,
    deleteUser,
    getUserDetails,
  };
}