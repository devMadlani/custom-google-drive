import { useEffect, useState } from "react";
import "./App.css";
import { Link, useParams } from "react-router-dom";
const baseUrl = "http://localhost:4000";
function DirectoryView() {
  const [directories, setDirectories] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFileName, setNewFileName] = useState("");
  const [newDirName, setNewDirName] = useState("");
  const { "*": dirPath } = useParams();

  const fetchDirectories = async () => {
    const response = await fetch(`${baseUrl}/directory/${dirPath}`);
    const data = await response.json();
    setDirectories(data);
  };
  useEffect(() => {
    fetchDirectories();
  }, [location.pathname]);

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/files/${dirPath}/${file.name}`, true);
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

  const handleCreateDirectory = async (e) => {
    e.preventDefault();

    const url = `${baseUrl}/directory${
      dirPath ? "/" + dirPath : ""
    }/${newDirName}`;

    const res = await fetch(url, { method: "POST" });

    const data = await res.text();
    setNewDirName("");
    console.log(data);
    fetchDirectories();
  };
  const handleDelete = async (filename) => {
    const response = await fetch(`${baseUrl}/files/${dirPath}/${filename}`, {
      method: "DELETE",
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
    const response = await fetch(`${baseUrl}/files/${dirPath}/${oldfilename}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newFileName: `/${dirPath}/${newFileName}` }),
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
      <form onSubmit={handleCreateDirectory}>
        <input
          type="text"
          value={newDirName}
          onChange={(e) => setNewDirName(e.target.value)}
        />
        <button type="submit">Create Directory</button>
      </form>
      {directories?.map(({ name, isDirectory }, index) => (
        <div key={index}>
          {name}{" "}
          {isDirectory ? (
            <Link to={`./${name}`}>Open</Link>
          ) : (
            <a href={`${baseUrl}/files/${dirPath}/${name}?action=open`}>Open</a>
          )}{" "}
          {!isDirectory && (
            <a href={`${baseUrl}/files/${dirPath}/${name}?action=download`}>
              Download
            </a>
          )}
          <button onClick={() => renameFile(name)}>Rename</button>
          <button onClick={() => saveFileName(name)}>save</button>
          <button
            onClick={() => {
              handleDelete(name);
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </>
  );
}

export default DirectoryView;
