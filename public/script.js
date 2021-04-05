const form = document.querySelector('form');
const passwordInput = document.querySelector('input#current-password');
const signinButton = document.querySelector('button#login');
const togglePasswordButton = document.querySelector('button#toggle-password');

togglePasswordButton.addEventListener('click', togglePassword);

function togglePassword() {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    togglePasswordButton.textContent = 'Hide password';
    togglePasswordButton.setAttribute('aria-label',
      'Hide password.');
  } else {
    passwordInput.type = 'password';
    togglePasswordButton.textContent = 'Show password';
    togglePasswordButton.setAttribute('aria-label',
      'Show password as plain text. ' +
      'Warning: this will display your password on the screen.');
  }
}

passwordInput.addEventListener('input', validatePassword);

function validatePassword() {
  let message= '';
  if (!/.{8,}/.test(passwordInput.value)) {
		message = '8文字以上入力してください。';
  } else if (!/.*[A-Z].*/.test(passwordInput.value)) {
		message += '\n少なくとも一文字は大文字にしてください。';
  } else if (!/.*[a-z].*/.test(passwordInput.value)) {
		message += '\n少なくとも一文字は小文字にしてください。';
  } else if (!/.*[~!@#$%^&*()].*/.test(passwordInput.value)) {
		message += '\n記号を入れてください。';
  }

  passwordInput.setCustomValidity(message);
}

form.addEventListener('submit', handleFormSubmit);                       

function handleFormSubmit(event) {
  console.log('submit');
  if (form.checkValidity() === false) {
    console.log('not valid');
    event.preventDefault();
  }
}
