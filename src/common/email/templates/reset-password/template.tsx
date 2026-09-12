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
import { ResetPasswordEmailProps } from '../../email.types'
import {
  body,
  container,
  heading,
  text,
  textSmall,
  buttonContainer,
  button,
  link,
  footer,
} from './styles'

export function ResetPasswordEmail({
  url,
  appName,
}: ResetPasswordEmailProps): JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>Сброс пароля</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section>
            <Text style={heading}>Сброс пароля</Text>

            <Text style={text}>
              Вы запросили сброс пароля для вашего аккаунта {appName}.
            </Text>

            <Section style={buttonContainer}>
              <Button href={url} style={button}>
                Сбросить пароль
              </Button>
            </Section>
          </Section>

          <Text style={textSmall}>
            Если кнопка не работает, скопируйте и вставьте ссылку в браузер:
          </Text>

          <Link href={url} style={link}>
            {url}
          </Link>

          <Text style={text}>Ссылка действительна в течение 30 минут.</Text>

          <Text style={footer}>
            Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
