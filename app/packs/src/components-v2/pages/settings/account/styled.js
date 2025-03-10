import styled from "styled-components";

export const Container = styled.section`
  padding: 94px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

export const ConfirmPasswordContainer = styled.div`
  position: relative;
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`;

export const DeleteAccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
`;

export const PasswordLabelRow = styled.div`
  display: flex;

  p {
    flex-grow: 1;
  }
`;
