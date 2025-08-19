import React, { useEffect, useState } from "react";
import ReplayItem from '../components/replayItem/ReplayItem'
function Replay() {
  const [replays, setReplays] = useState([]);

  async function fetchReplays() {
    // this function for fetch all history 
    // set port same as .env in backend
    await fetch("http://localhost:8081/replay")
      .then((res) => res.json())
      .then((data) => setReplays(data))
      .catch((err) => console.log(`Error: ${err.message}`));
  }

  const handleDeleted = (id) => { 
    // this function for rerender replays after deleted
    setReplays((prev) => prev.filter((r) => r._id !== id));
  };

  useEffect(() => {
    fetchReplays();
  }, []);

  return (
    replays ? (
      replays.map((replay)=> <ReplayItem key={replay._id} replay={replay} onDeleted={handleDeleted}/>)
    ):"No replay"
  );
}

export default Replay;
