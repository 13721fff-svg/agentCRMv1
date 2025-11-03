import { create } from 'twrnc';
import { useAppStore } from '@/store/appStore';
import { getThemeColors, ThemeColors } from './theme';

export const tw = create(require('../twrnc.json'));

export default tw;

export const useThemedStyles = (): { colors: ThemeColors; tw: typeof tw } => {
  const theme = useAppStore((state) => state.theme);
  const colors = getThemeColors(theme);
  return { colors, tw };
};
