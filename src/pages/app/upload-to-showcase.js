import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";

const store = reactive({
  thumbnailPreviewUrl: "",
  fields: {
    title: "",
    main_thumbnail: [],
    ad_purpose: "recSL0G465hfpRlAp",
    raw_video_link: "",
    file: [],
    photo_gallery: [],
  },
});

let previousStoreState = JSON.stringify(store);

const logStoreChanges = () => {
  const currentStoreState = JSON.stringify(store);
  if (currentStoreState !== previousStoreState) {
    console.log("Store changed:", JSON.stringify(store, null, 2));
    previousStoreState = currentStoreState;
  }
};

setInterval(logStoreChanges, 500); // Check for changes every 500 milliseconds

const mounted = async () => {
  const thumbnailWidget = window.uploadcare.Widget(
    '[role=uploadcare-uploader][upload-field-name="thumbnail"]'
  );
  thumbnailWidget.onChange((file) => {
    if (file) {
      file.done((info) => {
        store.fields.main_thumbnail = [{ url: info.cdnUrl }];
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
          store.fields.file = [{ url: info.cdnUrl }];
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
    photoGalleryWidget.onChange(function (group) {
      group.files().forEach((file) => {
        file.done((fileInfo) => {
          store.fields.photo_gallery.push({ url: fileInfo.cdnUrl });
        });
      });
    });
  }

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
