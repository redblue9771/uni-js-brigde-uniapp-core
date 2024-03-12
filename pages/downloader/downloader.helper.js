let fileInfo = {
  url: "",
  name: "",
};

const getFileInfo = () => fileInfo;

const setFileInfo = (
  tempFileInfo = {
    url: "",
    name: "",
  }
) => {
  fileInfo = tempFileInfo;
};

const DOC_FILE_TYPES = ["doc", "xls", "ppt", "pdf", "docx", "xlsx", "pptx"];
const IMG_FILE_TYPES = ["jpg", "jpeg", "png", "gif"];

export { getFileInfo, setFileInfo, DOC_FILE_TYPES, IMG_FILE_TYPES };
