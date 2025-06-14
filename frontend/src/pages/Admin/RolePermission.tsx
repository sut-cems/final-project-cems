
import React, { useState, useMemo } from 'react';
import { 
  Users, Shield, Settings, Search, UserPlus, Edit3, Trash2, 
  CheckCircle, AlertCircle, Bell, Check, User, Crown, 
  Settings as FileSpreadsheet,
  ChevronDown, MoreHorizontal, Mail, Calendar, Clock
} from 'lucide-react';

// Mock data types
interface Permission {
  id: number;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  color: string;
  permissions: Permission[];
}

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ClubMembership {
  id: number;
  clubName: string;
  role: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  isActive: boolean;
  role: Role;
  notifications: Notification[];
  clubMemberships: ClubMembership[];
  lastLogin: string;
  joinedAt: string;
}

// Mock data with updated color scheme
const permissions: Permission[] = [
  { id: 1, name: 'user:read', displayName: 'ดูข้อมูลผู้ใช้', description: 'สามารถดูข้อมูลผู้ใช้ในระบบ', category: 'user' },
  { id: 2, name: 'user:write', displayName: 'แก้ไขผู้ใช้', description: 'สามารถแก้ไขข้อมูลผู้ใช้', category: 'user' },
  { id: 3, name: 'user:delete', displayName: 'ลบผู้ใช้', description: 'สามารถลบผู้ใช้ออกจากระบบ', category: 'user' },
  { id: 4, name: 'club:manage', displayName: 'จัดการชมรม', description: 'สามารถจัดการชมรมและกิจกรรม', category: 'club' },
  { id: 5, name: 'report:view', displayName: 'ดูรายงาน', description: 'สามารถดูรายงานต่างๆ', category: 'report' },
];

const roles: Role[] = [
  {
    id: 1, name: 'admin', displayName: 'ผู้ดูแลระบบ', 
    description: 'มีสิทธิ์เต็มในการจัดการระบบทั้งหมด',
    color: '#640D5F', permissions: permissions
  },
  {
    id: 2, name: 'teacher', displayName: 'อาจารย์', 
    description: 'สามารถจัดการชมรมและดูรายงานได้',
    color: '#D91656', permissions: permissions.slice(0, 4)
  },
  {
    id: 3, name: 'student', displayName: 'นักเรียน', 
    description: 'สามารถใช้งานระบบพื้นฐานได้',
    color: '#EB5B00', permissions: permissions.slice(0, 2)
  },
];

const users: User[] = [
  {
    id: 1, firstName: 'สมชาย', lastName: 'ใจดี', email: 'somchai@school.ac.th', 
    studentId: 'STD001', isActive: true, role: roles[0],
    notifications: [
      { id: 1, message: 'คำขอเข้าชมรมใหม่', isRead: false, createdAt: '2024-01-15' }
    ],
    clubMemberships: [
      { id: 1, clubName: 'ชมรมคอมพิวเตอร์', role: 'admin' }
    ],
    lastLogin: '5 นาทีที่แล้ว',
    joinedAt: '2023-08-15'
  },
  {
    id: 2, firstName: 'สมหญิง', lastName: 'รักการเรียน', email: 'somying@school.ac.th',
    studentId: 'STD002', isActive: true, role: roles[1],
    notifications: [],
    clubMemberships: [
      { id: 2, clubName: 'ชมรมดนตรี', role: 'member' },
      { id: 3, clubName: 'ชมรมศิลปะ', role: 'admin' }
    ],
    lastLogin: '2 ชั่วโมงที่แล้ว',
    joinedAt: '2023-09-01'
  },
  {
    id: 3, firstName: 'อนุชา', lastName: 'เรียนดี', email: 'anucha@school.ac.th',
    studentId: 'STD003', isActive: false, role: roles[2],
    notifications: [
      { id: 2, message: 'การแจ้งเตือนใหม่', isRead: false, createdAt: '2024-01-10' },
      { id: 3, message: 'อัพเดทระบบ', isRead: true, createdAt: '2024-01-08' }
    ],
    clubMemberships: [],
    lastLogin: '1 สัปดาห์ที่แล้ว',
    joinedAt: '2023-10-15'
  }
];

