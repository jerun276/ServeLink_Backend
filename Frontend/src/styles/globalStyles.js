import { StyleSheet } from 'react-native';
import colors from './colors';

const globalStyles = StyleSheet.create({
  appBackground: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 38,
  },
  subTitle: {
    fontSize: 14,
    color: colors.subText,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 32, // Large rounded corners
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100, // Pill shape
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  button: {
    borderRadius: 100,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  outlineButton: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  outlineButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  activePill: {
    backgroundColor: colors.secondary,
  },
  pillText: {
    fontWeight: '700',
    color: colors.subText,
  },
  activePillText: {
    color: '#FFFFFF',
  }
});

export default globalStyles;
