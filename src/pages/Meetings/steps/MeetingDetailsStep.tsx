import React, { useEffect } from 'react';
import { Form, Typography, Divider, Select, Space, Input, DatePicker, TimePicker, InputNumber, Row, Col, AutoComplete } from 'antd';
import { VideoCameraOutlined, EnvironmentOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface MeetingDetailsStepProps {
  form: any;
  locationType?: string;
  selectedBoard?: { label: string; type: string };
  meetingType?: string;
  onStartTimeOrDurationChange: () => void;
  onEndTimeChange: () => void;
}

const MeetingDetailsStep: React.FC<MeetingDetailsStepProps> = ({
  form,
  locationType,
  selectedBoard,
  meetingType,
  onStartTimeOrDurationChange,
  onEndTimeChange,
}) => {
  // Set default values on mount
  useEffect(() => {
    const currentDate = form.getFieldValue('scheduledDate');
    const currentStartTime = form.getFieldValue('startTime');
    const currentEndTime = form.getFieldValue('endTime');
    
    if (!currentDate) {
      form.setFieldValue('scheduledDate', dayjs());
    }
    if (!currentStartTime) {
      form.setFieldValue('startTime', dayjs().hour(8).minute(0));
    }
    if (!currentEndTime) {
      form.setFieldValue('endTime', dayjs().hour(10).minute(0));
    }
    
    // Calculate initial duration if not set
    const duration = form.getFieldValue('duration');
    if (!duration) {
      const start = form.getFieldValue('startTime') || dayjs().hour(8).minute(0);
      const end = form.getFieldValue('endTime') || dayjs().hour(10).minute(0);
      const calculatedDuration = end.diff(start, 'minute');
      if (calculatedDuration > 0) {
        form.setFieldValue('duration', calculatedDuration);
      }
    }
  }, [form]);

  // Auto-populate title when board and meeting type are available
  useEffect(() => {
    console.log('🔍 MeetingDetailsStep - Auto-populate useEffect triggered');
    console.log('  📋 selectedBoard:', selectedBoard);
    console.log('  📝 meetingType:', meetingType);
    
    const currentTitle = form.getFieldValue('title');
    console.log('  ✏️ currentTitle:', currentTitle);
    
    if (!currentTitle && selectedBoard && meetingType) {
      const typeLabels: Record<string, string> = {
        regular: 'Regular Board Meeting',
        special: 'Special Board Meeting',
        agm: 'Annual General Meeting',
        emergency: 'Emergency Board Meeting',
        committee: 'Committee Meeting',
      };
      const typeLabel = typeLabels[meetingType] || 'Meeting';
      const suggestedTitle = `${selectedBoard.label} - ${typeLabel}`;
      console.log('  ✅ Setting title to:', suggestedTitle);
      form.setFieldValue('title', suggestedTitle);
    } else {
      console.log('  ❌ Conditions not met:', {
        hasCurrentTitle: !!currentTitle,
        hasSelectedBoard: !!selectedBoard,
        hasMeetingType: !!meetingType
      });
    }
  }, [form, selectedBoard, meetingType]);

  // Generate title suggestions based on board and meeting type
  const titleSuggestions = React.useMemo(() => {
    if (!selectedBoard || !meetingType) return [];
    
    const boardName = selectedBoard.label;
    const currentMonth = dayjs().format('MMMM');
    const currentYear = dayjs().format('YYYY');
    const quarter = `Q${Math.ceil((dayjs().month() + 1) / 3)}`;
    
    const typeLabels: Record<string, string> = {
      regular: 'Regular Board Meeting',
      special: 'Special Board Meeting',
      agm: 'Annual General Meeting',
      emergency: 'Emergency Board Meeting',
      committee: 'Committee Meeting',
    };
    
    const typeLabel = typeLabels[meetingType] || 'Meeting';
    
    return [
      `${boardName} - ${typeLabel}`,
      `${boardName} - ${typeLabel} ${currentMonth} ${currentYear}`,
      `${boardName} - ${typeLabel} ${quarter} ${currentYear}`,
    ];
  }, [selectedBoard, meetingType]);

  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Meeting Details</Title>
      <Text type="secondary">
        Enter the meeting title, date, time, and location information.
      </Text>
      <Divider />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Form.Item
          name="title"
          label="Meeting Title"
          rules={[{ required: true, message: 'Please enter meeting title' }]}
        >
          <AutoComplete
            options={titleSuggestions.map(suggestion => ({ value: suggestion }))}
            placeholder="e.g., Q1 Board Meeting 2025"
            filterOption={(inputValue, option) =>
              option!.value.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="scheduledDate"
              label="Meeting Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="timezone"
              label="Timezone"
              rules={[{ required: true, message: 'Please select timezone' }]}
              initialValue="Africa/Nairobi"
            >
              <Select
                showSearch
                placeholder="Select timezone"
                options={[
                  { value: 'Africa/Nairobi', label: 'East Africa Time (EAT) - Nairobi' },
                  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) - London' },
                  { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
                  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Dubai' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[{ required: true, message: 'Please select start time' }]}
            >
              <TimePicker 
                style={{ width: '100%' }} 
                format="h:mm A" 
                use12Hours
                minuteStep={15}
                showNow={false}
                needConfirm={false}
                onChange={onStartTimeOrDurationChange}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="endTime"
              label="End Time"
              rules={[{ required: true, message: 'End time required' }]}
            >
              <TimePicker 
                style={{ width: '100%' }} 
                format="h:mm A" 
                use12Hours
                minuteStep={15}
                showNow={false}
                needConfirm={false}
                onChange={onEndTimeChange}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber 
                min={15} 
                max={480} 
                step={15} 
                style={{ width: '100%' }}
                onChange={onStartTimeOrDurationChange}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Location Type Cards */}
        <Form.Item
          name="locationType"
          label="Location Type"
          rules={[{ required: true, message: 'Please select location type' }]}
          initialValue="virtual"
        >
          <Input type="hidden" />
        </Form.Item>
        <Row gutter={12} style={{ marginTop: -8, marginBottom: 16 }}>
          {[
            { value: 'physical', label: 'Physical', desc: 'In-person venue', icon: <EnvironmentOutlined style={{ fontSize: 24, color: '#52c41a' }} />, color: '#52c41a' },
            { value: 'virtual', label: 'Virtual', desc: 'Jitsi Meet link', icon: <VideoCameraOutlined style={{ fontSize: 24, color: '#1890ff' }} />, color: '#1890ff' },
            { value: 'hybrid', label: 'Hybrid', desc: 'Both options', icon: <HomeOutlined style={{ fontSize: 24, color: '#faad14' }} />, color: '#faad14' },
          ].map((option) => {
            const isSelected = locationType === option.value;
            return (
              <Col span={8} key={option.value}>
                <div
                  onClick={() => form.setFieldValue('locationType', option.value)}
                  style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    borderRadius: 8,
                    border: isSelected ? `2px solid ${option.color}` : '1px solid #d9d9d9',
                    backgroundColor: isSelected ? `${option.color}08` : '#fff',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: isSelected ? `${option.color}15` : '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {option.icon}
                    </div>
                    <Text strong style={{ fontSize: 13 }}>{option.label}</Text>
                    <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.3 }}>
                      {option.desc}
                    </Text>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>

        {/* Physical Location (conditional) */}
        {(locationType === 'physical' || locationType === 'hybrid') && (
          <Form.Item
            name="physicalLocation"
            label="Physical Location"
            rules={[{ required: locationType === 'physical', message: 'Please enter the physical location' }]}
          >
            <Input placeholder="Enter venue address" />
          </Form.Item>
        )}

        <Form.Item
          name="description"
          label="Description (Optional)"
        >
          <TextArea rows={3} placeholder="Add any additional details about the meeting" />
        </Form.Item>
      </Space>
    </div>
  );
};

export default MeetingDetailsStep;
