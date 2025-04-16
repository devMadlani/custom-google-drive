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
  return (
    <>
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
