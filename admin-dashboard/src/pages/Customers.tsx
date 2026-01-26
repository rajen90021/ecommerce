import React, { useEffect, useState, useRef } from 'react';
import { Table, Tag, Avatar, Card, message, Progress, Input, Button, Space } from 'antd';
import type { InputRef } from 'antd';
import { 
  TeamOutlined,
  VerifiedOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { userService } from '../services/userService';
import type { User } from '../types';
import { format } from 'date-fns';

const Customers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [tableKey, setTableKey] = useState(Date.now());

  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        role: 'customer'
      });
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
      setPagination({ ...pagination, total: data.total || 0 });
    } catch (error) {
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = (val: string) => {
    setSearchText(val);
    const filtered = users.filter(u => 
      u.name.toLowerCase().includes(val.toLowerCase()) || 
      u.email.toLowerCase().includes(val.toLowerCase()) ||
      (u.phone && u.phone.includes(val))
    );
    setFilteredUsers(filtered);
  };

  const clearAllFilters = () => {
    setSearchText('');
    setFilteredUsers(users);
    setTableKey(Date.now());
  };

  const getColumnSearchProps = (dataIndex: keyof User): ColumnType<User> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#C62828' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()) ?? false,
    filterDropdownProps: {
      onOpenChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const columns: ColumnsType<User> = [
    {
      title: 'Customer Profile',
      key: 'user',
      width: 300,
      fixed: 'left',
      ...getColumnSearchProps('name'),
      render: (_, record: User) => (
        <div className="flex items-center space-x-4 overflow-hidden">
          <Avatar src={record.image} size={50} style={{ border: '2px solid #f0f0f0' }}>
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-black text-brand-accent tracking-tight leading-tight truncate">{record.name}</p>
            <div className="flex items-center space-x-2 mt-1">
                <MailOutlined style={{ fontSize: 10, color: '#9ca3af' }} />
                <span className="text-[10px] font-bold text-gray-400 truncate">{record.email || 'Private Account'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact Details',
      dataIndex: 'phone',
      key: 'phone',
      width: 180,
      ...getColumnSearchProps('phone'),
      render: (text: string) => (
        <div className="flex items-center space-x-2">
            <PhoneOutlined style={{ fontSize: 12, color: '#9ca3af' }} />
            <span className="text-xs font-bold text-brand-accent">{text || 'No Phone'}</span>
        </div>
      ),
    },
    {
      title: 'Verification',
      dataIndex: 'is_verified',
      key: 'status',
      width: 150,
      filters: [{ text: 'Verified', value: true }, { text: 'Pending', value: false }],
      onFilter: (value, record) => record.is_verified === value,
      render: (verified: boolean) => (
        <Tag 
            color={verified ? 'success' : 'warning'} 
            icon={verified ? <VerifiedOutlined /> : null}
            style={{ borderRadius: 8, fontWeight: 900, textTransform: 'uppercase', fontSize: 10 }}
        >
          {verified ? 'VERIFIED' : 'PENDING'}
        </Tag>
      ),
    },
    {
      title: 'Registration',
      dataIndex: 'created_at',
      key: 'joined',
      width: 180,
      render: (date: string) => (
        <div className="flex items-center space-x-2">
            <CalendarOutlined style={{ fontSize: 12, color: '#9ca3af' }} />
            <span className="text-xs font-bold text-brand-accent">
                {date ? format(new Date(date), 'MMM dd, yyyy') : 'No Date'}
            </span>
        </div>
      ),
    },
    {
        title: 'Engagement',
        key: 'roles',
        width: 150,
        render: () => (
          <div className="w-24">
              <Progress percent={Math.floor(Math.random() * 60) + 40} size="small" strokeColor="#C62828" />
          </div>
        )
    }
  ];

  return (
    <div className="p-0 space-y-12">
      {/* Header */}
      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-brand-accent tracking-tighter">Customer CRM</h1>
            <p className="text-brand-textSecondary mt-2 font-medium">Analyze and manage your registered user base.</p>
          </div>
          <Space className="w-full md:w-auto self-end md:self-center" size={16}>
            <Input
              placeholder="Search customers..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              style={{ borderRadius: 12, height: 50, width: 250, background: '#f8f9fb', border: 'none' }}
              className="hidden sm:flex"
            />
            {searchText && (
              <Button 
                icon={<ReloadOutlined />} 
                onClick={clearAllFilters}
                className="flex items-center justify-center"
                style={{ borderRadius: 12, height: 50 }}
              >
                Clear
              </Button>
            )}
            <div className="flex bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100 items-center space-x-4">
                <TeamOutlined style={{ fontSize: 24, color: '#C62828' }} />
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total database</p>
                    <p className="text-2xl font-black text-brand-accent leading-none">{pagination.total}</p>
                </div>
            </div>
          </Space>
        </div>
      </Card>

      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <Table
          key={tableKey}
          columns={columns}
          dataSource={searchText ? filteredUsers : users}
          rowKey="id"
          loading={loading}
          className="premium-table"
          expandable={{
            expandedRowRender: (record) => (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 m-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Registered Delivery Addresses</h4>
                {record.addresses && record.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {record.addresses.map((addr) => (
                      <div key={addr.id} className={`p-4 rounded-xl border ${addr.is_default ? 'bg-white border-brand-primary shadow-sm' : 'bg-gray-100 border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-black text-brand-accent">{addr.full_name}</span>
                          {addr.is_default && <Tag color="error" className="m-0 text-[8px] font-black rounded-md">DEFAULT</Tag>}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                          {addr.city}, {addr.state} - {addr.postal_code}
                        </p>
                        <div className="mt-3 flex items-center space-x-2 text-[10px] font-bold text-gray-400">
                          <PhoneOutlined style={{ fontSize: 10 }} />
                          <span>{addr.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-gray-400 italic">No addresses saved for this customer.</p>
                )}
              </div>
            ),
            rowExpandable: (record) => !!record.addresses?.length,
          }}
          scroll={{ x: 1000, y: 'calc(100vh - 420px)' }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            className: "px-8 py-6",
            showSizeChanger: true,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current || 1,
              pageSize: newPagination.pageSize || 10,
              total: pagination.total,
            });
          }}
        />
      </Card>
    </div>
  );
};

export default Customers;
