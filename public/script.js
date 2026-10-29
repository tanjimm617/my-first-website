const button = document.getElementById("helloButton");
const message = document.getElementById("message");

button.addEventListener("click", function () {
    message.textContent = "Congratulations! Your JavaScript works!";
});

let count = 0;

const countButton = document.querySelector("#countButton");
const clickCount = document.querySelector("#clickCount");

countButton.addEventListener("click", function () {
    count = count + 1;
    clickCount.textContent = count;
});


const greetingForm = document.querySelector("#greetingForm");
const userName = document.querySelector("#userName");
const greetingMessage = document.querySelector("#greetingMessage");

greetingForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = userName.value.trim();

  if (name === "") {
    greetingMessage.textContent = "Please enter your name.";
  } else {
    greetingMessage.textContent = "Hello, " + name + "! Welcome to my website.";
  }
});


const skills = ["HTML", "CSS", "JavaScript", "Node.js"];

console.log(skills);
console.log(skills[0]);
console.log(skills[2]);
console.log(skills.length);


const fruits = ["Apple", "Mango", "Banana"];

for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}

const loadUserButton = document.querySelector("#loadUserButton");
const userResult = document.querySelector("#userResult");

loadUserButton.addEventListener("click", async function () {
  userResult.textContent = "Loading...";

  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users/1"
    );

    if (!response.ok) {
      throw new Error("Could not load user data.");
    }

    const user = await response.json();

    userResult.textContent =
      "Name: " + user.name + " | Email: " + user.email;
  } catch (error) {
    userResult.textContent = "Something went wrong. Please try again.";
    console.error(error);
  }
});

const userForm = document.getElementById("userForm");
const userMessage = document.getElementById("userMessage");

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  userMessage.textContent = "Saving user...";

  try {
    const response = await fetch("/api/db-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to save user");
    }

    userMessage.textContent =
  `Success! ${data.name} has been saved to the database.`;

    userForm.reset();
    await loadUsers();
  } catch (error) {
    userMessage.textContent = `Error: ${error.message}`;
  }
})

const loadUsersButton = document.getElementById("loadUsers");
const userList = document.getElementById("userList");

async function loadUsers() {
  userList.replaceChildren();

  try {
    const response = await fetch("/api/db-users");

    if (!response.ok) {
      throw new Error("Failed to load users");
    }

    const users = await response.json();

    if (users.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No users found.";
      userList.appendChild(li);
      return;
    }

    users.forEach((user) => {
      const li = document.createElement("li");

      const userInfo = document.createElement("span");
      userInfo.textContent = `${user.name} — ${user.email} `;

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";

      editButton.addEventListener("click", async () => {
        const newName = prompt("Enter new name:", user.name);
        if (newName === null) return;

        const newEmail = prompt("Enter new email:", user.email);
        if (newEmail === null) return;

        if (!newName.trim() || !newEmail.trim()) {
          alert("Name and email are required.");
          return;
        }

        try {
          const updateResponse = await fetch(
            `/api/db-users/${user.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: newName.trim(),
                email: newEmail.trim(),
              }),
            }
          );

          const data = await updateResponse.json();

          if (!updateResponse.ok) {
            throw new Error(data.error || "Failed to update user");
          }

          await loadUsers();
        } catch (error) {
          alert(error.message);
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", async () => {
        const confirmed = confirm(
          `Delete ${user.name} from the database?`
        );

        if (!confirmed) return;

        try {
          const deleteResponse = await fetch(
            `/api/db-users/${user.id}`,
            { method: "DELETE" }
          );

          const data = await deleteResponse.json();

          if (!deleteResponse.ok) {
            throw new Error(data.error || "Failed to delete user");
          }

          await loadUsers();
        } catch (error) {
          alert(error.message);
        }
      });

      li.append(userInfo, editButton, deleteButton);
      userList.appendChild(li);
    });
  } catch (error) {
    userList.textContent = error.message;
  }
}

loadUsersButton.addEventListener("click", loadUsers);


loadUsersButton.addEventListener("click", loadUsers);
