const baseUrl = "http://localhost:4000";

export const loginWithGoogle = async (idToken, navigate) => {
  const res = await fetch(`${baseUrl}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (data.error) {
    setServerError(data.error);
  } else {
    navigate("/");
  }
};
