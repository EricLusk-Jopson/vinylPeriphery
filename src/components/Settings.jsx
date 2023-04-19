import React from "react";
import {
  ButtonWrapper,
  StyledButton,
  StyledOptionsContainer,
  StyledSettings,
} from "./styles/Settings.styled";

const Settings = ({
  settings,
  handleSettingsChange,
  toggleSettingsModal,
  displaySettings,
}) => {
  return (
    <StyledSettings displaySettings={displaySettings}>
      <StyledOptionsContainer>
        <div
          style={{
            display: "inline-flex",
            justifyContent: "space-between",
          }}
        >
          <label>Search Type</label>
          <select
            name="searchType"
            value={settings.searchType}
            onChange={handleSettingsChange}
          >
            <option value="fast">Fast</option>
            <option value="comprehensive">Comprehensive</option>
          </select>
        </div>
        <div
          style={{
            display: "inline-flex",
            justifyContent: "space-between",
          }}
        >
          <label>Exclude Production Staff</label>
          <select
            name="excludeProduction"
            value={settings.excludeProduction}
            onChange={handleSettingsChange}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
        <div
          style={{
            display: "inline-flex",
            justifyContent: "space-between",
          }}
        >
          <label>Exclude Searched Artist</label>
          <select
            name="excludeArtist"
            value={settings.excludeArtist}
            onChange={handleSettingsChange}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
        <div
          style={{
            display: "inline-flex",
            justifyContent: "space-between",
          }}
        >
          <label>Exclude Searched Album</label>
          <select
            name="excludeAlbum"
            value={settings.excludeAlbum}
            onChange={handleSettingsChange}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
        <div
          style={{
            display: "inline-flex",
            justifyContent: "space-between",
          }}
        >
          <label>Exclude Various</label>
          <select
            name="excludeVarious"
            value={settings.excludeVarious}
            onChange={handleSettingsChange}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
        <div
          style={{
            display: "inline-flex",
            justifyContent: "space-between",
          }}
        >
          <label>Require Two Or More Contributors</label>
          <select
            name="excludeSolo"
            value={settings.excludeSolo}
            onChange={handleSettingsChange}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
      </StyledOptionsContainer>

      <ButtonWrapper>
        <StyledButton onClick={toggleSettingsModal}>Settings</StyledButton>
      </ButtonWrapper>
    </StyledSettings>
  );
};

export default Settings;
