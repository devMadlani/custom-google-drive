const baseUrl = "http://localhost:4000";

export const loginWithGoogle = async (idToken) => {
  const res = await fetch(`${baseUrl}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
};
