/*****************************
 GET ELEMENTS (SAFE)
*****************************/
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const name = document.getElementById("name");
const username = document.getElementById("username");
const password = document.getElementById("password");
const msg = document.getElementById("msg");

/*****************************
 STAFF SIGNUP
*****************************/
signupForm?.addEventListener("submit", e => {
  e.preventDefault();

  if (!username.value || !password.value) {
    msg.textContent = "Email and password are required";
    return;
  }

  const staff = {
    name: name.value,
    username: username.value,
    password: password.value
  };

  localStorage.setItem(
    "staff_" + staff.username,
    JSON.stringify(staff)
  );

  msg.textContent = "Registration successful! Please login.";
  signupForm.reset();
});

/*****************************
 LOGIN
*****************************/
loginForm?.addEventListener("submit", e => {
  e.preventDefault();

  const user = username.value;
  const pass = password.value;

  if (!user || !pass) {
    msg.textContent = "Enter email and password";
    return;
  }

  const staffData = localStorage.getItem("staff_" + user);

  if (!staffData) {
    msg.textContent = "User not registered";
    return;
  }

  const staff = JSON.parse(staffData);

  if (staff.password === pass) {
    localStorage.setItem("loggedStaff", user);
    window.location.href = "dashboard.html"; // change if needed
  } else {
    msg.textContent = "Invalid credentials";
  }
});
