import { useEffect, useState } from "react";
import "./App.css";
const serverUrl = "http://192.168.245.182";
function App() {
  const [directories, setDirectories] = useState([]);
  const fetchDirectories = async () => {
    const response = await fetch(serverUrl);
    const data = await response.json();
    setDirectories(data);
  };
  useEffect(() => {
    fetchDirectories();
  }, []);
  const handleChange = async (e) => {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverUrl, true);
    xhr.setRequestHeader("filename", file.name);
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
    });

    xhr.send(file);
  };
  return (
    <>
      <input type="file" onChange={handleChange} />
      {directories.map((directory, index) => (
        <div key={index}>
          {directory} <a href={`${serverUrl}/${directory}?action=open`}>Open</a>{" "}
          <a href={`${serverUrl}/${directory}?action=download`}>Download</a>
        </div>
      ))}
    </>
  );
}

export default App;
