import { Section } from 'react-email';
import * as React from 'react';
import { Button } from './Button';

const DISCORD_URL = 'https://discord.gg/pNTmzvd7pe';
const MATRIX_URL = 'https://matrix.to/#/#the-civia-project:matrix.org';

type CommunityButtonsProps = {
  discordLabel?: string;
  matrixLabel?: string;
};

const buttonSlotStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '48%',
  minWidth: '160px',
  maxWidth: '100%',
  boxSizing: 'border-box',
  verticalAlign: 'top',
};

export const CommunityButtons = ({
  discordLabel = 'Join Discord',
  matrixLabel = 'Join Matrix',
}: CommunityButtonsProps): React.ReactElement => (
  <Section style={{ margin: '24px 0', textAlign: 'center', fontSize: 0 }}>
    <span style={{ ...buttonSlotStyle, paddingRight: '16px' }}>
      <Button href={DISCORD_URL} fullWidth>
        {discordLabel}
      </Button>
    </span>
    <span style={{ ...buttonSlotStyle, paddingLeft: '16px' }}>
      <Button href={MATRIX_URL} variant="secondary" fullWidth>
        {matrixLabel}
      </Button>
    </span>
  </Section>
);
