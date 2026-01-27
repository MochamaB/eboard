import React from 'react';
import { Typography, Divider, Select, Space, InputNumber, Row, Col, DatePicker, Checkbox, Switch, Alert, Table, Tag, Button } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

const WEEKDAYS = [
  { value: 'sunday', label: 'Sunday', short: 'Sun' },
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
];

const WEEK_OF_MONTH_OPTIONS = [
  { value: 1, label: 'First' },
  { value: 2, label: 'Second' },
  { value: 3, label: 'Third' },
  { value: 4, label: 'Fourth' },
  { value: -1, label: 'Last' },
];

interface RecurringSettingsStepProps {
  form: any;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  recurrencePattern: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  setRecurrencePattern: (value: 'weekly' | 'monthly' | 'quarterly' | 'annually') => void;
  weeklyDays: string[];
  setWeeklyDays: (value: string[]) => void;
  monthlyType: 'dayOfMonth' | 'dayOfWeek';
  setMonthlyType: (value: 'dayOfMonth' | 'dayOfWeek') => void;
  monthlyDayOfMonth: number;
  setMonthlyDayOfMonth: (value: number) => void;
  monthlyWeekOfMonth: number;
  setMonthlyWeekOfMonth: (value: number) => void;
  monthlyDayOfWeek: string;
  setMonthlyDayOfWeek: (value: string) => void;
  quarterlyMonths: number[];
  setQuarterlyMonths: (value: number[]) => void;
  endType: 'date' | 'occurrences';
  setEndType: (value: 'date' | 'occurrences') => void;
  endDate: Dayjs | null;
  setEndDate: (value: Dayjs | null) => void;
  occurrences: number;
  setOccurrences: (value: number) => void;
  generatedDates: { date: Dayjs; excluded: boolean; conflict?: string }[];
  onGenerateDates: () => void;
  onToggleDateExclusion: (dateStr: string) => void;
}

