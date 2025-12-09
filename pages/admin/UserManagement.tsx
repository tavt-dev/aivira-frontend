import React, { useEffect, useState } from 'react';
import { MockService } from '../../services/mockService';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Search, Trash2, Mail, Shield } from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    MockService.getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa người dùng này?')) {
      await MockService.deleteUser(id);
      loadUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
        <div className="text-sm text-slate-500">Tổng: {users.length} thành viên</div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc email..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Thành viên</th>
                  <th className="px-6 py-3">Vai trò</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Ngày tham gia</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   <tr><td colSpan={5} className="p-8 text-center">Đang tải...</td></tr>
                ) : filteredUsers.length === 0 ? (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-500">Không tìm thấy người dùng.</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="" className="w-9 h-9 rounded-full bg-slate-200" />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                               <Mail className="w-3 h-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>
                          {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Hoạt động
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">20/10/2023</td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                           variant="ghost" 
                           size="sm" 
                           className="text-red-500 hover:text-red-700 hover:bg-red-50"
                           onClick={() => handleDelete(user.id)}
                        >
                           <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};