import React, { useEffect, useState, useRef } from 'react';
import { Table, message, Card, Button, Tag, Space, Tooltip, Modal, Input } from 'antd';
import type { InputRef } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ShoppingOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { productService } from '../services/productService';
import type { Product } from '../types';
import ProductForm from '../components/products/ProductForm';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tableKey, setTableKey] = useState(Date.now());
  
  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        status: 'all'
      });
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
      setPagination({ ...pagination, total: data.total || 0 });
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = (val: string) => {
    setSearchText(val);
    const filtered = products.filter(p => 
      p.product_name.toLowerCase().includes(val.toLowerCase()) || 
      (p.brand && p.brand.toLowerCase().includes(val.toLowerCase())) ||
      (p.category && p.category.category_name.toLowerCase().includes(val.toLowerCase()))
    );
    setFilteredProducts(filtered);
  };

  const clearAllFilters = () => {
    setSearchText('');
    setFilteredProducts(products);
    setTableKey(Date.now());
  };

  const getColumnSearchProps = (dataIndex: keyof Product | string[]): ColumnType<Product> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${Array.isArray(dataIndex) ? dataIndex.join('.') : dataIndex}`}
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
    onFilter: (value, record) => {
        const val = Array.isArray(dataIndex) 
            ? dataIndex.reduce((obj, key) => (obj as any)?.[key], record)
            : record[dataIndex as keyof Product];
        return val?.toString().toLowerCase().includes((value as string).toLowerCase()) ?? false;
    },
    filterDropdownProps: {
      onOpenChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await productService.delete(id);
          message.success('Product deleted successfully');
          fetchProducts();
        } catch (error) {
          message.error('Failed to delete product');
        }
      }
    });
  };

  const openModal = (product?: Product) => {
    setSelectedProduct(product || null);
    setIsModalOpen(true);
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'image',
      width: 100,
      fixed: 'left',
      render: (images: any[]) => (
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
          {images && images.length > 0 ? (
            <img src={images[0].image_url} alt="Product" className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
          ) : (
            <ShoppingOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Product Details',
      key: 'name',
      width: 250,
      ...getColumnSearchProps('product_name'),
      render: (_: any, record: Product) => (
        <div className="overflow-hidden">
          <p className="font-black text-brand-accent tracking-tight leading-tight truncate">{record.product_name}</p>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.15em] mt-1 truncate">{record.brand || 'Premium Collection'}</p>
        </div>
      ),
    },
    {
      title: 'Category Connection',
      dataIndex: ['category', 'category_name'],
      key: 'category',
      width: 150,
      filters: Array.from(new Set(products.map(p => p.category?.category_name).filter(Boolean))).map(name => ({ text: name as string, value: name as string })),
      onFilter: (value, record) => record.category?.category_name === value,
      render: (text: string) => (
        <Tag color="volcano" style={{ borderRadius: 8, fontWeight: 900, textTransform: 'uppercase', fontSize: 10 }}>
          {text || 'GENERAL'}
        </Tag>
      ),
    },
    {
      title: 'Inventory',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 120,
      sorter: (a, b) => a.stock_quantity - b.stock_quantity,
      render: (stock: number) => (
        <div className="flex flex-col">
          <span className={`text-sm font-black ${stock < 10 ? 'text-red-500' : 'text-brand-accent'}`}>{stock}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Units left</span>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 140,
      filters: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }],
      onFilter: (value, record) => record.status === value,
      render: (_, record: Product) => {
        const isCategoryInactive = record.category?.status === 'inactive';
        
        return (
          <div className="flex flex-col gap-1">
            {isCategoryInactive && record.status === 'active' ? (
              <Tag color="error" style={{ borderRadius: 8, fontWeight: 900, textTransform: 'uppercase', fontSize: 10, border: '1px solid #ff4d4f' }}>
                Category Hidden
              </Tag>
            ) : (
              <Tag color={record.status === 'active' ? 'green' : 'default'} style={{ borderRadius: 8, fontWeight: 900, textTransform: 'uppercase', fontSize: 10 }}>
                {record.status}
              </Tag>
            )}
            {record.is_featured && <Tag color="orange" style={{ borderRadius: 8, fontWeight: 900, textTransform: 'uppercase', fontSize: 10 }}>Featured</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record: Product) => (
        <Space size="small">
          <Tooltip title="Edit Product">
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} type="text" size="small" />
          </Tooltip>
          <Tooltip title="Delete Product">
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} type="text" danger size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-0 space-y-12">
      {/* Header */}
      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-brand-accent tracking-tighter">Global Inventory</h1>
            <p className="text-brand-textSecondary mt-2 font-medium">Manage and optimize your digital marketplace assets.</p>
          </div>
          <Space className="w-full md:w-auto self-end md:self-center" size={16}>
            <Input
              placeholder="Filter products..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              style={{ borderRadius: 12, height: 50, width: 250, background: '#f8f9fb', border: 'none' }}
              className="hidden sm:flex"
            />
            {(searchText || tableKey) && (
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
                Add New Product
            </Button>
          </Space>
        </div>
      </Card>

      <Card variant="borderless" style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <Table
          key={tableKey}
          columns={columns}
          dataSource={searchText ? filteredProducts : products}
          rowKey="id"
          loading={loading}
          className="premium-table"
          scroll={{ x: 1200, y: 'calc(100vh - 420px)' }}
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

      <ProductForm open={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchProducts(); }} product={selectedProduct} />
    </div>
  );
};

export default Products;
