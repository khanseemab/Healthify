import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Typography, Button, Card, Form, Input, Select, TimePicker,
  Checkbox, Switch, Tag, Space, Row, Col, Empty, Spin, Popconfirm,
  Drawer, Tooltip, Badge, Segmented, message, Modal,
} from 'antd';
import {
  ArrowLeftOutlined, BellOutlined, PlusOutlined, DeleteOutlined,
  EditOutlined, MedicineBoxOutlined, HeartOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useReminders, useCreateReminder, useUpdateReminder, useDeleteReminder, useToggleReminder,
} from '../hooks/queries';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = { Monday: 'M', Tuesday: 'T', Wednesday: 'W', Thursday: 'T', Friday: 'F', Saturday: 'S', Sunday: 'S' };

const TYPE_META = {
  medicine: {
    color: 'blue',
    icon: <MedicineBoxOutlined />,
    label: 'Medicine',
    gradient: 'linear-gradient(135deg, #1b6ca8, #3b82f6)',
  },
  checkup: {
    color: 'purple',
    icon: <HeartOutlined />,
    label: 'Health Checkup',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  },
};

const ReminderCard = ({ reminder, onToggle, onDelete, onEdit }) => {
  const meta = TYPE_META[reminder.type];
  return (
    <Card
      size="small"
      style={{
        borderRadius: 14,
        border: reminder.isActive ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
        opacity: reminder.isActive ? 1 : 0.6,
        transition: 'all 0.3s',
        boxShadow: reminder.isActive ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      }}
      bodyStyle={{ padding: '14px 16px' }}
    >
      <Row align="middle" gutter={12}>
        {/* Type icon */}
        <Col>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: meta.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 20,
            }}
          >
            {meta.icon}
          </div>
        </Col>

        {/* Details */}
        <Col flex="auto">
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Space>
              <Text strong style={{ fontSize: 14 }}>
                {reminder.title}
              </Text>
              <Tag color={meta.color} style={{ margin: 0, fontSize: 11 }}>
                {meta.label}
              </Tag>
            </Space>

            <Space size={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> {reminder.time}
              </Text>
              {reminder.dosage && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {reminder.dosage}
                </Text>
              )}
            </Space>

            {reminder.days?.length > 0 && (
              <Space size={4}>
                {DAYS.map((day) => (
                  <div
                    key={day}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: reminder.days.includes(day) ? meta.gradient : '#f1f5f9',
                      color: reminder.days.includes(day) ? 'white' : '#94a3b8',
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {DAY_SHORT[day]}
                  </div>
                ))}
              </Space>
            )}

            {reminder.description && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {reminder.description}
              </Text>
            )}
          </Space>
        </Col>

        {/* Actions */}
        <Col>
          <Space direction="vertical" size={8} align="center">
            <Switch
              checked={reminder.isActive}
              onChange={() => onToggle(reminder._id)}
              size="small"
            />
            <Space size={4}>
              <Tooltip title="Edit">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(reminder)}
                  style={{ color: '#64748b' }}
                />
              </Tooltip>
              <Popconfirm
                title="Delete this reminder?"
                onConfirm={() => onDelete(reminder._id)}
                okType="danger"
              >
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </Space>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

