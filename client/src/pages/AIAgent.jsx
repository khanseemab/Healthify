import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Typography, Button, Upload, Card, Input, Space, Tag, Spin,
  Tooltip, Divider, Empty, Badge, message, Row, Col,
} from 'antd';
import {
  ArrowLeftOutlined, RobotOutlined, UploadOutlined, FilePdfOutlined,
  SendOutlined, DeleteOutlined, InfoCircleOutlined, UserOutlined,
  CheckCircleFilled, CloseCircleOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { useDocumentStatus, useUploadPDF, useClearDocument, useAskQuestion } from '../hooks/queries';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SourceCard = ({ sources }) => {
  if (!sources?.length) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <Divider style={{ margin: '10px 0', fontSize: 11, color: '#94a3b8' }}>Sources</Divider>
      <Space direction="vertical" style={{ width: '100%' }} size={6}>
        {sources.map((s, i) => (
          <Card
            key={i}
            size="small"
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: '8px 12px' }}
          >
            <Space>
              <FileTextOutlined style={{ color: '#10b981' }} />
              <Tag color="green" style={{ margin: 0 }}>
                Page {s.page}, Para {s.paragraph}
              </Tag>
            </Space>
            <Paragraph
              ellipsis={{ rows: 2, expandable: true }}
              style={{ margin: '4px 0 0', fontSize: 12, color: '#475569' }}
            >
              {s.excerpt}
            </Paragraph>
          </Card>
        ))}
      </Space>
    </div>
  );
};

