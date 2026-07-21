import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Button,
    Section,
    Hr,
} from '@react-email/components';
import * as React from 'react';

interface MemberInviteEmailProps {
    invitedByName: string;
    storeName: string;
    role: string;
    inviteUrl: string;
}

export const MemberInviteEmail: React.FC<Readonly<MemberInviteEmailProps>> = ({
    invitedByName,
    storeName,
    role,
    inviteUrl,
}) => (
    <Html>
        <Head />
        <Body style={main}>
            <Preview>You&apos;ve been invited to join {storeName} on Vendly</Preview>
            <Container style={container}>
                <Heading style={h1}>You&apos;re invited!</Heading>
                <Text style={text}>
                    <strong>{invitedByName}</strong> has invited you to join{' '}
                    <strong>{storeName}</strong> on Vendly as a{' '}
                    <strong>{role}</strong>.
                </Text>
                <Text style={text}>
                    Click the button below to accept the invitation. This link is valid for 48 hours.
                </Text>
                <Section style={buttonContainer}>
                    <Button href={inviteUrl} style={button}>
                        Accept Invitation
                    </Button>
                </Section>
                <Hr style={hr} />
                <Text style={footerText}>
                    You&apos;ll need to sign in with Google using this email address to accept.
                </Text>
                <Text style={footerText}>
                    If you didn&apos;t expect this invitation, you can safely ignore this email.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default MemberInviteEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    padding: '40px',
    borderRadius: '8px',
    maxWidth: '560px',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const text = {
    color: '#484848',
    fontSize: '15px',
    lineHeight: '24px',
    marginBottom: '16px',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

const footerText = {
    color: '#9ca3af',
    fontSize: '13px',
    lineHeight: '20px',
    marginTop: '8px',
};
