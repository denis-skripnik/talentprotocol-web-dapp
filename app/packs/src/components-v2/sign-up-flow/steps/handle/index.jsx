import React, { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { Input, Typography } from "@talentprotocol/design-system";
import { Row, Form, TitleRow } from "./styled";
import { validations } from "src/api/validations";

export const HandleStep = ({ user, setUser, isNextDisabled, setIsNextDisable }) => {
  const [handleError, setHandleError] = useState("");
  const handleRef = useRef(null);

  const debouncedUsernameLookup = debounce(() => {
    const handle = handleRef.current?.value?.toLowerCase();
    if (!handle) {
      return;
    }

    validations
      .validateHandle(handle)
      .then(({ data }) => {
        if (data.error) {
          setHandleError(data.error);
          setIsNextDisable(true);
        } else {
          setHandleError("");
          setIsNextDisable(false);
          setUser({
            ...user,
            handle
          });
        }
      })
      .catch(() => {
        setHandleError("Something happened");
        setIsNextDisable(true);
      });
  }, 200);

  const validateStep = useCallback(() => {
    debouncedUsernameLookup();
  }, [handleRef, setHandleError, setUser, user]);
  useEffect(() => {
    if (user.handle) {
      validateStep();
    }
  }, [user, isNextDisabled]);
  return (
    <>
      <TitleRow>
        <Typography specs={{ variant: "h3", type: "bold" }} color="primary01">
          Choose your username.
        </Typography>
        <Typography specs={{ variant: "p2", type: "regular" }} color="primary03">
          Your username on Talent Protocol and you'll be also able to claim it as your domain.
        </Typography>
      </TitleRow>
      <Form onSubmit={e => e.preventDefault()}>
        <Row>
          <Typography specs={{ variant: "p2", type: "bold" }} color="primary01">
            Username
          </Typography>
          <Input
            placeholder="johndoe"
            defaultValue={user.handle}
            inputRef={handleRef}
            hasError={!!handleError}
            onChange={validateStep}
            onBlur={validateStep}
            shortDescription={handleError}
            forceLowerCase
          />
        </Row>
      </Form>
    </>
  );
};
