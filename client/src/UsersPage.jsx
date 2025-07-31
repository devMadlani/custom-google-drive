import { useEffect, useState } from "react";
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
    <div className="max-w-5xl mt-10 mx-4">
      <h1 className="text-3xl font-bold mb-6">All Users</h1>
      <p>
        <b>{userName}</b>: <i>({currentUser.role})</i>
      </p>

      <table className="w-full mt-6 border-collapse">
        <thead>
          <tr>
            <th className="border p-3 bg-gray-200 text-left">Name</th>
            <th className="border p-3 bg-gray-200 text-left">Email</th>
            <th className="border p-3 bg-gray-200 text-left">Status</th>
            <th className="border p-3 bg-gray-200 text-left"></th>
            {userRole === "Admin" && (
              <th className="border p-3 bg-gray-200 text-left"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-3">{user.name}</td>
              <td className="border p-3">{user.email}</td>
              <td className="border p-3">
                {user.isLoggedIn ? "Logged In" : "Logged Out"}
              </td>
              <td className="border p-3">
                <button
                  onClick={() => logoutUser(user)}
                  disabled={
                    !user.isLoggedIn ||
                    (user.role === "Admin" && currentUser.role !== "Admin")
                  }
                  className={`px-3 py-1 text-sm text-white rounded ${
                    user.isLoggedIn
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Logout
                </button>
              </td>
              {currentUser.role === "Admin" && (
                <td className="border p-3">
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={user.email === currentUser.email}
                    className={`px-3 py-1 text-sm text-white rounded ${
                      user.email === currentUser.email
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
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
