import type { JSX } from 'react'
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
} from '@react-email/components'
import { VerifyEmailEmailProps } from '../email.types'

export function VerifyEmailEmail({
  url,
  appName,
  expiresHours,
}: VerifyEmailEmailProps): JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>Подтвердите почту</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section>
            <Text style={heading}>Подтверждение почты</Text>

            <Text style={text}>
              Вы зарегистрировались в {appName}. Подтвердите почту, чтобы
              получить доступ к изменению данных профиля.
            </Text>

            <Section style={buttonContainer}>
              <Button href={url} style={button}>
                Подтвердить почту
              </Button>
            </Section>
          </Section>

          <Text style={textSmall}>
            Если кнопка не работает, скопируйте и вставьте ссылку в браузер:
          </Text>

          <Link href={url} style={link}>
            {url}
          </Link>

          <Text style={text}>
            Ссылка действительна в течение {expiresHours} ч.
          </Text>

          <Text style={footer}>
            Если вы не создавали аккаунт, проигнорируйте это письмо.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#f9f9f9',
  fontFamily: 'Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px auto',
  width: '100%',
  maxWidth: '600px',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
}

const text = {
  fontSize: '16px',
  lineHeight: '1.5',
  marginBottom: '20px',
}

const textSmall = {
  fontSize: '14px',
  lineHeight: '1.5',
  marginBottom: '10px',
}

const buttonContainer = {
  marginBottom: '20px',
}

const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '4px',
  textDecoration: 'none',
  fontSize: '16px',
}

const link = {
  color: '#000000',
  textDecoration: 'none',
}

const footer = {
  fontSize: '14px',
  lineHeight: '1.5',
  marginTop: '20px',
}
