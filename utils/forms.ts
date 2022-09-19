export const getStringValueFromBoolean = (state: boolean | null) => {
  switch (state) {
    case null:
      return '';
    case true:
      return 'SI';
    case false:
      return 'NO';
    default:
      return '';
  }
};

export const getBooleanFromString = (value: string) => {
  switch (value) {
    case null:
      return null;
    case 'SI':
      return true;
    case 'NO':
      return false;
    default:
      return null;
  }
};
