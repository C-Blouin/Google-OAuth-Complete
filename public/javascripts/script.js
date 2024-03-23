/*

Password Validation & Matching Code, this code was used from the in-class blog project.

*/


// Check if the password and confirm password fields match
function checkPassword() {
  let pw = document.getElementById('password').value;
  let confirm = document.getElementById('confirm').value;
  let pwMsg = document.getElementById('pwMsg');

  if (pw !== confirm) {
      pwMsg.innerText = "Passwords do not match";
      pwMsg.className = "text-danger";
      return false;
  }
  else {
      pwMsg.innerText = "";
      pwMsg.className = "";
      return true;
  }
}

// Show or hide the password input fields when the show/hide icon is clicked
function showHide() {
  // toggle password input type and show/hide icon
  let pw = document.getElementById('password');
  let confirm = document.getElementById('confirm');
  let img = document.getElementById('imgShowHide');

  if (pw.type === 'password') {
      pw.type = 'text';
      confirm.type = 'text';
      img.src = '/images/hide.svg';
  }
  else {
      pw.type = 'password';
      confirm.type = 'password';
      img.src = '/images/show.svg';
  }
}