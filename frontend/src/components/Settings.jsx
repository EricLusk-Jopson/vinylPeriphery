import React from "react";
import {
  ButtonWrapper,
  StyledButton,
  StyledOptionsContainer,
  StyledSettings,
  StyledSelect,
  StyledOption,
  StyledSettingGroup,
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
        <h3>Search Modifiers</h3>
        <StyledSettingGroup>
          <label>Search Type</label>
          <StyledSelect
            name="searchType"
            value={settings.searchType}
            onChange={handleSettingsChange}
          >
            <StyledOption value="fast">Fast</StyledOption>
            <StyledOption value="comprehensive">Comprehensive</StyledOption>
          </StyledSelect>
        </StyledSettingGroup>
        <StyledSettingGroup>
          <label>Exclude Production Staff</label>
          <StyledSelect
            name="excludeProduction"
            value={settings.excludeProduction}
            onChange={handleSettingsChange}
          >
            <StyledOption value={true}>Yes</StyledOption>
            <StyledOption value={false}>No</StyledOption>
          </StyledSelect>
        </StyledSettingGroup>
        <hr />
        <h3>Result Filters</h3>
        <StyledSettingGroup>
          <label>Exclude Searched Artist</label>
          <StyledSelect
            name="excludeArtist"
            value={settings.excludeArtist}
            onChange={handleSettingsChange}
          >
            <StyledOption value={true}>Yes</StyledOption>
            <StyledOption value={false}>No</StyledOption>
          </StyledSelect>
        </StyledSettingGroup>
        <StyledSettingGroup>
          <label>Exclude Searched Album</label>
          <StyledSelect
            name="excludeAlbum"
            value={settings.excludeAlbum}
            onChange={handleSettingsChange}
          >
            <StyledOption value={true}>Yes</StyledOption>
            <StyledOption value={false}>No</StyledOption>
          </StyledSelect>
        </StyledSettingGroup>
        <StyledSettingGroup>
          <label>Exclude Various</label>
          <StyledSelect
            name="excludeVarious"
            value={settings.excludeVarious}
            onChange={handleSettingsChange}
          >
            <StyledOption value={true}>Yes</StyledOption>
            <StyledOption value={false}>No</StyledOption>
          </StyledSelect>
        </StyledSettingGroup>
        <StyledSettingGroup>
          <label>Require Two Or More Contributors</label>
          <StyledSelect
            name="excludeSolo"
            value={settings.excludeSolo}
            onChange={handleSettingsChange}
          >
            <StyledOption value={true}>Yes</StyledOption>
            <StyledOption value={false}>No</StyledOption>
          </StyledSelect>
        </StyledSettingGroup>
      </StyledOptionsContainer>

      <ButtonWrapper>
        <StyledButton onClick={toggleSettingsModal}>
          {"settings.settings.settings.settings.settings.settings.settings."}
        </StyledButton>
      </ButtonWrapper>
    </StyledSettings>
  );
};

export default Settings;
