import React, { useEffect, useState, useRef } from 'react';
import { Button, Modal, Form, Input, message, Card, Row, Col, Switch, Upload, Table, Space, Tag, Tooltip } from 'antd';
import type { InputRef } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PictureOutlined as ImageIcon,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [tableKey, setTableKey] = useState(Date.now());
  
  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data || []);
      setFilteredCategories(data || []);
    } catch (error) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = (val: string) => {
    setSearchText(val);
    const filtered = categories.filter(c => 
      c.category_name.toLowerCase().includes(val.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(val.toLowerCase()))
    );
    setFilteredCategories(filtered);
  };

  const clearAllFilters = () => {
    setSearchText('');
    setFilteredCategories(categories);
    setTableKey(Date.now());
  };

  const getColumnSearchProps = (dataIndex: keyof Category): ColumnType<Category> => ({
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

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue({
        category_name: category.category_name,
        description: category.description,
        status: category.status,
      });
      if (category.image_url) {
        setFileList([{ url: category.image_url, name: 'category-image' }]);
      } else {
        setFileList([]);
      }
    } else {
      setEditingCategory(null);
      form.resetFields();
      form.setFieldsValue({ status: 'active' });
      setFileList([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Category',
      content: 'Are you sure? This will affect products linked to this category.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await categoryService.delete(id);
          message.success('Category deleted successfully');
          fetchCategories();
        } catch (error) {
          message.error('Failed to delete category');
        }
      },
    });
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('category_name', values.category_name);
      formData.append('description', values.description || '');
      formData.append('status', values.status);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        message.success('Category updated successfully');
      } else {
        await categoryService.create(formData);
        message.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image',
      width: 120,
      fixed: 'left',
      render: (url: string) => (
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
          {url ? (
            <img src={url} alt="Category" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon style={{ fontSize: 24, color: '#d9d9d9' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Category Name',
      dataIndex: 'category_name',
      key: 'name',
      width: 250,
      ...getColumnSearchProps('category_name'),
      render: (text: string) => <span className="font-black text-brand-accent tracking-tighter">{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <span className="text-gray-400 text-xs font-medium">{text || 'No description available for this category.'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      filters: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'} style={{ borderRadius: 8, fontWeight: 900, textTransform: 'uppercase', fontSize: 10 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record: Category) => (
        <Space size="small">
          <Tooltip title="Edit Category">
            <Button icon={<EditOutlined />} onClick={() => handleOpenDialog(record)} type="text" size="small" />
          </Tooltip>
          <Tooltip title="Delete Category">
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} type="text" danger size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-0 space-y-12">
      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-brand-accent tracking-tighter">Category Architecture</h1>
            <p className="text-brand-textSecondary mt-2 font-medium">Define and organize your storefront hierarchy.</p>
          </div>
          <Space size={16}>
            <Input
              placeholder="Search categories..."
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
              onClick={() => handleOpenDialog()}
              style={{ height: 54, padding: '0 32px', borderRadius: 16, fontSize: 16, fontWeight: 900, boxShadow: '0 10px 20px rgba(198, 40, 40, 0.2)' }}
            >
              Add New Category
            </Button>
          </Space>
        </div>
      </Card>

      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <Table
          key={tableKey}
          columns={columns}
          dataSource={searchText ? filteredCategories : categories}
          rowKey="id"
          loading={loading}
          className="premium-table"
          scroll={{ x: 1000, y: 'calc(100vh - 420px)' }}
          pagination={{ className: "px-8 py-6" }}
        />
      </Card>

      <Modal
        title={editingCategory ? "Update Category" : "New Category"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        style={{ borderRadius: 24 }}
        centered
        okText={editingCategory ? "Update Category" : "Create Category"}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'active' }} className="mt-6">
          <Form.Item name="category_name" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category Name</span>} rules={[{ required: true }]}>
            <Input placeholder="e.g. Autumn Collection" style={{ borderRadius: 12, height: 45 }} />
          </Form.Item>
          <Form.Item name="description" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</span>}>
            <Input.TextArea rows={4} placeholder="Briefly describe this category..." style={{ borderRadius: 12 }} />
          </Form.Item>
          <Form.Item name="status" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visibility Status</span>} valuePropName="checked" getValueFromEvent={(val) => val ? 'active' : 'inactive'} getValueProps={(val) => ({ checked: val === 'active' })}>
            <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" />
          </Form.Item>
          <Form.Item label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category Image</span>}>
            <Upload listType="picture-card" fileList={fileList} onChange={({ fileList }) => setFileList(fileList)} beforeUpload={() => false} maxCount={1}>
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
