import { Pressable, Text } from 'react-native';
import globalStyles from '../../styles/globalStyles';

const Button = ({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  let btnStyle = globalStyles.button;
  let labelStyle = globalStyles.buttonText;

  if (isOutline) {
    btnStyle = globalStyles.outlineButton;
    labelStyle = globalStyles.outlineButtonText;
  }

  if (isDanger) {
    btnStyle = [globalStyles.button, { backgroundColor: '#D63A65' }];
  }

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[btnStyle, style, disabled && { opacity: 0.6 }]}> 
      <Text style={[labelStyle, textStyle]}>{children}</Text>
    </Pressable>
  );
};

export default Button;
