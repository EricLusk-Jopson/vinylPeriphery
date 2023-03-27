import { useState, useEffect, React } from "react";
import { FaTimes } from "react-icons/fa";
import { ModalOverlay, StyledModal, InputGroup } from "./styles/SettingsModal";

export const SettingsModal = ({ applySettings, cancelModal, settings }) => {
  const [formSettings, setFormSettings] = useState({ ...settings });

  const handleInputChange = (e) => {
    e.preventDefault();
    setFormSettings({ ...formSettings, [e.target.name]: e.target.value });
  };

  const handleSubmission = (e) => {
    e.preventDefault();
    applySettings(formSettings);
    cancelModal();
  };

  useEffect(() => {
    console.log(formSettings);
  }, [formSettings]);

  return (
    <ModalOverlay>
      <StyledModal>
        <FaTimes
          style={{ position: "absolute", top: 0, right: 0 }}
          onClick={cancelModal}
        />
        <h2>Settings</h2>
        <form>
          <InputGroup>
            <label>Search Type</label>
            <select
              name="searchType"
              value={formSettings.searchType}
              onChange={handleInputChange}
            >
              <option value="fast">Fast</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </InputGroup>
          <InputGroup>
            <label>Exclude Searched Artist</label>
            <select
              name="excludeArtist"
              value={formSettings.excludeArtist}
              onChange={handleInputChange}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </InputGroup>
          <InputGroup>
            <label>Exclude Searched Album</label>
            <select
              name="excludeAlbum"
              value={formSettings.excludeAlbum}
              onChange={handleInputChange}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </InputGroup>
          <InputGroup>
            <label>Exclude Various</label>
            <select
              name="excludeVarious"
              value={formSettings.excludeVarious}
              onChange={handleInputChange}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </InputGroup>
        </form>

        <button onClick={handleSubmission}>Save</button>
      </StyledModal>
    </ModalOverlay>
  );
};

export default SettingsModal;
