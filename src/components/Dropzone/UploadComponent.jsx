import { Button, Group, Text, rem } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import React from "react";
import { uploadFile } from "../../api/productAPI";
import { useSelector } from "react-redux";
import { useState } from "react";

const UploadComponent = ({ props, openRef, onUpload }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleDrop = async (acceptfiles) => {
    if (acceptfiles.length > 0) {
      onUpload(acceptfiles);
    }
  };

  return (
    <div className="dropzone">
      <Dropzone
        openRef={openRef}
        onDrop={(files) => {
          handleDrop(files);
          console.log("dropped files", files);
        }}
        onReject={(files) => console.log("rejected files", files)}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        {...props}
      >
        <Group
          position="center"
          spacing="xl"
          mih={220}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-blue-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-red-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-dimmed)",
              }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Kéo và thả hoặc chọn ảnh của bạn vào đây
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              (Tối đa 5MB)
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Group position="center" mt="md">
        <Button onClick={() => openRef.current?.()}>Chọn ảnh</Button>
      </Group>
    </div>
  );
};

export default UploadComponent;
