import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Card, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SendOutlined, 
  DeleteOutlined, 
  NotificationOutlined,
  GlobalOutlined,
  UserOutlined,
  MessageOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { notificationService, type Notification } from '../services/notificationService';
import { format } from 'date-fns';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
    } catch (error) {
      message.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await notificationService.create(values);
      message.success('Notification broadcasted successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchNotifications();
    } catch (error) {
      message.error('Failed to send notification');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Notification Record',
      content: 'This will remove the notification from the history. Users who already received it will not be affected.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await notificationService.delete(id);
          message.success('Notification record deleted');
          fetchNotifications();
        } catch (error) {
          message.error('Failed to delete notification');
        }
      }
    });
  };

  const columns: ColumnsType<Notification> = [
    {
      title: 'Broadcast Subject',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <MessageOutlined />
            </div>
            <span className="font-black text-brand-accent tracking-tighter">{text}</span>
        </div>
      ),
    },
    {
      title: 'Payload Message',
      dataIndex: 'message',
      key: 'message',
      width: '40%',
      render: (text: string) => <p className="text-xs text-brand-textSecondary font-medium leading-relaxed line-clamp-2">{text}</p>,
    },
    {
      title: 'Target Channel',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'all' ? 'processing' : 'warning'} icon={type === 'all' ? <GlobalOutlined /> : <UserOutlined />} style={{ borderRadius: 8, fontWeight: 900, textTransform: 'uppercase', fontSize: 10 }}>
          {type === 'all' ? 'Global Broadcast' : 'Direct Message'}
        </Tag>
      ),
    },
    {
      title: 'Transmission Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date: string) => (
        <div className="flex items-center space-x-2">
            <HistoryOutlined style={{ fontSize: 12, color: '#9ca3af' }} />
            <span className="text-[10px] font-bold text-gray-400 uppercase">
                {date ? format(new Date(date), 'MMM dd, HH:mm') : 'No Date'}
            </span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record: Notification) => (
        <Tooltip title="Delete Record">
            <Button
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                type="text"
                danger
                size="small"
            />
        </Tooltip>
      ),
    }
  ];

  return (
    <div className="p-0 space-y-12">
      {/* Header */}
      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-brand-accent tracking-tighter">System Broadcasts</h1>
            <p className="text-brand-textSecondary mt-2 font-medium">Deploy real-time alerts and marketing updates to all users.</p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{
              height: 54,
              padding: '0 32px',
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 900,
              boxShadow: '0 10px 20px rgba(198, 40, 40, 0.2)',
            }}
          >
            Launch Broadcast
          </Button>
        </div>
      </Card>

      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={notifications} 
          rowKey="id" 
          loading={loading} 
          className="premium-table" 
          scroll={{ x: 800, y: 'calc(100vh - 420px)' }}
          pagination={{ className: "px-8 py-6" }} 
        />
      </Card>

      <Modal
        title={<span><NotificationOutlined className="mr-2" /> Broadcast New Notification</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Confirm & Deploy"
        style={{ borderRadius: 24 }}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-6">
          <Form.Item name="title" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subject / Title</span>} rules={[{ required: true }]}>
            <Input placeholder="e.g. System Maintenance Alert" style={{ borderRadius: 12, height: 45 }} />
          </Form.Item>
          <Form.Item name="message" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payload Message</span>} rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Type your message here..." style={{ borderRadius: 12 }} />
          </Form.Item>
          <Form.Item name="type" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Audience Cluster</span>} initialValue="all">
            <Select 
                options={[
                    { value: 'all', label: 'All Registered Users' }, 
                    { value: 'specific', label: 'Targeted Segment (Coming Soon)' }
                ]} 
                disabled 
                style={{ borderRadius: 12, height: 45 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Notifications;