const ReminderForm = ({ form, editReminder }) => (
  <Form form={form} layout="vertical">
    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Required' }]}>
      <Input placeholder="e.g. Metformin 500mg" />
    </Form.Item>

    <Row gutter={12}>
      <Col xs={24} sm={12}>
        <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Required' }]}>
          <Select
            options={[
              { value: 'medicine', label: <Space><MedicineBoxOutlined /> Medicine</Space> },
              { value: 'checkup', label: <Space><HeartOutlined /> Health Checkup</Space> },
            ]}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Required' }]}>
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item name="dosage" label="Dosage / Notes">
      <Input placeholder="e.g. 1 tablet, 500mg" />
    </Form.Item>

    <Form.Item name="days" label="Repeat on Days">
      <Checkbox.Group>
        <Row gutter={[6, 6]}>
          {DAYS.map((day) => (
            <Col key={day}>
              <Checkbox value={day}>{day.slice(0, 3)}</Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    </Form.Item>

    <Form.Item name="description" label="Description">
      <Input.TextArea rows={2} placeholder="Optional notes..." />
    </Form.Item>
  </Form>
);

export default function Reminders() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editReminder, setEditReminder] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [messageApi, contextHolder] = message.useMessage();

  const params = filterType !== 'all' ? { type: filterType } : {};
  const { data: reminders = [], isLoading } = useReminders(params);
  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder();
  const deleteMutation = useDeleteReminder();
  const toggleMutation = useToggleReminder();

  const openCreate = () => {
    setEditReminder(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openEdit = (reminder) => {
    setEditReminder(reminder);
    form.setFieldsValue({
      ...reminder,
      time: dayjs(reminder.time, 'HH:mm'),
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        time: values.time ? values.time.format('HH:mm') : '',
        days: values.days || [],
      };

      if (editReminder) {
        await updateMutation.mutateAsync({ id: editReminder._id, data: payload });
        messageApi.success('Reminder updated.');
      } else {
        await createMutation.mutateAsync(payload);
        messageApi.success('Reminder created!');
      }
      setDrawerOpen(false);
    } catch (err) {
      if (err?.errorFields) return; // validation error
      messageApi.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      messageApi.success('Reminder deleted.');
    } catch (err) {
      messageApi.error(err.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch (err) {
      messageApi.error(err.message);
    }
  };

  const activeCount = reminders.filter((r) => r.isActive).length;
  const medicineCount = reminders.filter((r) => r.type === 'medicine').length;
  const checkupCount = reminders.filter((r) => r.type === 'checkup').length;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {contextHolder}

      {/* Header */}
      <Header
        style={{
          background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{ color: 'white' }}
        />
        <BellOutlined style={{ color: 'white', fontSize: 22 }} />
        <Title level={4} style={{ color: 'white', margin: 0, flex: 1 }}>
          Reminder System
        </Title>
        <Badge count={activeCount} color="#10b981">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            New Reminder
          </Button>
        </Badge>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {/* Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[
            { label: 'Total', value: reminders.length, color: '#64748b', icon: <BellOutlined /> },
            { label: 'Active', value: activeCount, color: '#10b981', icon: <BellOutlined /> },
            { label: 'Medicine', value: medicineCount, color: '#1b6ca8', icon: <MedicineBoxOutlined /> },
            { label: 'Checkups', value: checkupCount, color: '#7c3aed', icon: <HeartOutlined /> },
          ].map((stat) => (
            <Col xs={12} sm={6} key={stat.label}>
              <Card
                size="small"
                style={{ textAlign: 'center', borderRadius: 12 }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {stat.label}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filter */}
        <div style={{ marginBottom: 16 }}>
          <Segmented
            options={[
              { label: 'All', value: 'all' },
              { label: <Space><MedicineBoxOutlined /> Medicine</Space>, value: 'medicine' },
              { label: <Space><HeartOutlined /> Checkup</Space>, value: 'checkup' },
            ]}
            value={filterType}
            onChange={setFilterType}
          />
        </div>

        {/* Reminders list */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : reminders.length === 0 ? (
          <Empty
            image={<BellOutlined style={{ fontSize: 64, color: '#cbd5e1' }} />}
            description={
              <Space direction="vertical" align="center">
                <Text style={{ fontSize: 16, color: '#64748b', fontWeight: 600 }}>
                  No reminders yet
                </Text>
                <Text type="secondary">
                  Create your first reminder to stay on top of your health.
                </Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                  Add Reminder
                </Button>
              </Space>
            }
            style={{ padding: '60px 0' }}
          />
        ) : (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={openEdit}
              />
            ))}
          </Space>
        )}
      </Content>

      {/* Drawer – Create / Edit */}
      <Drawer
        title={
          <Space>
            <BellOutlined style={{ color: '#7c3aed' }} />
            {editReminder ? 'Edit Reminder' : 'New Reminder'}
          </Space>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={440}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={handleSave}
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'none' }}
            >
              {editReminder ? 'Update' : 'Save'}
            </Button>
          </Space>
        }
      >
        <ReminderForm form={form} editReminder={editReminder} />
      </Drawer>
    </Layout>
  );
}
