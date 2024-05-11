import { $fetch } from "ohmyfetch";
import { createApp, reactive } from "petite-vue";
import { WebflowFormComponent } from "../../components/WebflowFormComponent";

const store = reactive({
  memberObject: {},
  member_id: "",
  fields: {
    member_id: "",
  },
});

MemberStack.onReady.then(function (member) {
  store.member_id = member.id;
  store.fields.member_id = member.id;
});

const getMemberData = async () => {
  console.log("Checking -> store.member_id", store.member_id);
  const response = await fetch(
    "https://x6c9-ohwk-nih4.n7d.xano.io/api:QLDf95Yy/user/" + store.member_id,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken(),
      },
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  console.log("Checking -> : data", data);
  return data;
};

const mounted = async () => {
  store.memberObject = await getMemberData();
  console.log("Checking -> memberObject:", store.memberObject);
  window.console.log("Mounted");
};

const app = createApp({
  // exposed to all expressions
  mounted,
  store,
  getMemberData,
  WebflowFormComponent,
});

export { app };
