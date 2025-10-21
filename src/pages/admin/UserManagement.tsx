import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
import { User } from '../../context/AuthContext';
import Logo from '../../assets/logo.png';
import { EditIcon, TrashIcon, UserPlusIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // debounced query sent to backend
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // loader state
  const [loading, setLoading] = useState<boolean>(true);

  // pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10); // page size
  const [total, setTotal] = useState<number>(0);

  // form state for add/edit
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    lga: '',
    role: 'ssp',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API (server-side pagination + search)
  const fetchUsers = async (p = page, lim = limit, q = searchQuery) => {
    setLoading(true);
    try {
      // build URL safely
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', String(lim));
      if (q && q.trim() !== '') params.set('search', q.trim());

      const url = `${API_URL}/admin/users?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json().catch(() => null);

      // Support multiple API shapes:
      // 1. { data: [...], total: N, page, limit }
      // 2. { users: [...], total: N }
      // 3. array [...]
      if (!data) {
        setUsers([]);
        setTotal(0);
      } else if (Array.isArray(data)) {
        setUsers(data);
        setTotal(data.length);
      } else {
        const list = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.users)
          ? data.users
          : Array.isArray(data.items)
          ? data.items
          : [];
        setUsers(list);
        setTotal(Number(data.total ?? data.count ?? data.totalCount ?? list.length));
        // ensure page/limit reflect server if provided
        if (typeof data.page === 'number') setPage(data.page);
        if (typeof data.limit === 'number') setLimit(data.limit);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // initial + when page/limit/searchQuery changes
  useEffect(() => {
    fetchUsers(page, limit, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchQuery]);

  // reset to first page when changing page size
  useEffect(() => {
    setPage(1);
  }, [limit]);

  // debounce searchTerm -> searchQuery (sent to backend)
  useEffect(() => {
    const t = setTimeout(() => {
      // when user enters a new search, send it to backend and reset to page 1
      setSearchQuery(searchTerm.trim());
      setPage(1);
    }, 2000);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // when opening modal for edit, populate form
  useEffect(() => {
    if (isModalOpen && currentUser) {
      setForm({
        name: currentUser.name ?? '',
        email: currentUser.email ?? '',
        phone: currentUser.phone ?? '',
        state: currentUser.state ?? '',
        lga: currentUser.lga ?? '',
        role: (currentUser.role as string) ?? 'ssp',
      });
      setError(null);
    }
    if (isModalOpen && !currentUser) {
      // reset for new user
      setForm({
        name: '',
        email: '',
        phone: '',
        state: '',
        lga: '',
        role: 'ssp',
      });
      setError(null);
    }
  }, [isModalOpen, currentUser]);

  // Client-side sorting only (search is server-side now)
  const displayedUsers = [...users].sort((a, b) => {
    const aValue = (a[sortField] as any) || '';
    const bValue = (b[sortField] as any) || '';
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return 0;
  });

  // Sort users (local UI)
  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      // refetch current page after delete
      fetchUsers(page, limit, searchQuery);
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  // Open modal for adding new user
  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  // handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Save (create or update)
  const handleSaveUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        state: form.state.trim() || null,
        lga: form.lga.trim() || null,
        role: form.role || 'ssp',
      };

      if (currentUser && currentUser.id) {
        // update user
        const res = await fetch(`${API_URL}/admin/users/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update user');
      } else {
        // create - backend may require a password; send minimal and backend can set a temp password or require flow
        const res = await fetch(`${API_URL}/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to create user');
        }
      }

      // after save, refresh current page
      await fetchUsers(page, limit, searchQuery);
      setIsModalOpen(false);
      setCurrentUser(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // show loader while fetching users
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <div className="mt-3 text-gray-600">Loading users…</div>
        </div>
      </div>
    );
  }

  // pagination helpers
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(total, page * limit);

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1 flex items-center">
          <img src={Logo} alt="Logo" className="h-24 w-24 mr-4 object-contain" />
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">User Management</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleAddUser}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New User
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="w-full sm:w-64 mb-4 sm:mb-0">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* page size selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Page size:</label>
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="border rounded p-1">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Users table */}
          <div className="mt-4 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th onClick={() => handleSort('name')} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer">Name</th>
                        <th onClick={() => handleSort('email')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">Email</th>
                        <th onClick={() => handleSort('phone')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">Phone</th>
                        <th onClick={() => handleSort('state')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">State</th>
                        <th onClick={() => handleSort('lga')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">LGA</th>
                        <th onClick={() => handleSort('role')} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer">Role</th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {displayedUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.phone || '-'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.state || '-'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.lga || '-'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-green-100 text-green-800'
                                  : user.role === 'ssp'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {user.role ?? '-'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900 mr-4">
                              <EditIcon className="h-5 w-5" />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button onClick={() => handleDeleteUser(user.id!)} className="text-red-600 hover:text-red-900">
                              <TrashIcon className="h-5 w-5" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* pagination footer */}
                  <div className="px-4 py-3 bg-white border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex}-{endIndex} of {total} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <div className="text-sm">
                        Page {page} / {totalPages}
                      </div>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleSaveUser}>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{currentUser ? 'Edit User' : 'Add New User'}</h3>
                  <div className="mt-4 space-y-3">
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full name</label>
                      <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input name="email" value={form.email} onChange={handleChange} type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input name="state" value={form.state} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">LGA</label>
                        <input name="lga" value={form.lga} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select name="role" value={form.role} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        <option value="ssp">SSP</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button type="submit" disabled={saving} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => { setIsModalOpen(false); setCurrentUser(null); }} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:col-start-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;