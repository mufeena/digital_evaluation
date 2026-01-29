// STAFF SIGNUP
document.getElementById("signupForm")?.addEventListener("submit", e => {
  e.preventDefault();

  const staff = {
    name: name.value,
    dept: dept.value,
    exp: exp.value,
    paper: paper.value,
    username: username.value,
    password: password.value
  };

  localStorage.setItem("staff_" + staff.username, JSON.stringify(staff));
  msg.textContent = "Registration successful!";
});

// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", e => {
  e.preventDefault();

  const role = new URLSearchParams(window.location.search).get("role");
  const user = username.value;
  const pass = password.value;

  if (role === "admin") {
    if (user === "admin" && pass === "admin123") {
      window.location.href = "../admin/dashboard.html";
    } else {
      msg.textContent = "Invalid Admin Credentials";
    }
  } else {
    const staff = JSON.parse(localStorage.getItem("staff_" + user));
    if (staff && staff.password === pass) {
      localStorage.setItem("loggedStaff", user);
      window.location.href = "../evaluation/evaluation.html";
    } else {
      msg.textContent = "Invalid Staff Credentials";
    }
  }
});
