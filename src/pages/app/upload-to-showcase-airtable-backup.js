import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";
import Quill from "quill";

const quillOptions = { theme: "snow" };

const editorDescription = new Quill("#description", quillOptions);

const store = reactive({
  industries: [],
  genre_for_video: [],
  genre_for_photo: [],
  skills: [],
  categories: [],
  creativeStyles: [],

  thumbnailPreviewUrl: "",
  fields: {
    title: "",
    description: "",
    main_thumbnail: "",
    content_type: "Video",
    ad_purpose: "recSL0G465hfpRlAp",
    raw_video_link: "",
    photo_gallery: [],
    categories: [],
    skills: [],
    creative_styles: [],
    file: [],
  },
});

const getCategories = async () => {
  const response = await fetch(
    "https://live.api-server.io/run/v1/637f637aed8a764d89fd708d",
    {
      method: "GET",
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured getCategories: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const getSkills = async () => {
  const response = await fetch(
    "https://live.api-server.io/run/v1/637f6935ed8a764d89fd7096",
    {
      method: "GET",
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured getSkills: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const getCreativeStyles = async () => {
  const response = await fetch(
    "https://live.api-server.io/run/v1/63247325f53f9b56f2a69a16",
    {
      method: "GET",
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured getCreativeStyles: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const mounted = async () => {
  store.categories = await getCategories();
  store.creativeStyles = await getCreativeStyles();
  store.skills = await getSkills();

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

  // getters
  get getIndustries() {
    return store.categories.filter((category) => category.type === "Industry");
  },
  get getGenreForVideo() {
    return store.categories.filter(
      (category) => category.type === "Genre for Video"
    );
  },
  get getGenreForPhoto() {
    return store.categories.filter(
      (category) => category.type === "Genre for Photo"
    );
  },
  get getPrograms() {
    return store.skills.filter((skill) => skill.type === "Program");
  },
  get getSkillsets() {
    return store.skills.filter((skill) => skill.type === "Skillset");
  },
  get getRoles() {
    return store.skills.filter((skill) => skill.type === "Role");
  },

  get getCheckedIndustries() {
    return this.getIndustries.filter((category) =>
      store.fields.categories.includes(category.id)
    );
  },
  get getCheckedGenreForVideo() {
    return this.getGenreForVideo.filter((category) =>
      store.fields.categories.includes(category.id)
    );
  },
  get getCheckedGenreForPhoto() {
    return this.getGenreForPhoto.filter((category) =>
      store.fields.categories.includes(category.id)
    );
  },
  get getCheckedPrograms() {
    return this.getPrograms.filter((skill) =>
      store.fields.skills.includes(skill.airtable_id)
    );
  },
  get getCheckedSkillsets() {
    return this.getSkillsets.filter((skill) =>
      store.fields.skills.includes(skill.airtable_id)
    );
  },
  get getCheckedRoles() {
    return this.getRoles.filter((skill) =>
      store.fields.skills.includes(skill.airtable_id)
    );
  },

  // Old removed before demo
  // get getCheckedCreativeStyles() {
  //   return store.fields.creative_styles.map((style) => {
  //     return { id: style.id, text: style.text };
  //   });
  // }

  get getCheckedCreativeStyles() {
    return store.creativeStyles.filter((skill) =>
      store.fields.creative_styles.includes(skill.id)
    );
  },
});

export { app };
