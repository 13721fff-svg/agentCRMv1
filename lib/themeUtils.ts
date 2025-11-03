import { ThemeColors } from './theme';

export const getThemedStyle = (colors: ThemeColors) => ({
  container: { backgroundColor: colors.background },
  card: { backgroundColor: colors.card, borderColor: colors.border },
  text: { color: colors.text },
  textSecondary: { color: colors.textSecondary },
  border: { borderColor: colors.border },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    color: colors.text,
  },
});

export const themedBg = (colors: ThemeColors, variant: 'primary' | 'secondary' | 'card' = 'primary') => {
  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.background };
    case 'secondary':
      return { backgroundColor: colors.backgroundSecondary };
    case 'card':
      return { backgroundColor: colors.card };
  }
};

export const themedText = (colors: ThemeColors, variant: 'primary' | 'secondary' = 'primary') => {
  return { color: variant === 'primary' ? colors.text : colors.textSecondary };
};

export const themedBorder = (colors: ThemeColors) => {
  return { borderColor: colors.border };
};
