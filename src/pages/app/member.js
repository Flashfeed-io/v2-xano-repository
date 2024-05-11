import { $fetch } from "ohmyfetch";
import { createApp, reactive, nextTick } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";

const store = reactive({
  skills: [],
  profilePreviewUrl: "",
  coverPreviewUrl: "",

  fields: {
    profile_image: [],
    cover_image: [],
    headline: "",
    portfolio: "",
    showreel: "",
    description: "",
    job_listing: "",
    available: false,
    skills: []
  }
});

const getUser = async () => {
  const response = await fetch(
    "https://live.api-server.io/run/v1/6388ed5cbe9ce2e38862cd59",
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken()
      }
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
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
      headers: {
        Authorization: "Bearer " + MemberStack.getToken()
      }
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const updateFields = (res) => {
  for (const [key, value] of Object.entries(res)) {
    if (value !== null) {
      store.fields[key] = value;
    }
  }

  //  update image previews
  store.profilePreviewUrl = res?.profile_image?.[0]?.url;
  store.coverPreviewUrl = res?.cover_image?.[0]?.url;
};

const patchCheckboxes = () => {
  // fix webflow checkboxes
  const checkboxEls = document.querySelectorAll(
    "#app input[type='checkbox']:checked"
  );
  checkboxEls.forEach((el) => {
    if (
      el.previousElementSibling.classList.contains(
        "w-checkbox-input--inputType-custom"
      )
    ) {
      const customCheckboxEl = el.previousElementSibling;

      customCheckboxEl.classList.add("w--redirected-checked");
    }
  });
};

const mounted = async () => {
  store.skills = await getSkills();
  updateFields(await getUser());

  const profileImageWidget = window.uploadcare.Widget(
    '[role=uploadcare-uploader][upload-field-name="profile_image"]'
  );
  profileImageWidget.onChange((file) => {
    if (file) {
      file.done((info) => {
        // Reset the field as it only supports one image
        store.fields.profile_image = [];
        store.fields.profile_image.push({ url: info.cdnUrl });
        store.profilePreviewUrl = info.cdnUrl;
      });
    }
  });

  nextTick(() => patchCheckboxes());

  const coverImageWidget = window.uploadcare.Widget(
    '[role=uploadcare-uploader][upload-field-name="cover_image"]'
  );
  coverImageWidget.onChange((file) => {
    if (file) {
      file.done((info) => {
        // Reset the field as it only supports one image
        store.fields.cover_image = [];
        store.fields.cover_image.push({ url: info.cdnUrl });
        store.coverPreviewUrl = info.cdnUrl;
      });
    }
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

const getSkillText = (id) => {
  return store.skills.find((o) => o.airtable_id === id)?.text;
};

const app = createApp({
  // components
  WebflowFormComponent,

  // hooks
  mounted,

  // store
  store,

  // getters
  get getPrograms() {
    return store.skills.filter((skill) => skill.type === "Program");
  },
  get getSkillsets() {
    return store.skills.filter((skill) => skill.type === "Skillset");
  },
  get getRoles() {
    return store.skills.filter((skill) => skill.type === "Role");
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

  // functions
  getBackgroundStyle,
  getSkillText,
  patchCheckboxes
});

export { app };