export default function AIAgent() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: statusData, isLoading: statusLoading } = useDocumentStatus();
  const uploadMutation = useUploadPDF();
  const clearMutation = useClearDocument();
  const askMutation = useAskQuestion();

  const docLoaded = statusData?.loaded;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, askMutation.isPending]);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await uploadMutation.mutateAsync(formData);
      messageApi.success(`"${res.fileName}" processed — ${res.totalChunks} chunks across ${res.totalPages} pages.`);
      setMessages([]);
      onSuccess(res);
    } catch (err) {
      messageApi.error(err.message);
      onError(err);
    }
  };

  const handleAsk = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    try {
      const res = await askMutation.mutateAsync(q);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: res.answer, sources: res.sources },
      ]);
    } catch (err) {
      messageApi.error(err.message);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: `Error: ${err.message}`, sources: [] },
      ]);
    }
  };

  const handleClear = async () => {
    try {
      await clearMutation.mutateAsync();
      setMessages([]);
      messageApi.info('Document cleared.');
    } catch (err) {
      messageApi.error(err.message);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {contextHolder}

      {/* Header */}
      <Header
        style={{
          background: 'linear-gradient(90deg, #0f4c75 0%, #1b6ca8 100%)',
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
        <RobotOutlined style={{ color: 'white', fontSize: 22 }} />
        <Title level={4} style={{ color: 'white', margin: 0, flex: 1 }}>
          Healthify AI Agent
        </Title>
        {docLoaded && (
          <Badge
            status="success"
            text={
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                {statusData?.fileName}
              </Text>
            }
          />
        )}
      </Header>

      <Layout style={{ flex: 1 }}>
        {/* Sidebar */}
        <Sider
          width={300}
          breakpoint="lg"
          collapsedWidth={0}
          style={{
            background: 'white',
            borderRight: '1px solid #e2e8f0',
            padding: '24px 16px',
          }}
        >
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            {/* Upload */}
            <div>
              <Text strong style={{ fontSize: 13, color: '#64748b', letterSpacing: 0.5 }}>
                UPLOAD PDF
              </Text>
              <div style={{ marginTop: 12 }}>
                <Upload.Dragger
                  accept=".pdf"
                  customRequest={handleUpload}
                  showUploadList={false}
                  disabled={uploadMutation.isPending}
                  style={{ borderRadius: 10 }}
                >
                  <Space direction="vertical" size={4} align="center">
                    <FilePdfOutlined style={{ fontSize: 32, color: '#10b981' }} />
                    <Text style={{ fontSize: 13 }}>
                      {uploadMutation.isPending ? 'Processing...' : 'Drop PDF or click'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Max 20MB
                    </Text>
                  </Space>
                </Upload.Dragger>

                {uploadMutation.isPending && (
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <Spin size="small" />
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                      Extracting & indexing chunks…
                    </Text>
                  </div>
                )}
              </div>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* Document Status */}
            <div>
              <Text strong style={{ fontSize: 13, color: '#64748b', letterSpacing: 0.5 }}>
                DOCUMENT STATUS
              </Text>
              <Card
                size="small"
                style={{ marginTop: 10, borderRadius: 10 }}
                bodyStyle={{ padding: 12 }}
              >
                {statusLoading ? (
                  <Spin size="small" />
                ) : docLoaded ? (
                  <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    <Space>
                      <CheckCircleFilled style={{ color: '#10b981' }} />
                      <Text strong style={{ fontSize: 13, color: '#10b981' }}>
                        Loaded
                      </Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <FilePdfOutlined /> {statusData?.fileName}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {statusData?.totalChunks} chunks indexed
                    </Text>
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={clearMutation.isPending}
                      onClick={handleClear}
                      style={{ marginTop: 4, width: '100%' }}
                    >
                      Clear Document
                    </Button>
                  </Space>
                ) : (
                  <Space>
                    <CloseCircleOutlined style={{ color: '#94a3b8' }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      No document loaded
                    </Text>
                  </Space>
                )}
              </Card>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* Tips */}
            <div>
              <Text strong style={{ fontSize: 13, color: '#64748b', letterSpacing: 0.5 }}>
                <InfoCircleOutlined /> TIPS
              </Text>
              <ul style={{ marginTop: 8, paddingLeft: 16, fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
                <li>Upload a health report, prescription, or medical research paper.</li>
                <li>Ask specific questions for precise answers.</li>
                <li>Sources include page number, paragraph, and excerpt.</li>
              </ul>
            </div>
          </Space>
        </Sider>

        {/* Chat Area */}
        <Content style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Empty
                  image={<RobotOutlined style={{ fontSize: 64, color: '#cbd5e1' }} />}
                  description={
                    <Space direction="vertical" align="center" size={4}>
                      <Text style={{ fontSize: 16, color: '#64748b', fontWeight: 600 }}>
                        {docLoaded ? 'Ask anything about your document' : 'Upload a PDF to get started'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {docLoaded
                          ? "I'll answer with exact source citations — page, paragraph & excerpt."
                          : 'Drag & drop or click the upload area in the sidebar.'}
                      </Text>
                    </Space>
                  }
                />
              </div>
            ) : (
              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      gap: 6,
                      animationDelay: `${i * 0.05}s`,
                    }}
                    className="fade-in-up"
                  >
                    <Space
                      size={6}
                      style={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background:
                            msg.role === 'user'
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : 'linear-gradient(135deg, #1b6ca8, #0f4c75)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {msg.role === 'user' ? (
                          <UserOutlined style={{ color: 'white', fontSize: 13 }} />
                        ) : (
                          <RobotOutlined style={{ color: 'white', fontSize: 13 }} />
                        )}
                      </div>
                    </Space>

                    <div
                      className={`message-bubble ${msg.role}`}
                      style={{ maxWidth: '75%' }}
                    >
                      <Paragraph
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          color: msg.role === 'user' ? 'white' : '#1e293b',
                          fontSize: 14,
                          lineHeight: 1.7,
                        }}
                      >
                        {msg.content}
                      </Paragraph>
                      {msg.role === 'ai' && <SourceCard sources={msg.sources} />}
                    </div>
                  </div>
                ))}

                {askMutation.isPending && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1b6ca8, #0f4c75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RobotOutlined style={{ color: 'white', fontSize: 13 }} />
                    </div>
                    <Card
                      size="small"
                      style={{ borderRadius: 16, borderBottomLeftRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      bodyStyle={{ padding: '10px 14px' }}
                    >
                      <Space size={4}>
                        <Spin size="small" />
                        <Text type="secondary" style={{ fontSize: 13 }}>Thinking…</Text>
                      </Space>
                    </Card>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '16px 24px',
              background: 'white',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Row gutter={12} align="bottom">
              <Col flex="auto">
                <TextArea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                  placeholder={
                    docLoaded
                      ? 'Ask a question about the document… (Enter to send)'
                      : 'Upload a PDF first to ask questions'
                  }
                  disabled={!docLoaded || askMutation.isPending}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ borderRadius: 10, resize: 'none' }}
                />
              </Col>
              <Col>
                <Tooltip title="Send (Enter)">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    size="large"
                    disabled={!docLoaded || !input.trim() || askMutation.isPending}
                    loading={askMutation.isPending}
                    onClick={handleAsk}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                    }}
                  />
                </Tooltip>
              </Col>
            </Row>
            <Text type="secondary" style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
              Powered by OpenRouter · Answers are based solely on the uploaded document
            </Text>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
