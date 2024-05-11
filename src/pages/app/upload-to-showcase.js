import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";
import Quill from "quill";

const quillOptions = { theme: "snow" };

const editorDescription = new Quill("#description", quillOptions);

const store = reactive({
  thumbnailPreviewUrl: "",
  fields: {
    title: "",
    main_thumbnail: "",
    ad_purpose: "recSL0G465hfpRlAp",
    raw_video_link: "",
  },
});




const mounted = async () => {
  const thumbnailWidget = window.uploadcare.Widget(
    '[role=uploadcare-uploader][upload-field-name="thumbnail"]'
  );
  thumbnailWidget.onChange((file) => {
    if (file) {
      file.done((info) => {
        // Reset the field as it only supports one image
        store.fields.main_thumbnail = [];
        store.fields.main_thumbnail.push({ url: info.cdnUrl });
        store.thumbnailPreviewUrl = info.cdnUrl;
      });
    }
  });

  if (
    document.querySelector(
      '[role=uploadcare-uploader][upload-field-name="file"]'
    )
  ) {
    const fileWidget = window.uploadcare.Widget(
      '[role=uploadcare-uploader][upload-field-name="file"]'
    );
    fileWidget.onChange((file) => {
      if (file) {
        file.done((info) => {
          // Reset the field as it only supports one image
          store.fields.file = [];
          store.fields.file.push({ url: info.cdnUrl });
        });
      }
    });
  }

  if (
    document.querySelector(
      '[role=uploadcare-uploader][upload-field-name="gallery"]'
    )
  ) {
    const photoGalleryWidget = window.uploadcare.MultipleWidget(
      '[role=uploadcare-uploader][upload-field-name="gallery"]'
    );
    // listen to the "change" event
    photoGalleryWidget.onChange(function (group) {
      // get a list of file instances
      group.files().forEach((file) => {
        // once each file is uploaded, get its CDN URL from the fileInfo object
        file.done((fileInfo) => {
          store.fields.photo_gallery.push({ url: fileInfo.cdnUrl });
        });
      });
    });
  }

  editorDescription.on("text-change", function (delta, oldDelta, source) {
    store.fields.description =
      editorDescription.container.children[0].innerHTML;
  });

  window.console.log("Mounted");
};

const getBackgroundStyle = (url) => {
  let styles = {};
  if (url !== "") {
    styles = { backgroundImage: `url(${url})` };
  }
  return styles;
};

const app = createApp({
  // hooks
  mounted,

  // store
  store,

  // components
  WebflowFormComponent,

  // helpers
  getBackgroundStyle,
});

export { app };
