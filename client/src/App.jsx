import { useEffect, useState } from "react";
import "./App.css";
const serverUrl = "http://localhost:4000";
function App() {
  const [directories, setDirectories] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFileName, setNewFileName] = useState("");
  const fetchDirectories = async () => {
    const response = await fetch(serverUrl);
    const data = await response.json();
    setDirectories(data);
  };
  useEffect(() => {
    fetchDirectories();
  }, []);
  const uploadFile = async (e) => {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverUrl, true);
    xhr.setRequestHeader("filename", file.name);
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      fetchDirectories();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(Math.floor(totalProgress));
    });
    xhr.send(file);
  };
  const handleDelete = async (filename) => {
    const response = await fetch(`${serverUrl}`, {
      method: "DELETE",
      body: filename,
    });
    const data = await response.text();
    console.log(data);
    fetchDirectories();
  };
  const renameFile = async (oldfilename) => {
    setNewFileName(oldfilename);
  };
  const saveFileName = async (oldfilename) => {
    console.log(oldfilename, newFileName);
    const response = await fetch(`${serverUrl}`, {
      method: "PATCH",
      body: JSON.stringify({ oldfilename, newFileName }),
    });
    const data = await response.text();
    console.log(data);
    fetchDirectories();
  };
  return (
    <>
      <input type="file" onChange={uploadFile} />
      <input
        type="text"
        value={newFileName}
        onChange={(e) => {
          setNewFileName(e.target.value);
        }}
      />
      <p>{progress}%</p>
      {directories.map((directory, index) => (
        <div key={index}>
          {directory} <a href={`${serverUrl}/${directory}?action=open`}>Open</a>{" "}
          <a href={`${serverUrl}/${directory}?action=download`}>Download</a>
          <button onClick={() => renameFile(directory)}>Rename</button>
          <button onClick={() => saveFileName(directory)}>save</button>
          <button
            onClick={() => {
              handleDelete(directory);
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </>
  );
}

export default App;
