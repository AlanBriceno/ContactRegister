export const isEmailValid = (email) => {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

export const isNameValid = (name) => {
  const regex = /^[a-zA-Z ]+$/;
  return regex.test(name);
};

export const isNumberValid = (number) => {
  const regex = /^\d+$/;
  return regex.test(number);
}
