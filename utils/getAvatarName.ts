export function getAvatarFromFullName(fullName: string) {
  const [firstName, lastName] = fullName.split(' ', 2)
  return firstName.length > 0 && lastName.length > 0
    ? `${firstName.substring(0, 1)}${lastName.substring(0, 1)}`
    : 'NN';
}

export function getAvatarFromNames(firstName: string, lastName: string) {
  return firstName.length > 0 && lastName.length > 0
    ? `${firstName.substring(0, 1)}${lastName.substring(0, 1)}`
    : 'NN';
}
