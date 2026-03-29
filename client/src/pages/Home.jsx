import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { RobotOutlined, BellOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const panels = [
  {
    key: 'ai-agent',
    route: '/ai-agent',
    icon: <RobotOutlined style={{ fontSize: 64 }} />,
    title: 'Healthify AI Agent',
    subtitle: 'Upload medical PDFs and get instant AI-powered answers with precise source citations.',
    gradient: 'linear-gradient(135deg, #0f4c75 0%, #1b6ca8 50%, #10b981 100%)',
    buttonLabel: 'Launch AI Agent',
    tag: 'RAG · PDF · OpenRouter',
  },
  {
    key: 'reminders',
    route: '/reminders',
    icon: <BellOutlined style={{ fontSize: 64 }} />,
    title: 'Reminder System',
    subtitle: 'Schedule medicine reminders and health checkups — never miss a dose or appointment.',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
    buttonLabel: 'Open Reminders',
    tag: 'Medicine · Checkup · Schedule',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [hoveredKey, setHoveredKey] = useState(null);

  return (
    <div className="home-split">
      {panels.map((panel) => {
        const isHovered = hoveredKey === panel.key;
        return (
          <div
            key={panel.key}
            onMouseEnter={() => setHoveredKey(panel.key)}
            onMouseLeave={() => setHoveredKey(null)}
            style={{
              flex: isHovered ? '1.35' : '1',
              background: panel.gradient,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 48px',
              cursor: 'pointer',
              transition: 'flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => navigate(panel.route)}
          >
            {/* Decorative background circle */}
            <div
              style={{
                position: 'absolute',
                width: isHovered ? 500 : 360,
                height: isHovered ? 500 : 360,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.5s ease',
                pointerEvents: 'none',
              }}
            />

            {/* Content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
                textAlign: 'center',
                zIndex: 1,
                transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'transform 0.4s ease',
              }}
            >
              {/* Tag */}
              <span
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  padding: '4px 14px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                {panel.tag}
              </span>

              {/* Icon */}
              <div
                style={{
                  color: 'white',
                  opacity: 0.95,
                  filter: isHovered ? 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' : 'none',
                  transition: 'filter 0.4s ease',
                }}
              >
                {panel.icon}
              </div>

              {/* Title */}
              <Title
                level={2}
                style={{
                  color: 'white',
                  margin: 0,
                  fontSize: 'clamp(22px, 3vw, 34px)',
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                {panel.title}
              </Title>

              {/* Subtitle */}
              <Text
                style={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: 'clamp(13px, 1.5vw, 16px)',
                  maxWidth: 320,
                  lineHeight: 1.6,
                }}
              >
                {panel.subtitle}
              </Text>

              {/* CTA Button */}
              <Button
                type="default"
                size="large"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  border: 'none',
                  color: '#1a1a2e',
                  fontWeight: 700,
                  fontSize: 15,
                  height: 48,
                  paddingInline: 32,
                  borderRadius: 24,
                  boxShadow: isHovered ? '0 8px 32px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(panel.route);
                }}
              >
                {panel.buttonLabel}
              </Button>
            </div>
          </div>
        );
      })}

      {/* Bottom brand bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 24px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 1 }}>
          HEALTHIFY — Your Personal Health Companion
        </Text>
      </div>
    </div>
  );
}
