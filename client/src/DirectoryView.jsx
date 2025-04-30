import { useEffect, useState } from "react";
import "./App.css";
import { Link, useParams } from "react-router-dom";
const baseUrl = "http://localhost:4000";
function DirectoryView() {
  const [directoriesList, setDirectoriesList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFileName, setNewFileName] = useState("");
  const [newDirName, setNewDirName] = useState("");
  const { "*": dirPath } = useParams();

  const fetchDirectories = async () => {
    const response = await fetch(`${baseUrl}/directory/${dirPath}`);
    const data = await response.json();

    setDirectoriesList(data.directories);
    setFileList(data.files);
  };
  useEffect(() => {
    fetchDirectories();
  }, [location.pathname]);

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/file/${file.name}`, true);
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
  const handleDelete = async (id) => {
    const response = await fetch(`${baseUrl}/file/${id}`, {
      method: "DELETE",
    });
    const data = await response.text();
    console.log(data);
    fetchDirectories();
  };
  const renameFile = async (oldfilename) => {
    setNewFileName(oldfilename);
  };
  const saveFileName = async (id) => {
    const response = await fetch(`${baseUrl}/file/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newFileName }),
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
      {fileList?.map(({ name, id }, index) => (
        <div key={index}>
          {name} <a href={`${baseUrl}/file/${id}`}>Open</a>{" "}
          <a href={`${baseUrl}/file/${id}?action=download`}>Download</a>
          <button onClick={() => renameFile(name)}>Rename</button>
          <button onClick={() => saveFileName(id)}>save</button>
          <button
            onClick={() => {
              handleDelete(id);
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
