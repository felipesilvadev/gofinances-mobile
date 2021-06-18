import styled, { css } from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import { Feather } from '@expo/vector-icons';

interface IconProps {
  type: 'up' | 'down';
}

interface ContainerProps extends IconProps {
  isActive: boolean;
}

export const Container = styled.View<ContainerProps>`
  width: 48%;

  border: 1.5px solid ${({ isActive, theme }) => 
    isActive ? 'transparent' : theme.colors.text
  };
  border-radius: 5px;

  ${({ isActive, type }) => isActive && type === 'up' && css`
    background: ${({ theme }) => theme.colors.success_light};
  `};

  ${({ isActive, type }) => isActive && type === 'down' && css`
    background: ${({ theme }) => theme.colors.attention_light};
  `};
`;

export const Button = styled(RectButton)`
  flex-direction: row;
  align-items: center;
  justify-content: center;

  padding: 16px;
`;

export const Icon = styled(Feather)<IconProps>`
  font-size: ${RFValue(24)}px;
  margin-right: 12px;

  color: ${({ type, theme }) => 
    type === 'up' ? theme.colors.success : theme.colors.attention
  }
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.title};
`;