const RecurringSettingsStep: React.FC<RecurringSettingsStepProps> = ({
  form,
  isRecurring,
  setIsRecurring,
  recurrencePattern,
  setRecurrencePattern,
  weeklyDays,
  setWeeklyDays,
  monthlyType,
  setMonthlyType,
  monthlyDayOfMonth,
  setMonthlyDayOfMonth,
  monthlyWeekOfMonth,
  setMonthlyWeekOfMonth,
  monthlyDayOfWeek,
  setMonthlyDayOfWeek,
  quarterlyMonths,
  setQuarterlyMonths,
  endType,
  setEndType,
  endDate,
  setEndDate,
  occurrences,
  setOccurrences,
  generatedDates,
  onGenerateDates,
  onToggleDateExclusion,
}) => {
  const includedDates = generatedDates.filter(d => !d.excluded);
  const excludedCount = generatedDates.filter(d => d.excluded).length;

  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Recurring Meeting Settings</Title>
      <Text type="secondary">
        Configure recurrence pattern and preview the meeting series.
      </Text>
      <Divider />

      {/* Recurring Toggle */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: isRecurring ? '#e6f7ff' : '#fafafa',
        borderRadius: 8,
        border: isRecurring ? '1px solid #91d5ff' : '1px solid #d9d9d9',
        marginBottom: isRecurring ? 24 : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SyncOutlined style={{ fontSize: 20, color: isRecurring ? '#1890ff' : '#8c8c8c' }} />
          <div>
            <Text strong>Create Recurring Meeting Series</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Generate multiple meetings with the same settings
              </Text>
            </div>
          </div>
        </div>
        <Switch 
          checked={isRecurring} 
          onChange={(checked) => setIsRecurring(checked)}
        />
      </div>

      {/* Recurrence Configuration */}
      {isRecurring && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#fafafa', 
            borderRadius: 8,
            border: '1px solid #d9d9d9',
          }}>
            {/* Recurrence Pattern - Card Based */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Recurrence Pattern</Text>
              <Row gutter={12}>
                {[
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'annually', label: 'Annually' },
                ].map((option) => {
                  const isSelected = recurrencePattern === option.value;
                  return (
                    <Col span={6} key={option.value}>
                      <div
                        onClick={() => setRecurrencePattern(option.value as 'weekly' | 'monthly' | 'quarterly' | 'annually')}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'center',
                          borderRadius: 6,
                          border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          backgroundColor: isSelected ? '#e6f7ff' : '#fff',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                      >
                        <Text strong style={{ fontSize: 13, color: isSelected ? '#1890ff' : '#595959' }}>
                          {option.label}
                        </Text>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>

            {/* Weekly Options */}
            {recurrencePattern === 'weekly' && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Repeat on</Text>
                <Checkbox.Group 
                  value={weeklyDays} 
                  onChange={(values) => setWeeklyDays(values as string[])}
                >
                  <Row gutter={[8, 8]}>
                    {WEEKDAYS.map(day => (
                      <Col key={day.value}>
                        <Checkbox value={day.value}>{day.short}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </div>
            )}

            {/* Monthly/Quarterly Options */}
            {(recurrencePattern === 'monthly' || recurrencePattern === 'quarterly') && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Day Selection</Text>
                <Row gutter={12}>
                  <Col span={24}>
                    <Select
                      value={monthlyType}
                      onChange={setMonthlyType}
                      style={{ width: '100%', marginBottom: 12 }}
                      options={[
                        { value: 'dayOfMonth', label: 'Specific day of month' },
                        { value: 'dayOfWeek', label: 'Specific day of week' },
                      ]}
                    />
                  </Col>
                </Row>
                {monthlyType === 'dayOfMonth' && (
                  <Row gutter={12} align="middle">
                    <Col flex="none">
                      <Text>Day</Text>
                    </Col>
                    <Col flex="none">
                      <InputNumber 
                        min={1} 
                        max={31} 
                        value={monthlyDayOfMonth}
                        onChange={(v) => setMonthlyDayOfMonth(v || 1)}
                        style={{ width: 70 }}
                      />
                    </Col>
                    <Col flex="none">
                      <Text>of the month</Text>
                    </Col>
                  </Row>
                )}
                {monthlyType === 'dayOfWeek' && (
                  <Row gutter={12} align="middle">
                    <Col flex="none">
                      <Text>The</Text>
                    </Col>
                    <Col flex="none">
                      <Select
                        value={monthlyWeekOfMonth}
                        onChange={setMonthlyWeekOfMonth}
                        style={{ width: 100 }}
                        options={WEEK_OF_MONTH_OPTIONS}
                      />
                    </Col>
                    <Col flex="none">
                      <Select
                        value={monthlyDayOfWeek}
                        onChange={setMonthlyDayOfWeek}
                        style={{ width: 120 }}
                        options={WEEKDAYS.map(d => ({ value: d.value, label: d.label }))}
                      />
                    </Col>
                  </Row>
                )}
              </div>
            )}

            {/* Quarterly Months */}
            {recurrencePattern === 'quarterly' && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Quarters</Text>
                <Checkbox.Group 
                  value={quarterlyMonths} 
                  onChange={(values) => setQuarterlyMonths(values as number[])}
                >
                  <Space>
                    <Checkbox value={1}>Q1 (Jan)</Checkbox>
                    <Checkbox value={4}>Q2 (Apr)</Checkbox>
                    <Checkbox value={7}>Q3 (Jul)</Checkbox>
                    <Checkbox value={10}>Q4 (Oct)</Checkbox>
                  </Space>
                </Checkbox.Group>
              </div>
            )}

            <Divider style={{ margin: '12px 0' }} />

            {/* End Condition */}
            <div style={{ marginBottom: 0 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>End</Text>
              <Row gutter={12}>
                <Col span={24}>
                  <Select
                    value={endType}
                    onChange={setEndType}
                    style={{ width: '100%', marginBottom: 12 }}
                    options={[
                      { value: 'occurrences', label: 'After specific number of occurrences' },
                      { value: 'date', label: 'On a specific date' },
                    ]}
                  />
                </Col>
              </Row>
              {endType === 'occurrences' && (
                <Row gutter={12} align="middle">
                  <Col flex="none">
                    <Text>After</Text>
                  </Col>
                  <Col flex="none">
                    <InputNumber 
                      min={2} 
                      max={52} 
                      value={occurrences}
                      onChange={(v) => setOccurrences(v || 12)}
                      style={{ width: 80 }}
                    />
                  </Col>
                  <Col flex="none">
                    <Text>occurrences (max 52)</Text>
                  </Col>
                </Row>
              )}
              {endType === 'date' && (
                <Row gutter={12} align="middle">
                  <Col flex="none">
                    <Text>On date</Text>
                  </Col>
                  <Col flex="auto">
                    <DatePicker 
                      value={endDate}
                      onChange={setEndDate}
                      style={{ width: '100%' }}
                      disabledDate={(current) => {
                        const startDate = form.getFieldValue('scheduledDate');
                        return current && startDate && current.isBefore(startDate, 'day');
                      }}
                    />
                  </Col>
                </Row>
              )}
            </div>
          </div>

          {/* Preview Series */}
          <div>
            <Alert
              type="info"
              message={
                generatedDates.length > 0 ? (
                  <span>
                    <strong>{includedDates.length}</strong> meetings will be created
                    {excludedCount > 0 && <span> ({excludedCount} excluded)</span>}
                  </span>
                ) : (
                  <span>Configure the recurrence pattern above and click "Generate Dates" to preview the meeting series</span>
                )
              }
              description={
                generatedDates.length > 0 && (
                  <span>
                    Pattern: {recurrencePattern.charAt(0).toUpperCase() + recurrencePattern.slice(1)} • 
                    {recurrencePattern === 'weekly' && ` Every ${weeklyDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`}
                    {recurrencePattern === 'monthly' && (monthlyType === 'dayOfMonth' 
                      ? ` Day ${monthlyDayOfMonth} of each month`
                      : ` ${WEEK_OF_MONTH_OPTIONS.find(w => w.value === monthlyWeekOfMonth)?.label} ${monthlyDayOfWeek.charAt(0).toUpperCase() + monthlyDayOfWeek.slice(1)} of each month`
                    )}
                    {recurrencePattern === 'quarterly' && ` Quarters: ${quarterlyMonths.map(m => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m-1]).join(', ')}`}
                    {recurrencePattern === 'annually' && ' Same date each year'}
                  </span>
                )
              }
              style={{ marginBottom: 16 }}
              showIcon
              action={
                <Button 
                  type={generatedDates.length === 0 ? 'primary' : 'default'}
                  onClick={onGenerateDates}
                >
                  {generatedDates.length === 0 ? 'Generate Dates' : 'Regenerate'}
                </Button>
              }
            />

            {generatedDates.length > 0 && (
              <>
                {generatedDates.length > 24 && (
                  <Alert
                    type="warning"
                    message={`This will create ${includedDates.length} meetings`}
                    description="Consider reducing the number of occurrences or using a longer interval."
                    style={{ marginBottom: 16 }}
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                  />
                )}

                <Table
                  dataSource={generatedDates.map((d, i) => ({
                    key: i,
                    index: i + 1,
                    date: d.date,
                    dateStr: d.date.format('YYYY-MM-DD'),
                    dayOfWeek: d.date.format('dddd'),
                    formattedDate: d.date.format('MMMM D, YYYY'),
                    excluded: d.excluded,
                    conflict: d.conflict,
                  }))}
                  columns={[
                    {
                      title: '#',
                      dataIndex: 'index',
                      width: 50,
                      render: (index: number, record: { excluded: boolean }) => (
                        <Text type={record.excluded ? 'secondary' : undefined} delete={record.excluded}>
                          {index}
                        </Text>
                      ),
                    },
                    {
                      title: 'Date',
                      dataIndex: 'formattedDate',
                      render: (text: string, record: { excluded: boolean; dayOfWeek: string }) => (
                        <div>
                          <Text type={record.excluded ? 'secondary' : undefined} delete={record.excluded}>
                            {text}
                          </Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{record.dayOfWeek}</Text>
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: 'Status',
                      dataIndex: 'excluded',
                      width: 120,
                      render: (excluded: boolean, record: { conflict?: string }) => (
                        <Space>
                          {excluded ? (
                            <Tag color="default">Excluded</Tag>
                          ) : record.conflict ? (
                            <Tag color="warning" icon={<ExclamationCircleOutlined />}>Conflict</Tag>
                          ) : (
                            <Tag color="success">Included</Tag>
                          )}
                        </Space>
                      ),
                    },
                    {
                      title: 'Action',
                      width: 100,
                      render: (_: unknown, record: { dateStr: string; excluded: boolean }) => (
                        <Button
                          size="small"
                          type={record.excluded ? 'link' : 'text'}
                          danger={!record.excluded}
                          onClick={() => onToggleDateExclusion(record.dateStr)}
                        >
                          {record.excluded ? 'Include' : 'Exclude'}
                        </Button>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                />
              </>
            )}

            {generatedDates.length === 0 && (
              <div style={{ 
                padding: 40, 
                textAlign: 'center', 
                backgroundColor: '#fafafa', 
                borderRadius: 8,
                border: '1px dashed #d9d9d9',
              }}>
                <SyncOutlined style={{ fontSize: 32, color: '#8c8c8c', marginBottom: 12 }} />
                <div>
                  <Text type="secondary">Click "Generate Dates" to preview the meeting series</Text>
                </div>
              </div>
            )}
          </div>
        </Space>
      )}
    </div>
  );
};

export default RecurringSettingsStep;
