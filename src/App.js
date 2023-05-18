import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Modal from "react-modal";
import { Watch } from "react-loader-spinner";

const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  font-family: "Poppins", sans-serif; // added
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const TableHeader = styled.th`
  border: 1px solid #ddd;
  padding: 1rem;
  text-align: left;
  background-color: #333; // updated

  color: white; // updated
  position: sticky; // added
  top: 0; // added
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 0.1rem 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 200px; // Adjust the value as needed
`;

const Button = styled.button`
  background-color: black; // updated
  color: white; // updated
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #444; // updated
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  margin: 0.5rem;
  padding: 0.5rem;
  border: none;
  border-radius: 5px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
`;
const TableContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  scrollbar-width: none; /* Remove scrollbar for Firefox */
  -ms-overflow-style: none; /* Remove scrollbar for IE and Edge */
  ::-webkit-scrollbar {
    width: 0; /* Remove scrollbar for Chrome, Safari, and Opera */
  }
`;

const Heading = styled.h1`
  text-align: center;
  color: black;
  padding-bottom: 1rem;
`;

const ModalContent = styled.div`
  // display: flex;
  // align-items: center;
  // justify-content: center;
  height: 100vh;

  position: absolute;
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
`;

const SquareModal = styled(Modal)`
  // display: flex;
  // align-items: center;
  // justify-content: center;

  position: absolute;
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f2f2f2;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  margin-right: 1rem;
  min-width: 120px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const TableRowUpdateNeeded = styled(TableRow)`
  background-color: lightcoral;

  ${TableCell} {
    background-color: lightcoral;
  }
`;

const SubHeading = styled.h2`
  text-align: center;
  color: #666; // adjust as needed
  padding-bottom: 1rem;
`;

function App() {
  const [appData, setAppData] = useState([]);
  const [appName, setAppName] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [appToEdit, setAppToEdit] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cronJobRuns, setCronJobRuns] = useState(0);

  useEffect(() => {
    fetchAppData();
  }, []);

  // Add a new function to fetch the counter
  const fetchCronJobRuns = async () => {
    const res = await axios.get("https://notifier-backend.onrender.com/cron-job-counter");
    setCronJobRuns(res.data.counter);
  };

  // Call the new function whenever you need to update the counter
  useEffect(() => {
    fetchCronJobRuns();
    const interval = setInterval(fetchCronJobRuns, 60000); // Update every minute
    return () => clearInterval(interval); // Clear the interval when the component unmounts
  }, []);

  const fetchAppData = async () => {
    const res = await axios.get("https://notifier-backend.onrender.com/apps");
    setAppData(res.data);
  };

  const addAppData = async () => {
    setAdding(true);
    if (appName.trim() && appVersion.trim()) {
      const newAppData = {
        appName: appName.trim(),
        appVersion: appVersion.trim(),
      };
      const res = await axios.post("https://notifier-backend.onrender.com/apps", newAppData);
      setAppData([...appData, res.data]);
      setAppName("");
      setAppVersion("");
    }
    setAdding(false);
  };

  const deleteAppData = async (id) => {
    await axios.delete(`https://notifier-backend.onrender.com/apps/${id}`);
    setAppData(appData.filter((data) => data._id !== id));
  };

  const saveAppData = async (event) => {
    event.preventDefault();
    if (appToEdit) {
      const res = await axios.put(
        `https://notifier-backend.onrender.com/apps/${appToEdit._id}`,
        appToEdit
      );
      setAppData(
        appData.map((item) => (item._id === appToEdit._id ? res.data : item))
      );
      setAppToEdit(null);
      setModalIsOpen(false);
    }
  };

  const checkUpdates = async () => {
    setUpdating(true); // Start the update process

    // Create a new array to hold the updated app data
    const updatedAppData = [];

    // Iterate over each app in the appData array
    for (const app of appData) {
      // Make a request to the backend to update the Google Play Version
      const res = await axios.put(
        `https://notifier-backend.onrender.com/apps/${app._id}/update`
      );
      // Add the updated app data to the array
      updatedAppData.push(res.data);
    }

    // Update the appData state with the updated app data
    setAppData(updatedAppData);

    setUpdating(false); // Finish the update process
  };

  return (
    <Container>
      <Heading>App Version Update Checker</Heading>
      <SubHeading>Number of Cron Job Runs: {cronJobRuns}</SubHeading>

      <ControlsContainer>
        <Input
          type="text"
          placeholder="App Name"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="App Version"
          value={appVersion}
          onChange={(e) => setAppVersion(e.target.value)}
        />
        {adding ? (
          <Watch type="Puff" color="#333" height={50} width={50} />
        ) : (
          <Button onClick={addAppData}>Add</Button>
        )}

        {updating ? (
          <Watch type="Puff" color="#333" height={50} width={50} />
        ) : (
          <Button onClick={checkUpdates}>Check Update</Button>
        )}
      </ControlsContainer>
      <TableContainer>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>App Name</TableHeader>
              <TableHeader>App URL</TableHeader>
              <TableHeader>App Version</TableHeader>
              <TableHeader>Google Play Version</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Action</TableHeader>
              <TableHeader>Edit</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {console.log(appData)}
            {appData.map((data) => {
              const TableRowComponent =
                data.versionUpdateStatus === "Need Update"
                  ? TableRowUpdateNeeded
                  : TableRow;

              return (
                <TableRowComponent key={data._id}>
                  <TableCell>{data.appName}</TableCell>
                  <TableCell>{data.appURL}</TableCell>
                  <TableCell>{data.appVersion}</TableCell>
                  <TableCell>{data.googlePlayVersion || "NULL"}</TableCell>
                  <TableCell>{data.versionUpdateStatus || "NULL"}</TableCell>
                  <TableCell>
                    <Button onClick={() => deleteAppData(data._id)}>
                      Delete
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        setAppToEdit(data);
                        setModalIsOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRowComponent>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
      <ModalContent>
        <SquareModal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="Edit App"
          ariaHideApp={false}
        >
          <FormContainer onSubmit={saveAppData}>
            <InputContainer>
              <Label>App Name:</Label>
              <Input
                type="text"
                value={appToEdit ? appToEdit.appName : ""}
                onChange={(e) =>
                  setAppToEdit({ ...appToEdit, appName: e.target.value })
                }
              />
            </InputContainer>

            <InputContainer>
              <Label>App Version:</Label>
              <Input
                type="text"
                value={appToEdit ? appToEdit.appVersion : ""}
                onChange={(e) =>
                  setAppToEdit({
                    ...appToEdit,
                    appVersion: e.target.value,
                  })
                }
              />
            </InputContainer>

            <ButtonContainer>
              <Button type="submit">Save</Button>
              <Button type="button" onClick={() => setModalIsOpen(false)}>
                Close
              </Button>
            </ButtonContainer>
          </FormContainer>
        </SquareModal>
      </ModalContent>
    </Container>
  );
}
export default App;
