import { FieldError, Merge } from 'react-hook-form';

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

export const getErrorMessageForField = (
  error: Merge<FieldError, (FieldError | undefined)[]> | undefined,
  minLength?: number,
  maxLenght?: number,
) => {
  if (!error) return '';
  switch (error.type) {
    case 'required':
      return 'Este campo es requerido';
    case 'maxLength':
      return `Longitud maxima (${maxLenght}) caracteres`;
    case 'minLength':
      return `Longitud minima (${minLength}) caracteres`;
    case 'validate':
      return error.message;
    default:
      return '';
  }
};
