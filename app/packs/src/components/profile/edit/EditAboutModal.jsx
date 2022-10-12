import React, { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import Modal from "react-bootstrap/Modal";

import { patch, get, getAuthToken } from "src/utils/requests";
import { snakeCaseObject, camelCaseObject } from "src/utils/transformObjects";
import { useTheme } from "src/contexts/ThemeContext";

import Uppy from "@uppy/core";
import { FileInput } from "@uppy/react";
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import AsyncCreatableSelect from "react-select/async-creatable";
import { components } from "react-select";

import CameraButton from "images/camera-button.png";
import DeleteButton from "images/delete-button.png";
import AboutImageLight from "images/about-image-light.png";
import AboutImageDark from "images/about-image-dark.png";
import TalentProfilePicture from "src/components/talent/TalentProfilePicture";
import TextArea from "src/components/design_system/fields/textarea";
import Divider from "src/components/design_system/other/Divider";
import Button from "src/components/design_system/button";
import UserTags from "src/components/talent/UserTags";
import { H5, P2, P3 } from "src/components/design_system/typography";

import { useWindowDimensionsHook } from "src/utils/window";

import cx from "classnames";

const EditAboutModal = ({ show, hide, talent, setTalent }) => {
  const { mobile } = useWindowDimensionsHook();
  const { mode } = useTheme();
  const [editedTalent, setEditedTalent] = useState(talent);
  const [aboutBannerFileInput, setAboutBannerFileInput] = useState(null);
  const [selectedCareerNeeds, setSelectedCareerNeeds] = useState(
    editedTalent.careerGoal.careerNeeds.map((need) => need.title)
  );

  const allCareerNeeds = [
    "Full-time roles",
    "Part-time roles",
    "Freelancing or contract roles",
    "Internships",
    "Being matched with a mentor",
    "Learning about web3",
    "Meet new people",
  ];

  const imageSrc =
    editedTalent.careerGoal.imageUrl ||
    (mode() == "light" ? AboutImageLight : AboutImageDark);

  const uppyBanner = new Uppy({
    meta: { type: "avatar" },
    restrictions: {
      maxFileSize: 5120000,
      allowedFileTypes: [".jpg", ".png", ".jpeg", ".gif"],
    },
    autoProceed: true,
  });

  uppyBanner.use(AwsS3Multipart, {
    limit: 4,
    companionUrl: "/",
    companionHeaders: {
      "X-CSRF-Token": getAuthToken(),
    },
  });

  aboutBannerFileInput?.addEventListener("change", (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      try {
        uppyBanner.addFile({
          source: "file input",
          name: file.name,
          type: file.type,
          data: file,
        });
      } catch (err) {
        if (err.isRestriction) {
          // handle restrictions
          console.log("Restriction error:", err);
        } else {
          // handle other errors
          console.error(err);
        }
      }
    });
  });

  const saveProfile = async () => {
    const talentResponse = await patch(`/api/v1/talent/${talent.id}`, {
      user: {
        ...snakeCaseObject(editedTalent.user),
      },
      talent: {
        ...snakeCaseObject(editedTalent),
      },
      career_needs: selectedCareerNeeds,
    });

    const careerGoalResponse = await patch(
      `/api/v1/talent/${editedTalent.id}/career_goals/${editedTalent.careerGoal.id}`,
      {
        talent: {
          ...snakeCaseObject(editedTalent),
        },
        career_goal: {
          ...snakeCaseObject(editedTalent.careerGoal),
        },
      }
    );

    if (talentResponse) {
      setTalent((prev) => ({
        ...prev,
        ...camelCaseObject(talentResponse),
      }));
    }

    if (careerGoalResponse) {
      setTalent((prev) => ({
        ...prev,
        careerGoal: {
          ...prev.careerGoal,
          ...camelCaseObject(careerGoalResponse),
        },
      }));
    }

    hide();
  };

  useEffect(() => {
    uppyBanner.on("restriction-failed", () => {
      uppyBanner.reset();
    });
    uppyBanner.on("upload-success", (file, response) => {
      setEditedTalent((prev) => ({
        ...prev,
        careerGoal: {
          ...prev.careerGoal,
          imageUrl: response.uploadURL,
          imageData: {
            id: response.uploadURL.match(/\/cache\/([^\?]+)/)[1], // extract key without prefix
            storage: "cache",
            metadata: {
              size: file.size,
              filename: file.name,
              mime_type: file.type,
            },
          },
        },
      }));
    });
    uppyBanner.on("upload", () => {});
  }, [uppyBanner]);

  useEffect(() => {
    if (show) {
      setAboutBannerFileInput(document.getElementById("aboutBannerFileInput"));
    } else {
      setEditedTalent(talent);
    }
  }, [show]);

  const changeCareerGoalAttribute = (attribute, value) => {
    setEditedTalent((prev) => ({
      ...prev,
      careerGoal: {
        ...prev.careerGoal,
        [attribute]: value,
      },
    }));
  };

  const deleteBannerImg = () => {
    setEditedTalent((prev) => ({
      ...prev,
      careerGoal: {
        ...prev.careerGoal,
        imageUrl: null,
        imageData: null,
      },
    }));
  };

  const changeSelectedCareerNeeds = (tag) => {
    if (selectedCareerNeeds.includes(tag)) {
      const array = selectedCareerNeeds;
      const index = array.indexOf(tag);
      array.splice(index, 1);
      setSelectedCareerNeeds([...array]);
    } else {
      setSelectedCareerNeeds((prev) => [...prev, tag]);
    }
  };

  return (
    <Modal
      scrollable={true}
      show={show}
      onHide={hide}
      centered
      dialogClassName={mobile ? "mw-100 mh-100 m-0" : "remove-background"}
      contentClassName={mobile ? "h-100" : ""}
      fullscreen="true"
      className="edit-modal"
    >
      <Modal.Header closeButton className="px-5">
        <H5 bold text="Edit I'm Open to" />
      </Modal.Header>
      <Divider />
      <Modal.Body
        className={cx(
          "d-flex flex-column align-items-center justify-content-between",
          mobile ? "px-4 pt-4 pb-7" : "px-6 pt-5 pb-6"
        )}
        style={{ maxHeight: mobile ? "" : "700px", overflowY: "overlay" }}
      >
        <div className="d-flex align-items-center position-relative mb-5">
          <TalentProfilePicture
            className="position-relative cursor-pointer"
            style={{ borderRadius: "24px" }}
            src={imageSrc}
            straight
            height={mobile ? 257 : 332}
            width={mobile ? 328 : 424}
          />
          <div className="edit-image" style={{ borderRadius: "24px" }}></div>
          <label htmlFor="aboutBannerFileInput">
            <TalentProfilePicture
              className="position-absolute cursor-pointer"
              style={{
                top: mobile ? "110px" : "145px",
                left: mobile ? "115px" : "160px",
              }}
              src={CameraButton}
              height={40}
            />
          </label>
          <input
            id="aboutBannerFileInput"
            className="d-none"
            type="file"
            accept=".jpg,.png,.jpeg"
          ></input>
          <button
            className="button-link position-absolute"
            style={{
              top: mobile ? "110px" : "145px",
              left: mobile ? "165px" : "210px",
            }}
            onClick={deleteBannerImg}
          >
            <TalentProfilePicture
              className="cursor-pointer"
              src={DeleteButton}
              height={40}
            />
          </button>
        </div>
        <div className="w-100 mb-5">
          <div className="d-flex justify-content-between align-items-center">
            <P2 className="text-primary-01" bold text="About" />
            <div className="d-flex">
              <P3
                className="text-primary-01"
                bold
                text={editedTalent.careerGoal.pitch?.length || 0}
              />
              <P3 className="text-primary-04" bold text="/240" />
            </div>
          </div>
          <TextArea
            className="mb-2"
            onChange={(e) => changeCareerGoalAttribute("pitch", e.target.value)}
            value={editedTalent.careerGoal.pitch || ""}
            maxLength={70}
            rows={3}
          />
          <P2 className="text-primary-04" text="Short caption" />
        </div>
        <div className="w-100 mb-5">
          <P2 className="text-primary-01 mb-2" bold text="I'm open to" />
          <UserTags
            tags={allCareerNeeds}
            tagsSelected={selectedCareerNeeds}
            className="mr-2 mb-4"
            clickable={false}
            onClick={(tag) => changeSelectedCareerNeeds(tag)}
          />
        </div>
      </Modal.Body>
      <Divider />
      <Modal.Footer className="px-6 py-3" style={{ borderTop: "none" }}>
        <Button type="white-ghost" text="Cancel" onClick={hide} />
        <Button type="primary-default" text="Save" onClick={saveProfile} />
      </Modal.Footer>
    </Modal>
  );
};

export default EditAboutModal;
