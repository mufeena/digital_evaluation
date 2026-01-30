document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  let staffList = JSON.parse(localStorage.getItem("staffList")) || [];

  const staff = staffList.find(
    user => user.email === email && user.password === password
  );

  if (staff) {
    localStorage.setItem("loggedStaff", JSON.stringify(staff));
    window.location.href = "../evaluation/evaluation.html";
  } else {
    msg.style.color = "red";
    msg.textContent = "Invalid Email or Password";
  }
});
