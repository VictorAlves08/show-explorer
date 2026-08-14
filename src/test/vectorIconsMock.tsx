import { Text } from 'react-native';

type IoniconsProps = {
  name: string;
};

export function Ionicons({ name }: IoniconsProps) {
  return <Text>{name}</Text>;
}