const getRoleIcon = (roleName: string) => {
  switch (roleName) {
    case 'admin': return <Crown className="w-5 h-5" />;
    case 'teacher': return <User className="w-5 h-5" />;
    case 'student': return <User className="w-5 h-5" />;
    default: return <User className="w-5 h-5" />;
  }
};

// Enhanced UserCard Component with new color scheme
const UserCard: React.FC<{ 
  user: User; 
  toggleUserStatus: (id: number) => void; 
  updateUserRole: (userId: number, newRoleId: number) => void; 
  roles: Role[] 
}> = ({ user, toggleUserStatus, updateUserRole, roles }) => (
  <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-orange-200 group">
    {/* Header Section */}
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-start space-x-5">
        <div className="relative">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-bold text-xl shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${user.role.color}, ${user.role.color}dd)` 
            }}
          >
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-3 border-white shadow-lg ${
            user.isActive ? 'bg-green-400' : 'bg-gray-400'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-2xl mb-2 group-hover:text-purple-900 transition-colors">
            {user.firstName} {user.lastName}
          </h3>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-50 rounded-xl">
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 font-medium">{user.email}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-xl">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500">
              รหัส: <span className="font-bold text-gray-700">{user.studentId}</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Action Icons */}
      <div className="flex items-center space-x-3">
        {user.notifications.filter(n => !n.isRead).length > 0 && (
          <div className="relative">
            <div className="p-3 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-colors cursor-pointer shadow-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {user.notifications.filter(n => !n.isRead).length}
            </div>
          </div>
        )}
        <button className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>

    {/* Role and Status Section */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div 
            className="flex items-center space-x-3 px-5 py-3 rounded-2xl shadow-lg"
            style={{ backgroundColor: user.role.color + '15', border: `2px solid ${user.role.color}25` }}
          >
            <div style={{ color: user.role.color }}>
              {getRoleIcon(user.role.name)}
            </div>
            <span className="font-bold text-sm" style={{ color: user.role.color }}>
              {user.role.displayName}
            </span>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
          user.isActive 
            ? 'bg-green-100 text-green-800 border-2 border-green-200' 
            : 'bg-red-100 text-red-800 border-2 border-red-200'
        }`}>
          {user.isActive ? '✓ ใช้งานได้' : '✕ ระงับการใช้งาน'}
        </span>
      </div>
      
      {/* Last Login Info */}
      <div className="flex items-center space-x-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-2xl">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <Clock className="w-4 h-4" />
        </div>
        <span className="font-medium">เข้าใช้งานล่าสุด: {user.lastLogin}</span>
      </div>
    </div>

    {/* Club Memberships */}
    {user.clubMemberships.length > 0 && (
      <div className="mb-8">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
          <div className="p-2 bg-purple-50 rounded-xl mr-3">
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          ชมรมที่เข้าร่วม
        </h4>
        <div className="space-y-3">
          {user.clubMemberships.map(membership => (
            <div key={membership.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-100 shadow-sm">
              <span className="text-sm font-bold text-gray-700">{membership.clubName}</span>
              <span className={`px-3 py-2 rounded-2xl text-xs font-bold shadow-sm ${
                membership.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800 border-2 border-purple-200' 
                  : 'bg-blue-100 text-blue-800 border-2 border-blue-200'
              }`}>
                {membership.role === 'admin' ? '👑 ผู้ดูแล' : '👤 สมาชิก'}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Actions Section */}
    <div className="flex items-center space-x-3 pt-6 border-t-2 border-gray-100">
      <select
        value={user.role.id}
        onChange={(e) => updateUserRole(user.id, parseInt(e.target.value))}
        className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl text-sm bg-white hover:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 font-medium shadow-lg"
      >
        {roles.map(role => (
          <option key={role.id} value={role.id}>{role.displayName}</option>
        ))}
      </select>
      
      <button
        onClick={() => toggleUserStatus(user.id)}
        className={`p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
          user.isActive 
            ? 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200' 
            : 'bg-green-50 text-green-600 hover:bg-green-100 border-2 border-green-200'
        }`}
        title={user.isActive ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}
      >
        {user.isActive ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
      </button>
      
      <button className="p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-300 border-2 border-blue-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1" title="แก้ไข">
        <Edit3 className="w-5 h-5" />
      </button>
      
      <button className="p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300 border-2 border-red-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1" title="ลบ">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// Enhanced RoleCard Component
const RoleCard: React.FC<{ role: Role; users: User[] }> = ({ role, users }) => {
  const userCount = users.filter(u => u.role.id === role.id).length;
  
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-5">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${role.color}, ${role.color}dd)` 
            }}
          >
            {getRoleIcon(role.name)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-2xl mb-2 group-hover:text-purple-900 transition-colors">{role.displayName}</h3>
            <p className="text-sm text-gray-600 font-medium">{role.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold text-gray-900">{userCount}</div>
            <div className="text-xs text-gray-500 font-medium">ผู้ใช้</div>
          </div>
          <button className="p-4 rounded-2xl bg-gray-50 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-gray-700 mb-5 flex items-center">
          <div className="p-2 bg-purple-50 rounded-xl mr-3">
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          สิทธิ์การใช้งาน ({role.permissions.length})
        </h4>
        <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
          {role.permissions.slice(0, 4).map(permission => (
            <div key={permission.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-100 shadow-sm">
              <div className="p-2 bg-green-100 rounded-xl">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              </div>
              <span className="text-sm font-bold text-gray-700">{permission.displayName}</span>
            </div>
          ))}
          {role.permissions.length > 4 && (
            <div className="text-center py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
              <span className="text-sm text-purple-600 font-bold">และอีก {role.permissions.length - 4} สิทธิ์</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const RolePermissionSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [usersData, setUsersData] = useState(users);

  const filteredUsers = useMemo(() => {
    return usersData.filter(user => {
      const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === 'all' || user.role.name === selectedRole;
      const matchesStatus = showInactiveUsers || user.isActive;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersData, searchTerm, selectedRole, showInactiveUsers]);

  const toggleUserStatus = (userId: number) => {
    setUsersData(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const updateUserRole = (userId: number, newRoleId: number) => {
    const newRole = roles.find(role => role.id === newRoleId);
    if (newRole) {
      setUsersData(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-yellow-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-xl border-b-4 border-gradient-to-r from-purple-500 to-orange-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 to-orange-800 bg-clip-text text-transparent">
                    จัดการสิทธิ์และบทบาท
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">ระบบจัดการผู้ใช้และสิทธิ์การเข้าถึง</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-3xl hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 flex items-center space-x-3">
                <UserPlus className="w-6 h-6" />
                <span className="font-bold text-lg">เพิ่มผู้ใช้ใหม่</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white border-b-2 border-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex space-x-12">
            {[
              { key: 'users', label: 'จัดการผู้ใช้', icon: Users, count: usersData.length },
              { key: 'roles', label: 'จัดการบทบาท', icon: Shield, count: roles.length },
              { key: 'permissions', label: 'สิทธิ์การใช้งาน', icon: Settings, count: permissions.length }
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-4 py-8 px-6 border-b-4 font-bold text-lg transition-all duration-300 ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-600 bg-gradient-to-t from-purple-50 to-transparent rounded-t-3xl shadow-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-3xl'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{label}</span>
                <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                  activeTab === key 
                    ? 'bg-purple-200 text-purple-800 border-2 border-purple-300' 
                    : 'bg-gray-200 text-gray-600 border-2 border-gray-300'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {activeTab === 'users' && (
          <div className="space-y-12">
            {/* Enhanced Filters */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 p-2 bg-purple-50 rounded-xl">
                      <Search className="text-purple-600 w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหาผู้ใช้งาน..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-16 pr-6 py-5 w-96 border-2 border-gray-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-gray-50 hover:bg-white font-medium shadow-lg text-lg"
                    />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="appearance-none px-6 py-5 pr-12 border-2 border-gray-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-purple-200 bg-gray-50 hover:bg-white transition-all duration-300 font-medium shadow-lg text-lg"
                    >
                      <option value="all">🔍 บทบาททั้งหมด</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>
                          {role.name === 'admin' && '👑'} 
                          {role.name === 'teacher' && '👨‍🏫'} 
                          {role.name === 'student' && '👨‍🎓'} 
                          {role.displayName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-purple-50 rounded-xl">
                      <ChevronDown className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between space-x-8">
                  <label className="flex items-center space-x-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInactiveUsers}
                      onChange={(e) => setShowInactiveUsers(e.target.checked)}
                      className="w-6 h-6 rounded-xl border-2 border-gray-300 text-purple-600 focus:ring-purple-500 transition-all duration-300"
                    />
                    <span className="text-lg font-bold text-gray-700">แสดงผู้ใช้ที่ระงับการใช้งาน</span>
                  </label>
                  
                  <div className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-100 to-orange-100 rounded-3xl border-2 border-purple-200 shadow-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                    <span className="text-lg font-bold text-purple-700">
                      {filteredUsers.length} ผู้ใช้
                    </span>
                  </div>
                </div>
              </div>
            </div>


            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredUsers.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  toggleUserStatus={toggleUserStatus}
                  updateUserRole={updateUserRole}
                  roles={roles}
                />
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบผู้ใช้งาน</h3>
                <p className="text-gray-500 mb-6">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูครับ</p>
                <button className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all duration-200">
                  เคลียร์ตัวกรอง
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">จัดการบทบาท</h2>
                <p className="text-gray-600">กำหนดบทบาทและสิทธิ์การเข้าถึงสำหรับผู้ใช้งาน</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>เพิ่มบทบาทใหม่</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {roles.map(role => (
                <RoleCard key={role.id} role={role} users={usersData} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">สิทธิ์การใช้งาน</h2>
              <p className="text-gray-600">จัดการสิทธิ์และการเข้าถึงฟีเจอร์ต่างๆ ในระบบ</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-8">
                <div className="space-y-8">
                  {['user', 'club', 'activity', 'report'].map(category => (
                    <div key={category} className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                          {category === 'user' && <Users className="w-6 h-6 text-white" />}
                          {category === 'club' && <Shield className="w-6 h-6 text-white" />}
                          {category === 'activity' && <Calendar className="w-6 h-6 text-white" />}
                          {category === 'report' && <FileSpreadsheet className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {category === 'user' && 'การจัดการผู้ใช้'}
                            {category === 'club' && 'การจัดการชมรม'}
                            {category === 'activity' && 'การจัดการกิจกรรม'}
                            {category === 'report' && 'รายงานและสถิติ'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {category === 'user' && 'สิทธิ์ในการจัดการข้อมูลผู้ใช้งาน'}
                            {category === 'club' && 'สิทธิ์ในการจัดการชมรมและกิจกรรม'}
                            {category === 'activity' && 'สิทธิ์ในการจัดการกิจกรรมต่างๆ'}
                            {category === 'report' && 'สิทธิ์ในการดูและจัดการรายงาน'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {permissions
                          .filter(permission => permission.category === category)
                          .map(permission => (
                            <div key={permission.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 mb-2 text-lg">{permission.displayName}</h4>
                                  <p className="text-sm text-gray-600 mb-4">{permission.description}</p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center ml-4">
                                  <Check className="w-5 h-5 text-green-600" />
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">มีสิทธิ์ใช้งาน</h5>
                                <div className="flex flex-wrap gap-2">
                                  {roles
                                    .filter(role => role.permissions.some(p => p.id === permission.id))
                                    .map(role => (
                                      <span
                                        key={role.id}
                                        className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border"
                                        style={{ 
                                          backgroundColor: role.color + '15', 
                                          color: role.color,
                                          borderColor: role.color + '30'
                                        }}
                                      >
                                        {role.name === 'admin' && '👑 '}
                                        {role.name === 'teacher' && '👨‍🏫 '}
                                        {role.name === 'student' && '👨‍🎓 '}
                                        {role.displayName}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolePermissionSystem;