import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
  Button,
  Img
} from '@react-email/components';

interface WelcomeEmailProps {
  companyName: string;
}

export default function WelcomeEmail({ companyName = "New Company" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Nexus - Your new B2B Lead Engine</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Nexus 🚀</Heading>
          
          <Text style={text}>
            Hi there, and welcome aboard! We are thrilled to have <strong>{companyName}</strong> on the Nexus platform.
          </Text>
          
          <Text style={text}>
            You've just unlocked access to our powerful suite of AI-driven B2B tools. Here is what you can do right now:
          </Text>

          <Section style={card}>
            <Text style={h3}>🔍 Global AI Matchmaker</Text>
            <Text style={textSmall}>
              Type what you are looking for in plain English (e.g., "I want to sell CRM software"), and our AI will scour the internet to find you the best matching companies and their direct contact information.
            </Text>
          </Section>

          <Section style={card}>
            <Text style={h3}>☁️ Data Enrichment Engine</Text>
            <Text style={textSmall}>
              Upload a messy Excel list of target companies, and our autonomous agents will instantly research their financials, find their board of directors, and extract key insights.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
            <Button
              href="http://localhost:3000/dashboard"
              style={btn}
            >
              Access Your Dashboard
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            If you need any help getting started, just reply to this email. We're here for you. <br />
            — The Nexus Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f8fafc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  maxWidth: '600px',
};

const h1 = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: 'bold',
  padding: '0',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const h3 = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const text = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 24px 0',
};

const textSmall = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const card = {
  backgroundColor: '#f1f5f9',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '16px',
};

const btn = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0 24px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
};
