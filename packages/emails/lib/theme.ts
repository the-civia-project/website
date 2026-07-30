import { extendTheme } from '@react-email/editor/plugins';

/** Civia light theme — extends React Email's built-in `basic`. Clients own dark. */
export const civiaTheme = extendTheme('basic', {
  body: { backgroundColor: '#ffffff', color: '#000000' },
  container: { backgroundColor: '#ffffff', color: '#000000' },
  paragraph: { color: '#000000' },
  link: { color: '#000000' },
  button: {
    backgroundColor: '#000000',
    color: '#ffffff',
    borderRadius: '0',
  },
});
