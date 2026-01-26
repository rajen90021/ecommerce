import React, { useEffect, useState } from 'react';
import { Table, message, Card, Button, Tag, Select, Space, Modal, Descriptions, Divider } from 'antd';
import { 
  EyeOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  DollarOutlined,
  UserOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { orderService } from '../services/orderService';
import type { Order } from '../types';
import { format } from 'date-fns';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setOrders(data.orders || []);
      setPagination({ ...pagination, total: data.total || 0 });
    } catch (error) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      message.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode }> = {
      placed: { color: 'default', icon: <ClockCircleOutlined /> },
      confirmed: { color: 'blue', icon: <CheckCircleOutlined /> },
      processing: { color: 'processing', icon: <SyncOutlined spin /> },
      shipped: { color: 'cyan', icon: <TruckOutlined /> },
      out_for_delivery: { color: 'purple', icon: <TruckOutlined /> },
      delivered: { color: 'success', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'error', icon: <CloseCircleOutlined /> },
      returned: { color: 'warning', icon: <CloseCircleOutlined /> },
    };
    return configs[status] || { color: 'default', icon: null };
  };

  const getStatusTag = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <Tag icon={config.icon} color={config.color}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Tag>
    );
  };

  const getPaymentStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'success',
      not_paid: 'warning',
      refunded: 'error',
    };
    return (
      <Tag color={colors[status] || 'default'}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Tag>
    );
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Order ID',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 150,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_, record: Order) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.user?.name || 'Guest'}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'orderItems',
      key: 'items',
      width: 80,
      align: 'center',
      render: (items: any[]) => (
        <Tag color="blue">{items?.length || 0}</Tag>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'net_amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <span style={{ fontWeight: 600 }}>₹{Number(amount || 0).toFixed(2)}</span>
      ),
    },
    {
      title: 'Payment',
      key: 'payment',
      width: 150,
      render: (_, record: Order) => (
        <Space direction="vertical" size={0}>
          {getPaymentStatusTag(record.payment_status)}
          <span style={{ fontSize: '11px', color: '#666' }}>
            {record.payment_type?.toUpperCase()}
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: string, record: Order) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record.id, val)}
          style={{ width: '100%' }}
          size="small"
        >
          <Select.Option value="placed">Placed</Select.Option>
          <Select.Option value="confirmed">Confirmed</Select.Option>
          <Select.Option value="processing">Processing</Select.Option>
          <Select.Option value="shipped">Shipped</Select.Option>
          <Select.Option value="out_for_delivery">Out for Delivery</Select.Option>
          <Select.Option value="delivered">Delivered</Select.Option>
          <Select.Option value="cancelled">Cancelled</Select.Option>
          <Select.Option value="returned">Returned</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      width: 150,
      render: (date: string) => (
        <div>
          <div>{date ? format(new Date(date), 'MMM dd, yyyy') : '-'}</div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {date ? format(new Date(date), 'hh:mm a') : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record: Order) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => showOrderDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
              <ShoppingOutlined style={{ marginRight: '12px' }} />
              Order Management
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Manage and track all customer orders
            </p>
          </div>
          <Space size="large">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1890ff' }}>
                {orders.filter(o => o.status === 'placed').length}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>New Orders</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#52c41a' }}>
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Delivered</div>
            </div>
          </Space>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`,
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

      {/* Order Details Modal */}
      <Modal
        title={
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            <ShoppingOutlined style={{ marginRight: '8px' }} />
            Order Details
          </div>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            {/* Order Info */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Order Number" span={2}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {selectedOrder.order_number}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {selectedOrder.created_at
                  ? format(new Date(selectedOrder.created_at), 'PPpp')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                {getPaymentStatusTag(selectedOrder.payment_status)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedOrder.payment_type?.toUpperCase() || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Customer Info */}
            <h3 style={{ marginBottom: '16px' }}>
              <UserOutlined style={{ marginRight: '8px' }} />
              Customer Information
            </h3>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Name">
                {selectedOrder.user?.name || 'Guest'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user?.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedOrder.user?.phone || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Shipping Address */}
            <h3 style={{ marginBottom: '16px' }}>
              <EnvironmentOutlined style={{ marginRight: '8px' }} />
              Shipping Address
            </h3>
            <Card size="small" style={{ background: '#f5f5f5' }}>
              <div>
                <strong>{selectedOrder.shippingAddress?.full_name}</strong>
              </div>
              <div>{selectedOrder.shippingAddress?.address_line1}</div>
              {selectedOrder.shippingAddress?.address_line2 && (
                <div>{selectedOrder.shippingAddress.address_line2}</div>
              )}
              <div>
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{' '}
                {selectedOrder.shippingAddress?.postal_code}
              </div>
              <div>{selectedOrder.shippingAddress?.country || 'India'}</div>
              <div style={{ marginTop: '8px' }}>
                <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
              </div>
            </Card>

            <Divider />

            {/* Order Items */}
            <h3 style={{ marginBottom: '16px' }}>
              <ShoppingOutlined style={{ marginRight: '8px' }} />
              Order Items
            </h3>
            <Table
              dataSource={selectedOrder.orderItems}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'product_name',
                  key: 'product',
                  render: (name: string, record: any) => (
                    <div>
                      <div style={{ fontWeight: 600 }}>{name}</div>
                      {(record.color || record.size) && (
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          {record.color && `Color: ${record.color}`}
                          {record.color && record.size && ' | '}
                          {record.size && `Size: ${record.size}`}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  width: 100,
                  render: (price: number) => `₹${Number(price || 0).toFixed(2)}`,
                },
                {
                  title: 'Qty',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 60,
                  align: 'center',
                },
                {
                  title: 'Total',
                  dataIndex: 'total_amount',
                  key: 'total',
                  width: 120,
                  render: (total: number) => (
                    <strong>₹{Number(total || 0).toFixed(2)}</strong>
                  ),
                },
              ]}
            />

            <Divider />

            {/* Price Summary */}
            <h3 style={{ marginBottom: '16px' }}>
              <DollarOutlined style={{ marginRight: '8px' }} />
              Price Summary
            </h3>
            <div style={{ maxWidth: '400px', marginLeft: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Subtotal:</span>
                <span>₹{Number(selectedOrder.total_amount || 0).toFixed(2)}</span>
              </div>
              {Number(selectedOrder.discount_amount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#52c41a' }}>
                  <span>Discount:</span>
                  <span>- ₹{Number(selectedOrder.discount_amount || 0).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Shipping:</span>
                <span>₹{Number(selectedOrder.shipping_amount || 0).toFixed(2)}</span>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
                <span>Total:</span>
                <span>₹{Number(selectedOrder.net_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
