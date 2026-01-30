document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!name || !email || !password) {
    msg.style.color = "red";
    msg.textContent = "All fields are required";
    return;
  }

  let staffList = JSON.parse(localStorage.getItem("staffList")) || [];

  const exists = staffList.some(staff => staff.email === email);
  if (exists) {
    msg.style.color = "red";
    msg.textContent = "Email already registered";
    return;
  }

  staffList.push({ name, email, password });
  localStorage.setItem("staffList", JSON.stringify(staffList));

  msg.style.color = "green";
  msg.textContent = "Registration successful! Redirecting to login...";

  setTimeout(() => {
    window.location.href = "auth/login.html";
  }, 1500);
});
