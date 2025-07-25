import { useEffect, useState } from "react";
import "./UsersPage.css";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:4000";
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const navigate = useNavigate();

  async function fetchUsers() {
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 403) {
        navigate("/");
      } else if (response.status === 401) {
        navigate("/login");
      } else {
        console.error("Error fetching user info:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }
  async function fetchUser() {
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Set user info if logged in
        setCurrentUser(data);
      } else if (response.status === 401) {
        // User not logged in
        navigate("/login");
      } else {
        // Handle other error statuses if needed
        console.error("Error fetching user info:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }
  console.log(users);
  useEffect(() => {
    fetchUsers();
    fetchUser();
  }, []);
  const logoutUser = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        fetchUsers();
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchUsers();
      } else {
        console.error("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="users-container">
      <h1 className="title">All Users</h1>
      <p>
        {currentUser.name} <i>({currentUser.role})</i>
      </p>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th></th>
            {currentUser.role === "Admin" && <th></th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isLoggedIn ? "Logged In" : "Logged Out"}</td>
              <td>
                <button
                  className="logout-button"
                  onClick={() => logoutUser(user.id)}
                  disabled={
                    !user.isLoggedIn ||
                    (user.role === "Admin" && currentUser.role !== "Admin")
                  }
                >
                  Logout
                </button>
              </td>
              {currentUser.role === "Admin" && (
                <td>
                  <button
                    className={`logout-button ${
                      user.email !== currentUser.email && "delete-button"
                    }`}
                    onClick={() => deleteUser(user.id)}
                    disabled={user.email === currentUser.email}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
