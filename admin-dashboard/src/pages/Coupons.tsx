import React, { useEffect, useState, useRef } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, InputNumber, DatePicker, message, Card, Row, Col, Tooltip, Space } from 'antd';
import type { InputRef } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PercentageOutlined,
  DollarOutlined,
  ArrowRightOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { offerService } from '../services/offerService';
import type { Coupon } from '../types';
import { format } from 'date-fns';
import dayjs from 'dayjs';

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();
  const [tableKey, setTableKey] = useState(Date.now());
  
  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await offerService.getAll();
      const list = data.offers || [];
      setCoupons(list);
      setFilteredCoupons(list);
    } catch (error) {
      message.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = (val: string) => {
    setSearchText(val);
    const filtered = coupons.filter(c => 
      c.code.toLowerCase().includes(val.toLowerCase()) || 
      (c.description && c.description.toLowerCase().includes(val.toLowerCase()))
    );
    setFilteredCoupons(filtered);
  };

  const clearAllFilters = () => {
    setSearchText('');
    setFilteredCoupons(coupons);
    setTableKey(Date.now());
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      const data = {
        ...values,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
      };

      if (editingCoupon) {
        await offerService.update(editingCoupon.id, data);
        message.success('Coupon updated successfully');
      } else {
        await offerService.create(data);
        message.success('Coupon created successfully');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
        title: 'Delete Coupon',
        content: 'Are you sure you want to delete this coupon? Active campaigns will be disrupted.',
        okText: 'Yes, Delete',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
            try {
                await offerService.delete(id);
                message.success('Coupon deleted successfully');
                fetchCoupons();
            } catch (error) {
                message.error('Failed to delete coupon');
            }
        }
    });
  };

  const openModal = (coupon?: Coupon | any) => {
    if (coupon) {
      setEditingCoupon(coupon);
      form.setFieldsValue({
        ...coupon,
        start_date: dayjs(coupon.start_date),
        end_date: dayjs(coupon.end_date),
      });
    } else {
      setEditingCoupon(null);
      form.resetFields();
      form.setFieldsValue({
        status: 'active',
        discount_type: 'percentage',
        min_order_amount: 0
      });
    }
    setIsModalOpen(true);
  };

  const getColumnSearchProps = (dataIndex: keyof Coupon): ColumnType<Coupon> => ({
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
    onFilter: (value, record: any) =>
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

  const columns: ColumnsType<Coupon> = [
    {
      title: 'Promotional Code',
      dataIndex: 'code',
      key: 'code',
      width: 200,
      fixed: 'left',
      ...getColumnSearchProps('code'),
      render: (text: string) => (
        <span className="bg-brand-primaryLight text-brand-primary px-4 py-2 rounded-xl text-xs font-black tracking-widest border border-brand-primary/10">
            {text.toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Discount Value',
      key: 'discount',
      width: 150,
      render: (_, record: any) => (
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-brand-primary">
                {record.discount_type === 'percentage' ? <PercentageOutlined /> : <DollarOutlined />}
           </div>
           <span className="font-black text-brand-accent text-sm">
             {record.discount_value}{record.discount_type === 'percentage' ? '%' : '₹'}
           </span>
        </div>
      ),
    },
    {
      title: 'Min order',
      dataIndex: 'min_order_amount',
      key: 'min_order_amount',
      width: 120,
      render: (val) => <span className="font-bold text-gray-500">₹{val}</span>
    },
    {
      title: 'Campaign Validity',
      key: 'validity',
      width: 250,
      render: (_, record: any) => (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">From:</span>
            <span className="text-xs font-bold text-brand-accent">
              {record.start_date ? format(new Date(record.start_date), 'MMM dd, yyyy') : 'No Date'}
            </span>
            <ArrowRightOutlined style={{ fontSize: 10, color: '#d9d9d9' }} />
            <span className="text-[10px] font-bold text-gray-400 uppercase">To:</span>
            <span className="text-xs font-bold text-brand-accent">
              {record.end_date ? format(new Date(record.end_date), 'MMM dd, yyyy') : 'No Date'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Utility',
      key: 'usage',
      width: 150,
      sorter: (a: any, b: any) => a.used_count - b.used_count,
      render: (_, record: any) => (
        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1">
            <span className="text-sm font-black text-brand-accent">{record.used_count}</span>
            <span className="text-[10px] font-bold text-gray-400">/ {record.usage_limit || '∞'}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Conversions</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      filters: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }],
      onFilter: (value, record: any) => record.status === value,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'} style={{ borderRadius: 8, fontWeight: 900, textTransform: 'uppercase', fontSize: 10 }}>
          {status === 'active' ? 'LIVE' : 'PAUSED'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record: any) => (
        <Space size="small">
          <Tooltip title="Edit Campaign">
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} type="text" size="small" />
          </Tooltip>
          <Tooltip title="Delete Coupon">
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} type="text" danger size="small" />
          </Tooltip>
        </Space>
      ),
    }
  ];

  return (
    <div className="p-0 space-y-12">
      {/* Header */}
      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-brand-accent tracking-tighter">Marketing Incentives</h1>
            <p className="text-brand-textSecondary mt-2 font-medium">Create and manage high-conversion discount triggers.</p>
          </div>
          <Space className="w-full md:w-auto self-end md:self-center" size={16}>
            <Input
              placeholder="Search coupons..."
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
            <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
                style={{ height: 54, padding: '0 32px', borderRadius: 16, fontSize: 16, fontWeight: 900, boxShadow: '0 10px 20px rgba(198, 40, 40, 0.2)' }}
            >
                Launch New Coupon
            </Button>
          </Space>
        </div>
      </Card>

      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <Table 
          key={tableKey}
          columns={columns} 
          dataSource={searchText ? filteredCoupons : coupons} 
          rowKey="id" 
          loading={loading} 
          className="premium-table" 
          scroll={{ x: 1000, y: 'calc(100vh - 420px)' }}
          pagination={{ className: "px-8 py-6" }} 
        />
      </Card>

      <Modal
        title={editingCoupon ? "Edit Incentive Campaign" : "Launch New Campaign"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        style={{ borderRadius: 24 }}
        centered
        okText={editingCoupon ? "Update Coupon" : "Launch Coupon"}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate} className="mt-6">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="code" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Coupon Code</span>} rules={[{ required: true }]}>
                <Input placeholder="e.g. FLASH-MARCH-2026" style={{ borderRadius: 12, height: 45 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</span>} rules={[{ required: true }]}>
                <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} style={{ borderRadius: 12, height: 45 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</span>}>
            <Input.TextArea placeholder="Internal note or customer facing description" style={{ borderRadius: 12 }} rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="discount_type" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Type</span>} rules={[{ required: true }]}>
                <Select options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed Amount' }]} style={{ borderRadius: 12, height: 45 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discount_value" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value</span>} rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} style={{ borderRadius: 12, height: 45, paddingTop: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_order_amount" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Min Order Amount (₹)</span>} rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} style={{ borderRadius: 12, height: 45, paddingTop: 6 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_discount_amount" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Max Discount (₹) (Optional)</span>}>
                <InputNumber className="w-full" min={0} style={{ borderRadius: 12, height: 45, paddingTop: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start_date" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Release Date</span>} rules={[{ required: true }]}>
                <DatePicker className="w-full" style={{ borderRadius: 12, height: 45 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expiry Date</span>} rules={[{ required: true }]}>
                <DatePicker className="w-full" style={{ borderRadius: 12, height: 45 }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="usage_limit" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Utility Limit (Optional)</span>}>
            <InputNumber className="w-full" min={1} style={{ borderRadius: 12, height: 45, paddingTop: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Coupons;
