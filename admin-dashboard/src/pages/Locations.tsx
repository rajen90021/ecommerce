import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Switch, message, Modal, Form, Input, InputNumber, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { locationService } from '../services/locationService';
import type { Location } from '../services/locationService';

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getAll();
      setLocations(data);
    } catch (error) {
      message.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = async (values: any) => {
    try {
      if (editingLocation) {
        await locationService.update(editingLocation.id, values);
        message.success('Location updated successfully');
      } else {
        await locationService.create(values);
        message.success('Location created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchLocations();
    } catch (error) {
      message.error('Failed to save location');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await locationService.delete(id);
      message.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      message.error('Failed to delete location');
    }
  };

  const toggleStatus = async (location: Location) => {
    try {
      await locationService.update(location.id, { is_active: !location.is_active });
      message.success(`Location ${!location.is_active ? 'activated' : 'deactivated'}`);
      fetchLocations();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    {
      title: 'City Name',
      dataIndex: 'city_name',
      key: 'city_name',
      render: (text: string) => <span style={{ fontWeight: 700 }}>{text.toUpperCase()}</span>,
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Delivery Charge',
      dataIndex: 'delivery_charge',
      key: 'delivery_charge',
      render: (val: number) => `₹${Number(val).toFixed(2)}`,
    },
    {
      title: 'Min Order',
      dataIndex: 'min_order_amount',
      key: 'min_order_amount',
      render: (val: number) => `₹${Number(val).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean, record: Location) => (
        <Switch 
          checked={active} 
          onChange={() => toggleStatus(record)}
          checkedChildren="ACTIVE"
          unCheckedChildren="INACTIVE"
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Location) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingLocation(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure to delete this location?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger ghost icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-0">
      <Card 
        variant="borderless" 
        style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        title={
          <div className="py-2">
            <h1 className="text-2xl font-black text-brand-accent tracking-tighter">Location Management</h1>
            <p className="text-brand-textSecondary text-xs mt-1 font-bold uppercase tracking-widest">Service areas and logistics configuration</p>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingLocation(null);
              form.resetFields();
              setModalVisible(true);
            }}
            style={{ borderRadius: 12, height: 45, padding: '0 24px', fontWeight: 900 }}
          >
            ADD NEW REGION
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={locations} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 16 }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center space-x-2 pt-2">
            <EnvironmentOutlined className="text-brand-primary" />
            <span className="font-black uppercase tracking-tight">{editingLocation ? 'Edit Region' : 'Service New Region'}</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={editingLocation ? 'UPDATE REGION' : 'CREATE REGION'}
        width={500}
        styles={{ body: { paddingTop: 24 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEdit}
          initialValues={{ state: 'West Bengal', is_active: true, delivery_charge: 50, min_order_amount: 0 }}
        >
          <Form.Item
            name="city_name"
            label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">City Name</span>}
            rules={[{ required: true, message: 'Please input city name!' }]}
          >
            <Input placeholder="e.g. Kalimpong" style={{ borderRadius: 10, padding: '10px 15px' }} />
          </Form.Item>

          <Form.Item
            name="state"
            label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">State</span>}
            rules={[{ required: true, message: 'Please input state!' }]}
          >
            <Input placeholder="West Bengal" style={{ borderRadius: 10, padding: '10px 15px' }} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="delivery_charge"
              label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Delivery Charge (₹)</span>}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: '100%', borderRadius: 10 }} />
            </Form.Item>

            <Form.Item
              name="min_order_amount"
              label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Min Order (₹)</span>}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: '100%', borderRadius: 10 }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Locations;
